/**
 * Parse student emails from CSV text (quoted fields, header rows, email columns).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

/** Split a CSV line respecting double-quoted fields. */
export const splitCsvLine = (line) => {
  const cells = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
};

const normalizeCell = (value) =>
  String(value || "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .toLowerCase();

/**
 * Extract unique emails from raw CSV text.
 * Prefers an `email` / `e-mail` / `student email` column when a header row exists;
 * otherwise scans every cell for email-shaped values.
 */
export const parseEmailsFromCsv = (text) => {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const firstCells = splitCsvLine(lines[0]).map(normalizeCell);
  const emailColIndex = firstCells.findIndex(
    (h) => h === "email" || h === "e-mail" || h === "student email" || h === "student_email"
  );

  const emails = [];

  if (emailColIndex >= 0) {
    for (let i = 1; i < lines.length; i++) {
      const cells = splitCsvLine(lines[i]);
      const raw = normalizeCell(cells[emailColIndex] || "");
      if (EMAIL_RE.test(raw)) emails.push(raw);
    }
  } else {
    for (const line of lines) {
      for (const col of splitCsvLine(line)) {
        const raw = normalizeCell(col);
        if (EMAIL_RE.test(raw)) emails.push(raw);
      }
    }
  }

  return [...new Set(emails)];
};

/** Download a starter CSV template for bulk enrollment. */
export const downloadEnrollmentCsvTemplate = () => {
  const rows = [
    ["email", "name"],
    ["student1@example.com", "Ada Lovelace"],
    ["student2@example.com", "Alan Turing"],
  ];

  const csvContent = rows
    .map((row) =>
      row
        .map((val) => {
          const str = String(val ?? "");
          if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "student_enrollment_template.csv";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
