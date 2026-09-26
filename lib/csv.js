'use strict';

// Minimal RFC 4180-style CSV reader/writer (no dependencies).
// Handles quoted fields, embedded commas / newlines / escaped quotes,
// and strips the UTF-8 BOM that Excel writes.

function parseCsv(text) {
    const source = String(text || '');
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;
    let i = source.charCodeAt(0) === 0xFEFF ? 1 : 0;

    while (i < source.length) {
        const ch = source[i];

        if (inQuotes) {
            if (ch === '"') {
                if (source[i + 1] === '"') {
                    field += '"';
                    i += 2;
                    continue;
                }
                inQuotes = false;
                i++;
                continue;
            }
            field += ch;
            i++;
            continue;
        }

        if (ch === '"') {
            inQuotes = true;
            i++;
            continue;
        }
        if (ch === ',') {
            row.push(field);
            field = '';
            i++;
            continue;
        }
        if (ch === '\r') {
            i++;
            continue;
        }
        if (ch === '\n') {
            row.push(field);
            rows.push(row);
            row = [];
            field = '';
            i++;
            continue;
        }
        field += ch;
        i++;
    }

    if (field !== '' || row.length) {
        row.push(field);
        rows.push(row);
    }

    // Drop fully empty trailing rows.
    return rows.filter(cells => cells.some(cell => String(cell).trim() !== ''));
}

function csvRow(cells) {
    return cells.map(cell => {
        const value = String(cell == null ? '' : cell);
        if (/[",\r\n]/.test(value)) {
            return '"' + value.replace(/"/g, '""') + '"';
        }
        return value;
    }).join(',');
}

function stringifyCsv(header, rows) {
    const lines = [csvRow(header)].concat(rows.map(csvRow));
    // UTF-8 BOM so Excel opens the file with the right encoding.
    return '\uFEFF' + lines.join('\n') + '\n';
}

module.exports = { parseCsv, csvRow, stringifyCsv };
