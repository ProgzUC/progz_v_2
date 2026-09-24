import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import AppSelect from "../../../components/common/AppSelect/AppSelect";
import Loader from "../../../components/common/Loader/Loader";
import { useBatches } from "../../../hooks/useBatches";
import { useBulkImportStudents } from "../../../hooks/useAdminUsers";
import { getErrorMessage } from "../../../utils/apiError";
import {
  parseStudentRowsFromCsv,
  parseStudentRowsFromExcel,
  parseStudentRowsFromPaste,
  downloadBulkImportCsvTemplate,
} from "../../../utils/csvImport";
import "./BulkStudentImport.css";

const isExcelFile = (file) => {
  const name = (file?.name || "").toLowerCase();
  return name.endsWith(".xlsx") || name.endsWith(".xls");
};

/**
 * Bulk create/assign students + optional welcome / password-setup emails.
 * @param {{ embedded?: boolean, batchId?: string, onBatchIdChange?: (id: string) => void }} props
 */
const BulkStudentImport = ({
  embedded = false,
  batchId: controlledBatchId,
  onBatchIdChange,
} = {}) => {
  const [searchParams] = useSearchParams();
  const batchParam = searchParams.get("batchId") || "";

  const { data: batchesData, isLoading: batchesLoading } = useBatches();
  const { mutateAsync: importStudents, isPending: isImporting } = useBulkImportStudents();

  const batchesList = Array.isArray(batchesData) ? batchesData : [];

  const isControlled = controlledBatchId !== undefined;
  const [internalBatchId, setInternalBatchId] = useState(batchParam || "");
  const batchId = isControlled ? controlledBatchId || "" : internalBatchId;

  const setBatchId = (next) => {
    if (isControlled) onBatchIdChange?.(next);
    else setInternalBatchId(next);
  };

  const [inputMode, setInputMode] = useState("upload");
  const [students, setStudents] = useState([]);
  const [fileName, setFileName] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [sendWelcomeEmails, setSendWelcomeEmails] = useState(true);
  const [summary, setSummary] = useState(null);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (isControlled) return;
    if (batchParam) setInternalBatchId(batchParam);
  }, [batchParam, isControlled]);

  const selectedBatch = useMemo(
    () => batchesList.find((b) => String(b._id) === String(batchId)),
    [batchesList, batchId]
  );

  const batchOptions = useMemo(
    () =>
      batchesList.map((b) => ({
        value: String(b._id),
        label: `${b.name}${
          b.course?.courseName || b.course?.title
            ? ` · ${b.course?.courseName || b.course?.title}`
            : ""
        }`,
      })),
    [batchesList]
  );

  const applyRows = (rows, sourceLabel) => {
    setStudents(rows);
    setSummary(null);
    setErrors([]);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: rows.length ? "success" : "warning",
      title: rows.length
        ? `Loaded ${rows.length} students from ${sourceLabel}`
        : `No valid emails found in ${sourceLabel}`,
      showConfirmButton: false,
      timer: 2800,
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsParsing(true);

    if (isExcelFile(file)) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          applyRows(parseStudentRowsFromExcel(event.target.result), file.name);
        } catch {
          Swal.fire("Error", "Failed to parse Excel file.", "error");
        } finally {
          setIsParsing(false);
        }
      };
      reader.onerror = () => {
        setIsParsing(false);
        Swal.fire("Error", "Could not read the selected file.", "error");
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          applyRows(parseStudentRowsFromCsv(event.target.result), file.name);
        } catch {
          Swal.fire("Error", "Failed to parse CSV file.", "error");
        } finally {
          setIsParsing(false);
        }
      };
      reader.onerror = () => {
        setIsParsing(false);
        Swal.fire("Error", "Could not read the selected file.", "error");
      };
      reader.readAsText(file);
    }

    e.target.value = "";
  };

  const handleParsePaste = () => {
    applyRows(parseStudentRowsFromPaste(pasteText), "paste");
  };

  const handleClear = () => {
    setStudents([]);
    setFileName("");
    setPasteText("");
    setSummary(null);
    setErrors([]);
  };

  const handleImport = async () => {
    if (!batchId) {
      Swal.fire("Select a batch", "Choose the batch/course to assign students to.", "warning");
      return;
    }
    if (!students.length) {
      Swal.fire("No students", "Upload a CSV/Excel file or paste student emails first.", "warning");
      return;
    }

    const confirm = await Swal.fire({
      title: "Import & Assign?",
      html: `<p>Create/assign <b>${students.length}</b> student${students.length === 1 ? "" : "s"} to <b>${
        selectedBatch?.name || "selected batch"
      }</b>${sendWelcomeEmails ? " and send password setup emails" : ""}.</p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Import & Assign",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    try {
      const result = await importStudents({
        batchId,
        students,
        sendWelcomeEmails,
      });
      setSummary(result.summary || null);
      setErrors(Array.isArray(result.errors) ? result.errors : []);

      const s = result.summary || {};
      await Swal.fire({
        title: "Import complete",
        html: `
          <div style="text-align:left;font-size:14px;line-height:1.6">
            <div>Total students: <b>${s.totalStudents ?? students.length}</b></div>
            <div>Successfully created: <b>${s.successfullyCreated ?? 0}</b></div>
            <div>Already existing: <b>${s.alreadyExisting ?? 0}</b></div>
            <div>Successfully assigned: <b>${s.successfullyAssigned ?? 0}</b></div>
            <div>Welcome emails sent: <b>${s.welcomeEmailsSent ?? s.welcomeEmailsQueued ?? 0}</b></div>
            <div>Failed records: <b>${s.failedRecords ?? 0}</b></div>
          </div>
        `,
        icon: (s.failedRecords || 0) > 0 ? "warning" : "success",
      });
    } catch (err) {
      Swal.fire("Import failed", getErrorMessage(err, "Could not import students"), "error");
    }
  };

  if (batchesLoading && !embedded) {
    return (
      <div className="bulk-import-page">
        <Loader />
      </div>
    );
  }

  const layout = (
    <div className={`bulk-import-layout ${embedded ? "embedded" : ""}`}>
      <section className={`bulk-import-panel ${embedded ? "embedded-panel" : ""}`}>
        <div className="panel-header">
          <h2>1. Add students</h2>
          <div className="mode-pills">
            <button
              type="button"
              className={`mode-pill ${inputMode === "upload" ? "active" : ""}`}
              onClick={() => setInputMode("upload")}
            >
              Upload CSV / Excel
            </button>
            <button
              type="button"
              className={`mode-pill ${inputMode === "paste" ? "active" : ""}`}
              onClick={() => setInputMode("paste")}
            >
              Paste emails
            </button>
          </div>
        </div>

        {inputMode === "upload" ? (
          <div className="upload-zone">
            <input
              id="bulk-import-file"
              type="file"
              accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={handleFileUpload}
              disabled={isParsing || isImporting}
            />
            <label htmlFor="bulk-import-file" className="upload-label">
              <i className="bi bi-cloud-upload" aria-hidden="true" />
              <span>{fileName || "Choose CSV or Excel file"}</span>
              <small>Columns: Student Name, Email</small>
            </label>
            <button type="button" className="link-btn" onClick={downloadBulkImportCsvTemplate}>
              Download template
            </button>
          </div>
        ) : (
          <div className="paste-zone">
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={
                "Ada Lovelace, ada@college.edu\nalan@college.edu\nGrace Hopper <grace@college.edu>"
              }
              rows={8}
              disabled={isImporting}
            />
            <button
              type="button"
              className="secondary-btn"
              onClick={handleParsePaste}
              disabled={isImporting}
            >
              Parse pasted list
            </button>
          </div>
        )}

        <div className="panel-header panel-header-spaced">
          <h2>2. Select batch / course</h2>
        </div>
        <AppSelect
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          options={[{ value: "", label: "Select batch to assign" }, ...batchOptions]}
          placeholder="Select batch to assign"
          disabled={isImporting}
          aria-label="Select batch"
        />
        {selectedBatch && (
          <p className="batch-hint">
            Assigning to <strong>{selectedBatch.name}</strong>
            {selectedBatch.students?.length != null
              ? ` · currently ${selectedBatch.students.length} students`
              : ""}
          </p>
        )}

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={sendWelcomeEmails}
            onChange={(e) => setSendWelcomeEmails(e.target.checked)}
            disabled={isImporting}
          />
          Send welcome email with password setup link to each student
        </label>

        <div className="action-row">
          <button
            type="button"
            className="primary-btn"
            onClick={handleImport}
            disabled={isImporting || isParsing || !students.length || !batchId}
          >
            {isImporting ? "Importing…" : "Import & Assign"}
          </button>
          <button type="button" className="secondary-btn" onClick={handleClear} disabled={isImporting}>
            Clear
          </button>
        </div>
      </section>

      <section className={`bulk-import-panel preview-panel ${embedded ? "embedded-panel" : ""}`}>
        <div className="panel-header">
          <h2>Preview ({students.length})</h2>
          {isParsing && <span className="parsing-badge">Parsing…</span>}
        </div>

        {students.length === 0 ? (
          <div className="empty-preview">
            <p>No students loaded yet. Upload a file or paste emails to preview the list.</p>
          </div>
        ) : (
          <div className="preview-table-wrap">
            <table className="preview-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, idx) => (
                  <tr key={`${s.email}-${idx}`}>
                    <td>{idx + 1}</td>
                    <td>{s.name || "—"}</td>
                    <td>{s.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {summary && (
          <div className="import-summary">
            <h3>Import summary</h3>
            <ul>
              <li>
                <span>Total students</span>
                <strong>{summary.totalStudents}</strong>
              </li>
              <li>
                <span>Successfully created</span>
                <strong>{summary.successfullyCreated}</strong>
              </li>
              <li>
                <span>Already existing</span>
                <strong>{summary.alreadyExisting}</strong>
              </li>
              <li>
                <span>Successfully assigned</span>
                <strong>{summary.successfullyAssigned}</strong>
              </li>
              <li>
                <span>Already assigned</span>
                <strong>{summary.alreadyAssigned ?? 0}</strong>
              </li>
              <li>
                <span>Welcome emails sent</span>
                <strong>{summary.welcomeEmailsSent}</strong>
              </li>
              <li>
                <span>Failed records</span>
                <strong className={summary.failedRecords ? "fail" : ""}>
                  {summary.failedRecords}
                </strong>
              </li>
            </ul>
          </div>
        )}

        {errors.length > 0 && (
          <div className="import-errors">
            <h3>Errors / notes</h3>
            <ul>
              {errors.map((err, idx) => (
                <li key={`${err.email}-${idx}`}>
                  <span className="err-email">{err.email || `Row ${err.row}`}</span>
                  <span className="err-reason">{err.reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );

  if (embedded) {
    return <div className="bulk-import-embedded">{layout}</div>;
  }

  return (
    <div className="bulk-import-page">
      <div className="page-hero">
        <h1 className="page-title">Bulk Student Import</h1>
        <p className="page-subtitle">
          Upload or paste student emails, assign them to a batch, and grant Student Dashboard access
          with passwordless login links — no manual passwords required.
        </p>
      </div>
      {layout}
    </div>
  );
};

export default BulkStudentImport;
