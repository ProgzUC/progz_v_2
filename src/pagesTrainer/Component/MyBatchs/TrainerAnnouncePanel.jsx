import React, { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
  createTrainerBatchAnnouncement,
  deleteTrainerBatchAnnouncement,
  fetchTrainerBatchAnnouncements,
  updateTrainerBatchAnnouncement,
} from "../../../api/trainerApi";
import "./TrainerAnnouncePanel.css";

const studentKey = (student) => String(student?._id || student?.id || "");

export default function TrainerAnnouncePanel({ batchId, students = [] }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [selected, setSelected] = useState(() => new Set());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");

  const loadItems = useCallback(async () => {
    if (!batchId) return;
    const data = await fetchTrainerBatchAnnouncements(batchId);
    setItems(data?.items || []);
  }, [batchId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchTrainerBatchAnnouncements(batchId)
      .then((data) => {
        if (!cancelled) setItems(data?.items || []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [batchId]);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
      const name = String(s.name || s.firstName || "").toLowerCase();
      const email = String(s.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [students, search]);

  const allVisibleSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((s) => selected.has(studentKey(s)));

  const toggleStudent = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        filteredStudents.forEach((s) => next.delete(studentKey(s)));
      } else {
        filteredStudents.forEach((s) => {
          const id = studentKey(s);
          if (id) next.add(id);
        });
      }
      return next;
    });
  };

  const publish = async () => {
    if (!title.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Title required",
        text: "Add a short title for the announcement.",
        confirmButtonColor: "#0B3D2E",
      });
      return;
    }
    if (selected.size === 0) {
      Swal.fire({
        icon: "warning",
        title: "Select students",
        text: "Pick at least one student to notify.",
        confirmButtonColor: "#0B3D2E",
      });
      return;
    }

    setSending(true);
    try {
      const result = await createTrainerBatchAnnouncement(batchId, {
        title: title.trim(),
        body: body.trim(),
        studentIds: [...selected],
        sendEmail,
      });
      setTitle("");
      setBody("");
      setSelected(new Set());
      await Swal.fire({
        icon: "success",
        title: "Announcement sent",
        text: result?.message || "Students have been notified.",
        timer: 2200,
        showConfirmButton: false,
        confirmButtonColor: "#0B3D2E",
      });
      await loadItems();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Could not send",
        text: err.response?.data?.message || err.message || "Failed to publish announcement",
        confirmButtonColor: "#0B3D2E",
      });
    } finally {
      setSending(false);
    }
  };

  const toggleActive = async (item) => {
    try {
      const result = await updateTrainerBatchAnnouncement(item.id, { active: !item.active });
      await Swal.fire({
        icon: "success",
        title: result?.message || "Updated",
        timer: 1600,
        showConfirmButton: false,
        confirmButtonColor: "#0B3D2E",
      });
      await loadItems();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: err.response?.data?.message || "Failed to update announcement",
        confirmButtonColor: "#0B3D2E",
      });
    }
  };

  const removeItem = async (item) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Delete announcement?",
      text: "Students will no longer see this notice on the portal.",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#0B3D2E",
    });
    if (!confirm.isConfirmed) return;

    try {
      await deleteTrainerBatchAnnouncement(item.id);
      await loadItems();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: err.response?.data?.message || "Failed to delete announcement",
        confirmButtonColor: "#0B3D2E",
      });
    }
  };

  const canPublish = Boolean(title.trim()) && selected.size > 0 && !sending;

  return (
    <section className="trainer-announce">
      <div className="trainer-announce-compose">
        <div className="trainer-announce-head">
          <div className="header-left trainer-announce-title-row">
            <div className="check-icon-bg" aria-hidden="true">
              <i className="bi bi-megaphone-fill trainer-announce-title-icon" />
            </div>
            <div>
              <h2 className="section-title">Announce to students</h2>
              <p className="section-subtitle">
                Select students in this batch, write a notice, and publish. They see it on the portal
                {sendEmail ? " and get an email" : ""}.
              </p>
            </div>
          </div>
        </div>

        <div className="trainer-announce-form">
          <label className="trainer-announce-field">
            <span>Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Class cancelled tomorrow"
              maxLength={120}
            />
          </label>
          <label className="trainer-announce-field">
            <span>Message</span>
            <textarea
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share what students need to know…"
              maxLength={2000}
            />
          </label>
          <label className="trainer-announce-check">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
            />
            <span>Also send email to selected students</span>
          </label>
        </div>

        <div className="trainer-announce-students">
          <div className="trainer-announce-students-toolbar">
            <div>
              <strong>Select students</strong>
              <span className="trainer-announce-count">
                {selected.size} selected
                {students.length ? ` · ${students.length} in batch` : ""}
              </span>
            </div>
            <div className="trainer-announce-students-actions">
              <input
                type="search"
                className="trainer-announce-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or email"
                aria-label="Search students"
              />
              <button type="button" className="trainer-announce-link-btn" onClick={toggleSelectAllVisible}>
                {allVisibleSelected ? "Clear visible" : "Select visible"}
              </button>
            </div>
          </div>

          {students.length === 0 ? (
            <div className="trainer-announce-empty">No students enrolled in this batch yet.</div>
          ) : filteredStudents.length === 0 ? (
            <div className="trainer-announce-empty">No students match your search.</div>
          ) : (
            <ul className="trainer-announce-student-list">
              {filteredStudents.map((student) => {
                const id = studentKey(student);
                const checked = selected.has(id);
                return (
                  <li key={id || student.email}>
                    <label className={`trainer-announce-student ${checked ? "is-selected" : ""}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => id && toggleStudent(id)}
                        disabled={!id}
                      />
                      <span className="trainer-announce-student-meta">
                        <strong>{student.name || student.firstName || "Student"}</strong>
                        <em>{student.email || "No email"}</em>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="trainer-announce-publish">
          <button
            type="button"
            className="trainer-announce-primary"
            onClick={publish}
            disabled={!canPublish}
          >
            {sending ? "Sending…" : `Send to ${selected.size || 0} student${selected.size === 1 ? "" : "s"}`}
          </button>
        </div>
      </div>

      <div className="trainer-announce-history">
        <div className="trainer-announce-head">
          <div className="header-left trainer-announce-title-row">
            <div className="check-icon-bg" aria-hidden="true">
              <i className="bi bi-clock-history trainer-announce-title-icon" />
            </div>
            <div>
              <h2 className="section-title">Sent announcements</h2>
              <p className="section-subtitle">
                {loading
                  ? "Loading…"
                  : `${items.length} announcement${items.length === 1 ? "" : "s"} for this batch`}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="trainer-announce-empty">Loading announcements…</div>
        ) : items.length === 0 ? (
          <div className="trainer-announce-empty">No announcements yet. Send one above.</div>
        ) : (
          <ul className="trainer-announce-history-list">
            {items.map((item) => (
              <li key={item.id} className={`trainer-announce-history-item ${item.active ? "" : "is-off"}`}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.body || "No message body"}</p>
                  <span>
                    {item.recipientCount || item.recipientIds?.length || 0} student
                    {(item.recipientCount || item.recipientIds?.length || 0) === 1 ? "" : "s"}
                    {item.createdAt ? ` · ${new Date(item.createdAt).toLocaleString()}` : ""}
                    {item.emailStats?.total
                      ? ` · ${item.emailStats.sent}/${item.emailStats.total} emailed`
                      : item.emailStatus === "skipped"
                        ? " · email skipped"
                        : item.emailStatus
                          ? ` · ${item.emailStatus}`
                          : ""}
                  </span>
                  {Array.isArray(item.recipients) && item.recipients.length > 0 && (
                    <div className="trainer-announce-recipient-chips">
                      {item.recipients.slice(0, 6).map((r) => (
                        <span key={r.id}>{r.name || r.email}</span>
                      ))}
                      {item.recipients.length > 6 && (
                        <span>+{item.recipients.length - 6} more</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="trainer-announce-history-actions">
                  <button type="button" className="trainer-announce-secondary" onClick={() => toggleActive(item)}>
                    {item.active ? "Pause" : "Activate"}
                  </button>
                  <button type="button" className="trainer-announce-danger" onClick={() => removeItem(item)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
