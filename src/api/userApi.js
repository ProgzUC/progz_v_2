import axiosInstance from './axiosInstance';

export const fetchPendingUsers = () =>
    axiosInstance.get("/users/pending").then((res) => res.data);

export const fetchAllUsers = () =>
    axiosInstance.get("/users/allUsers").then((res) => res.data);

export const approveUser = (id) =>
    axiosInstance.post(`/users/approve/${id}`).then((res) => res.data);

export const rejectUser = (id) =>
    axiosInstance.delete(`/users/pending/${id}`).then((res) => res.data);

export const deleteUser = (id) =>
    axiosInstance.delete(`/users/${id}`).then((res) => res.data);

export const triggerManualSync = () =>
    axiosInstance.post("/sync/manual").then((res) => res.data);

export const fetchSyncLogs = (params) =>
    axiosInstance.get("/sync/logs", { params }).then((res) => res.data);

export const fetchSyncStatus = () =>
    axiosInstance.get("/sync/status").then((res) => res.data);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Poll until the target (or latest) sync leaves in_progress (or timeout). */
export const waitForSyncCompletion = async ({
    logId,
    intervalMs = 2000,
    timeoutMs = 5 * 60 * 1000,
} = {}) => {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
        const status = await fetchSyncStatus();
        const matchesLog =
            !logId ||
            (status?._id && String(status._id) === String(logId));

        if (matchesLog && status?.status && status.status !== "in_progress") {
            return status;
        }
        await sleep(intervalMs);
    }
    throw new Error(
        "Sync is still running. Check the Sync page or Monitoring shortly."
    );
};

/** Start sync (background) and wait for completion via status polling. */
export const runManualSyncAndWait = async () => {
    try {
        const start = await triggerManualSync();
        // Legacy servers that still finish sync before responding
        if (start?.status === "success" || start?.status === "failure") {
            return start.log || start;
        }
        return waitForSyncCompletion({ logId: start?.logId });
    } catch (err) {
        // 409 = already in progress — poll that run
        if (err.status !== 409) throw err;
        return waitForSyncCompletion();
    }
};

export const registerUser = (payload) =>
    axiosInstance.post("/users/register", payload).then((res) => res.data);

export const adminCreateUser = (payload) =>
    axiosInstance.post("/users/admin-create", payload).then((res) => res.data);

const randomTempPassword = () => {
    const bytes = new Uint8Array(18);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").slice(0, 24);
};

const CREATE_CONCURRENCY = 5;
const BULK_IMPORT_TIMEOUT_MS = 180000;

const mapWithConcurrency = async (items, limit, worker) => {
    const results = new Array(items.length);
    let nextIndex = 0;

    const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (nextIndex < items.length) {
            const index = nextIndex;
            nextIndex += 1;
            results[index] = await worker(items[index], index);
        }
    });

    await Promise.all(runners);
    return results;
};

/**
 * Reliable path using APIs that are already live:
 * admin-create each new student + batches/:id/bulk-enroll.
 * Welcome emails (password setup links) are sent in parallel and never block assign.
 */
