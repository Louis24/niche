'use strict';

// Data layer for the NeonStack apps market.
//
// Canonical source: data/apps.csv + data/apps-details.csv + data/authors.json

const fs = require('fs');
const path = require('path');
const { parseCsv, stringifyCsv } = require('./csv');

const DATA_DIR = path.join(__dirname, '..', 'data');
const APPS_CSV = path.join(DATA_DIR, 'apps.csv');
const DETAILS_CSV = path.join(DATA_DIR, 'apps-details.csv');
const AUTHORS_JSON = path.join(DATA_DIR, 'authors.json');

const APP_COLUMNS = [
    'slug', 'name', 'author', 'price', 'tagline', 'description', 'icon', 'tint',
    'type', 'platforms', 'version', 'updated', 'tags', 'image', 'status'
];

const DETAIL_COLUMNS = ['slug', 'kind', 'a', 'b', 'c'];
const DETAIL_KINDS = ['feature', 'changelog', 'requirement', 'faq'];

function emptyDetail() {
    return { features: [], changelog: [], requirements: [], faq: [] };
}

function toList(value) {
    return String(value || '')
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
}

function normalizeAuthor(raw) {
    const author = raw || {};
    return {
        slug: author.slug || 'author',
        name: author.name || '',
        role: author.role || '',
        bio: author.bio || '',
        avatar: String(author.avatar || '').trim().replace(/\\/g, '/'),
        email: author.email || '',
        website: author.website || '',
        telegram: author.telegram || '',
        x: author.x || '',
        github: author.github || ''
    };
}

function normalizeApp(raw) {
    return {
        slug: String(raw.slug || '').trim(),
        name: String(raw.name || '').trim(),
        author: String(raw.author || '').trim(),
        // Empty price means "price not published" (contact us), not free.
        price: String(raw.price == null ? '' : raw.price).trim() === ''
            ? null
            : (Number(raw.price) || 0),
        tagline: String(raw.tagline || '').trim(),
        description: String(raw.description || '').trim(),
        icon: String(raw.icon || '').trim().slice(0, 2).toUpperCase(),
        tint: String(raw.tint || '').trim(),
        type: String(raw.type || '').trim(),
        platforms: toList(raw.platforms),
        version: String(raw.version || '').trim(),
        updated: String(raw.updated || '').trim(),
        tags: toList(raw.tags),
        // Path relative to the app folder, e.g. "shot.png".
        image: String(raw.image || '').trim().replace(/\\/g, '/'),
        status: String(raw.status || 'published').trim().toLowerCase()
    };
}

function appToRow(app) {
    return [
        app.slug, app.name, app.author, app.price == null ? '' : app.price,
        app.tagline, app.description, app.icon, app.tint, app.type,
        app.platforms.join(', '), app.version, app.updated, app.tags.join(', '),
        app.image, app.status || 'published'
    ];
}

function detailToRows(slug, detail) {
    const rows = [];
    for (const feature of detail.features || []) {
        rows.push([slug, 'feature', feature.title || '', feature.text || '', '']);
    }
    for (const entry of detail.changelog || []) {
        rows.push([slug, 'changelog', entry.version || '', entry.date || '', entry.text || '']);
    }
    for (const item of detail.requirements || []) {
        rows.push([slug, 'requirement', item.label || '', item.value || '', '']);
    }
    for (const item of detail.faq || []) {
        rows.push([slug, 'faq', item.question || '', item.answer || '', '']);
    }
    return rows;
}

function normalizeAuthorMap(raw) {
    const map = {};
    for (const [slug, value] of Object.entries(raw || {})) {
        map[slug] = normalizeAuthor({ ...value, slug: value.slug || slug });
    }
    return map;
}

function readDetailRows() {
    const details = {};
    if (!fs.existsSync(DETAILS_CSV)) return details;

    const rows = parseCsv(fs.readFileSync(DETAILS_CSV, 'utf8'));
    rows.shift();
    for (const cells of rows) {
        const slug = (cells[0] || '').trim();
        const kind = (cells[1] || '').trim().toLowerCase();
        if (!slug || !DETAIL_KINDS.includes(kind)) continue;
        if (!details[slug]) details[slug] = emptyDetail();
        const [a = '', b = '', c = ''] = cells.slice(2).map(cell => String(cell).trim());
        if (kind === 'feature') details[slug].features.push({ title: a, text: b });
        if (kind === 'changelog') details[slug].changelog.push({ version: a, date: b, text: c });
        if (kind === 'requirement') details[slug].requirements.push({ label: a, value: b });
        if (kind === 'faq') details[slug].faq.push({ question: a, answer: b });
    }
    return details;
}

function loadApps() {
    if (!fs.existsSync(APPS_CSV)) {
        throw new Error('Missing data source: data/apps.csv');
    }

    const rows = parseCsv(fs.readFileSync(APPS_CSV, 'utf8'));
    const header = rows.shift().map(cell => cell.trim());
    const apps = rows
        .map(cells => {
            const raw = {};
            header.forEach((key, index) => { raw[key] = cells[index]; });
            return normalizeApp(raw);
        })
        .filter(app => app.slug);

    const authors = normalizeAuthorMap(JSON.parse(fs.readFileSync(AUTHORS_JSON, 'utf8')));

    return { authors, apps, details: readDetailRows() };
}

// Resolves the author for one app: its own author column wins,
// otherwise the first author in data/authors.json.
function authorFor(data, app) {
    const keys = Object.keys(data.authors || {});
    return (data.authors && data.authors[app.author]) || data.authors[keys[0]] || normalizeAuthor({});
}

function saveApps(data) {
    fs.mkdirSync(DATA_DIR, { recursive: true });

    const apps = (data.apps || []).map(normalizeApp).filter(app => app.slug);
    fs.writeFileSync(APPS_CSV, stringifyCsv(APP_COLUMNS, apps.map(appToRow)), 'utf8');

    const detailRows = [];
    for (const app of apps) {
        detailRows.push(...detailToRows(app.slug, (data.details || {})[app.slug] || emptyDetail()));
    }
    fs.writeFileSync(DETAILS_CSV, stringifyCsv(DETAIL_COLUMNS, detailRows), 'utf8');

    fs.writeFileSync(AUTHORS_JSON, JSON.stringify(normalizeAuthorMap(data.authors), null, 2) + '\n', 'utf8');

    return apps.length;
}

module.exports = {
    loadApps,
    saveApps,
    authorFor,
    emptyDetail,
    normalizeAuthor,
    APP_COLUMNS,
    DETAIL_KINDS
};
