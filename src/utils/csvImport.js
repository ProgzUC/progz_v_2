/**
 * Parse student rows (name + email) from CSV text or Excel workbooks.
 */
import * as XLSX from "xlsx";

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

const normalizeHeader = (value) =>
  String(value || "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .toLowerCase();

const cleanCell = (value) =>
  String(value ?? "")
    .trim()
    .replace(/^["']|["']$/g, "");

const isEmailHeader = (h) =>
  h === "email" || h === "e-mail" || h === "student email" || h === "student_email" || h === "mail";

const isNameHeader = (h) =>
  h === "name" ||
  h === "student name" ||
  h === "student_name" ||
  h === "full name" ||
  h === "fullname";

/**
 * Extract unique emails from raw CSV text (legacy enroll helper).
 */
export const parseEmailsFromCsv = (text) => {
  const rows = parseStudentRowsFromCsv(text);
  return [...new Set(rows.map((r) => r.email))];
};

/**
 * Parse student { name, email } rows from CSV text.
 * Prefers name/email header columns; otherwise scans cells for emails.
 */
export const parseStudentRowsFromCsv = (text) => {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const firstCells = splitCsvLine(lines[0]).map(normalizeHeader);
  const emailCol = firstCells.findIndex(isEmailHeader);
  const nameCol = firstCells.findIndex(isNameHeader);
  const hasHeader = emailCol >= 0;

  const rows = [];
  const seen = new Set();

  if (hasHeader) {
    for (let i = 1; i < lines.length; i++) {
      const cells = splitCsvLine(lines[i]);
      const email = cleanCell(cells[emailCol] || "").toLowerCase();
      if (!EMAIL_RE.test(email) || seen.has(email)) continue;
      seen.add(email);
      const name =
        nameCol >= 0 ? cleanCell(cells[nameCol] || "") : cleanCell(cells[0] || "");
      rows.push({ name: name && !EMAIL_RE.test(name) ? name : "", email });
    }
  } else {
    for (const line of lines) {
      const cells = splitCsvLine(line);
      let email = "";
      let name = "";
      for (const col of cells) {
        const raw = cleanCell(col);
        if (EMAIL_RE.test(raw.toLowerCase())) {
          email = raw.toLowerCase();
        } else if (raw && !name) {
          name = raw;
        }
      }
      if (!email || seen.has(email)) continue;
      seen.add(email);
      rows.push({ name, email });
    }
  }

  return rows;
};

/**
 * Parse pasted text (one email or "Name, email" / "Name <email>" per line).
 */
export const parseStudentRowsFromPaste = (text) => {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const rows = [];
  const seen = new Set();

  for (const line of lines) {
    const angle = line.match(/^(.+?)\s*<\s*([^>]+)\s*>$/);
    let name = "";
    let email = "";

    if (angle) {
      name = cleanCell(angle[1]);
      email = cleanCell(angle[2]).toLowerCase();
    } else if (line.includes(",")) {
      const cells = splitCsvLine(line);
      for (const col of cells) {
        const raw = cleanCell(col);
        if (EMAIL_RE.test(raw.toLowerCase())) email = raw.toLowerCase();
        else if (raw && !name) name = raw;
      }
    } else if (line.includes("\t")) {
      const cells = line.split("\t").map(cleanCell);
      for (const raw of cells) {
        if (EMAIL_RE.test(raw.toLowerCase())) email = raw.toLowerCase();
        else if (raw && !name) name = raw;
      }
    } else if (EMAIL_RE.test(line.toLowerCase())) {
      email = line.toLowerCase();
    } else {
      const parts = line.split(/\s+/);
      const maybeEmail = parts[parts.length - 1]?.toLowerCase();
      if (EMAIL_RE.test(maybeEmail)) {
        email = maybeEmail;
        name = parts.slice(0, -1).join(" ");
      }
    }

    if (!email || !EMAIL_RE.test(email) || seen.has(email)) continue;
    seen.add(email);
    rows.push({ name, email });
  }

  return rows;
};

/**
 * Parse Excel (.xlsx / .xls) ArrayBuffer into student rows.
 */
export const parseStudentRowsFromExcel = (arrayBuffer) => {
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  const sheet = workbook.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  if (!matrix.length) return [];

  const csvLike = matrix
    .map((row) =>
      (Array.isArray(row) ? row : [])
        .map((cell) => {
          const str = String(cell ?? "");
          if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(",")
    )
    .join("\n");

  return parseStudentRowsFromCsv(csvLike);
};

/** Download a starter CSV template for bulk student import. */
export const downloadBulkImportCsvTemplate = () => {
  const rows = [
    ["Student Name", "Email"],
    ["Ada Lovelace", "ada@college.edu"],
    ["Alan Turing", "alan@college.edu"],
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
  link.download = "bulk_student_import_template.csv";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/** Download a starter CSV template for bulk enrollment (emails). */
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