const bulkImportStudentsFallback = async ({
    batchId,
    students = [],
    sendWelcomeEmails = false,
}) => {
    const { bulkEnrollStudents } = await import("./batchApi.js");
    const { forgotPassword } = await import("./authApi.js");

    const summary = {
        totalStudents: students.length,
        successfullyCreated: 0,
        alreadyExisting: 0,
        successfullyAssigned: 0,
        alreadyAssigned: 0,
        welcomeEmailsSent: 0,
        failedRecords: 0,
    };
    const errors = [];
    const enrollEmails = [];

    await mapWithConcurrency(students, CREATE_CONCURRENCY, async (row, i) => {
        const rowNum = i + 1;
        const email = String(row?.email || "").trim().toLowerCase();
        const name = String(row?.name || "").trim() || email.split("@")[0] || "Student";

        if (!email) {
            summary.failedRecords += 1;
            errors.push({ row: rowNum, email: row?.email || "", reason: "Email is required" });
            return;
        }

        try {
            await adminCreateUser({
                name,
                email,
                role: "student",
                password: randomTempPassword(),
                source: "bulk_import",
            });
            summary.successfullyCreated += 1;
            enrollEmails.push(email);
        } catch (err) {
            const msg = String(err?.message || "");
            if (/already exists/i.test(msg)) {
                summary.alreadyExisting += 1;
                enrollEmails.push(email);
            } else {
                summary.failedRecords += 1;
                errors.push({ row: rowNum, email, reason: msg || "Failed to create student" });
            }
        }
    });

    if (enrollEmails.length > 0) {
        try {
            const enrollResult = await bulkEnrollStudents({
                batchId,
                emails: enrollEmails,
            });
            summary.successfullyAssigned = enrollResult?.enrolledCount ?? 0;
            summary.alreadyAssigned = Math.max(
                0,
                enrollEmails.length - (enrollResult?.enrolledCount ?? 0)
            );
            if (Array.isArray(enrollResult?.errors)) {
                enrollResult.errors.forEach((reason) => {
                    errors.push({ row: null, email: "", reason: String(reason) });
                });
            }
        } catch (err) {
            summary.failedRecords += enrollEmails.length;
            errors.push({
                row: null,
                email: "",
                reason: err?.message || "Failed to assign students to batch",
            });
        }
    }

    // Fire emails after assign so SMTP slowness cannot fail the import UI.
    if (sendWelcomeEmails && enrollEmails.length > 0) {
        const mailResults = await Promise.allSettled(
            enrollEmails.map((email) => forgotPassword({ email }))
        );
        summary.welcomeEmailsSent = mailResults.filter((r) => r.status === "fulfilled").length;
        mailResults.forEach((result, idx) => {
            if (result.status === "rejected") {
                errors.push({
                    row: null,
                    email: enrollEmails[idx],
                    reason: `Account ready but welcome email failed: ${
                        result.reason?.message || "send failed"
                    }`,
                });
            }
        });
    }

    return {
        msg: "Bulk student import completed",
        summary,
        errors,
        usedFallback: true,
    };
};

const isRetryableBulkImportError = (err) => {
    const status = err?.status ?? err?.response?.status;
    const message = String(err?.message || "").toLowerCase();
    return (
        status === 404 ||
        status === 408 ||
        status === 502 ||
        status === 503 ||
        status === 504 ||
        message.includes("timeout") ||
        message.includes("network error")
    );
};

/**
 * Bulk create/assign students to a batch and send welcome emails.
 *
 * Live API historically hangs on /users/bulk-import when SMTP runs in-request,
 * so we use the proven create+enroll path directly. When the async bulk-import
 * backend is deployed, set VITE_USE_BULK_IMPORT_API=true to prefer it.
 */
export const bulkImportStudents = async (payload) => {
    const preferDedicated =
        String(import.meta.env.VITE_USE_BULK_IMPORT_API || "").toLowerCase() === "true";

    if (!preferDedicated) {
        return bulkImportStudentsFallback(payload);
    }

    try {
        const res = await axiosInstance.post("/users/bulk-import", payload, {
            timeout: BULK_IMPORT_TIMEOUT_MS,
        });
        return res.data;
    } catch (err) {
        if (!isRetryableBulkImportError(err)) throw err;
        return bulkImportStudentsFallback(payload);
    }
};

/* Recycle Bin APIs */
export const fetchBinItems = () =>
    axiosInstance.get("/bin").then((res) => res.data);

export const restoreBinItem = (id) =>
    axiosInstance.post(`/bin/${id}/restore`).then((res) => res.data);

export const permanentlyDeleteBinItem = (id) =>
    axiosInstance.delete(`/bin/${id}`).then((res) => res.data);

export const updateUser = (id, data) =>
    axiosInstance.put(`/users/${id}`, data).then((res) => res.data);
