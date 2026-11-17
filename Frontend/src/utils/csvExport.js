/**
 * Utility to export data to CSV format from the frontend.
 * Handles proper escaping of commas and quotes in data fields.
 */

export const exportToCSV = (filename, rows) => {
    if (!rows || !rows.length) {
        console.warn('No data provided to exportToCSV');
        return;
    }

    const csvContent = rows.map(e => {
        return e.map(val => {
            if (val === null || val === undefined) return '""';
            let str = String(val);
            if (str.includes(',') || str.includes('\n') || str.includes('"')) {
                str = `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        }).join(",");
    }).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
};
