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

/**
 * Bulk create/assign students to a batch and send welcome magic-login emails.
 * payload: { batchId, students: [{ name?, email }], sendWelcomeEmails? }
 */
export const bulkImportStudents = (payload) =>
    axiosInstance.post("/users/bulk-import", payload).then((res) => res.data);

/* Recycle Bin APIs */
export const fetchBinItems = () =>
    axiosInstance.get("/bin").then((res) => res.data);

export const restoreBinItem = (id) =>
    axiosInstance.post(`/bin/${id}/restore`).then((res) => res.data);

export const permanentlyDeleteBinItem = (id) =>
    axiosInstance.delete(`/bin/${id}`).then((res) => res.data);

export const updateUser = (id, data) =>
    axiosInstance.put(`/users/${id}`, data).then((res) => res.data);
