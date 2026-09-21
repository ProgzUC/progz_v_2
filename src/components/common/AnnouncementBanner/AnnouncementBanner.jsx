import { useEffect, useState } from "react";
import { fetchStudentAnnouncements } from "../../../api/studentApi";
import { fetchTrainerAnnouncements } from "../../../api/trainerApi";
import "./AnnouncementBanner.css";

const DISMISS_KEY = "progz-dismissed-announcements";

const readDismissed = () => {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

const writeDismissed = (ids) => {
  localStorage.setItem(DISMISS_KEY, JSON.stringify(ids.slice(0, 50)));
};

export default function AnnouncementBanner({ source }) {
  const [item, setItem] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const loader = source === "trainer" ? fetchTrainerAnnouncements : fetchStudentAnnouncements;

    loader()
      .then((data) => {
        if (cancelled) return;
        const dismissed = new Set(readDismissed());
        const next = (data?.items || []).find((entry) => !dismissed.has(String(entry.id)));
        setItem(next || null);
      })
      .catch(() => {
        if (!cancelled) setItem(null);
      });

    return () => {
      cancelled = true;
    };
  }, [source]);

  if (!item) return null;

  const dismiss = () => {
    writeDismissed([...readDismissed(), String(item.id)]);
    setItem(null);
  };

  return (
    <aside className="portal-announce" role="status">
      <div className="portal-announce-copy">
        <strong>{item.title}</strong>
        {item.body ? <p>{item.body}</p> : null}
      </div>
      <button type="button" className="portal-announce-close" onClick={dismiss} aria-label="Dismiss announcement">
        ×
      </button>
    </aside>
  );
}
