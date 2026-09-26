'use strict';

// HTML/XML escaping helpers shared by every generator.

const NAMED_ENTITIES = [
    [/&amp;/g, '&'],
    [/&quot;/g, '"'],
    [/&#039;/g, "'"],
    [/&lt;/g, '<'],
    [/&gt;/g, '>']
];

function escapeHtml(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function escapeXml(value) {
    return escapeHtml(value).replace(/'/g, '&apos;');
}

// Removes tags and decodes the entities we emit, so text lifted out of a
// generated page can be reused as metadata.
function stripTags(value) {
    let next = String(value || '').replace(/<[^>]*>/g, '');
    for (let i = 0; i < 5; i++) {
        const decoded = NAMED_ENTITIES.reduce(
            (text, [pattern, char]) => text.replace(pattern, char),
            next
        );
        if (decoded === next) break;
        next = decoded;
    }
    return next.replace(/\s+/g, ' ').trim();
}

module.exports = { escapeHtml, escapeXml, stripTags };
