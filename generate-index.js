#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const { escapeHtml, escapeXml, stripTags } = require('./lib/html');

const ROOT = __dirname;
const SITE_URL = (process.env.SITE_URL || 'https://neonstack.net').replace(/\/$/, '');

const MANIFEST_JSON = path.join(ROOT, 'content-manifest.json');
const MANIFEST_JS = path.join(ROOT, 'assets', 'content-manifest.js');
const SITEMAP = path.join(ROOT, 'sitemap.xml');
const ROBOTS = path.join(ROOT, 'robots.txt');
const ADSENSE_CLIENT_ID = 'ca-pub-9797460743497525';
const ADSENSE_CODE = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}"
     crossorigin="anonymous"></script>`;
const STATIC_PAGE_PATHS = [
    'index.html',
    'apps/index.html',
    'authors/louis/index.html',
    'about/index.html',
    'contact/index.html',
    'privacy-policy/index.html',
    'policy/index.html',
    'disclaimer/index.html'
];

const EXCLUDED_TOP_LEVEL_DIRS = new Set([
    '.git',
    '.github',
    '.vscode',
    'assets',
    'node_modules',
    'about',
    'authors',
    'contact',
    'privacy-policy',
    'policy',
    'disclaimer'
]);

const EXCLUDED_FILES = new Set([
    'index.html',
    'robots.txt',
    'sitemap.xml',
    'content-manifest.json'
]);

const CATEGORY_LABELS = {
    tools: { badge: 'Tool', cta: 'Open tool' },
    reviews: { badge: 'Buying guide', cta: 'Read guide' },
    games: { badge: 'Game Helper', cta: 'Open helper' },
    apps: { badge: 'App', cta: 'View app' }
};

const BADGE_PATTERNS = {
    calculator: 'Calculator',
    counter: 'Writing',
    timer: 'Productivity',
    generator: 'Utility',
    converter: 'Utility',
    formatter: 'Developer',
    tester: 'Developer',
    picker: 'Design',
    compressor: 'Utility',
    password: 'Security',
    json: 'Developer',
    base64: 'Developer',
    regex: 'Developer',
    markdown: 'Writing',
    diff: 'Developer',
    qr: 'Utility',
    bmi: 'Health',
    loan: 'Finance',
    unit: 'Calculator',
    clock: 'Planning',
    zone: 'Planning',
    countdown: 'Event',
    speech: 'Accessibility',
    morse: 'Fun',
    speed: 'Network',
    emoji: 'Writing',
    color: 'Design',
    pokemon: 'Calculator',
    minecraft: 'Lookup',
    stardew: 'Calculator',
    genshin: 'Calculator',
    valorant: 'Reference',
    monster: 'Lookup',
    zelda: 'Tracker',
    animal: 'Lookup',
    steam: 'Comparison'
};

function posixPath(value) {
    return value.split(path.sep).join('/');
}

function titleFromSlug(slug) {
    return slug
        .split('-')
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function extractTag(html, pattern) {
    const match = html.match(pattern);
    return match ? stripTags(match[1] || match[2] || '') : '';
}

function extractTitle(html, fallback) {
    return extractTag(html, /<title[^>]*>([\s\S]*?)<\/title>/i) || fallback;
}

function extractDescription(html, fallback) {
    const metaMatch = html.match(/<meta\s+name=["']description["']\s+content=(["'])(.*?)\1/i);
    const metaDescription = metaMatch ? stripTags(metaMatch[2]) : '';
    if (metaDescription && metaDescription.length >= 20) return metaDescription;

    const subtitle = extractTag(html, /<p\s+class=["'][^"']*subtitle[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
    if (subtitle && subtitle.length >= 20) return subtitle;

    const cardHeader = html.match(/<div\s+class=["'][^"']*card-header[^"']*["'][^>]*>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i);
    const cardDescription = cardHeader ? stripTags(cardHeader[1]) : '';
    if (cardDescription && cardDescription.length >= 20) return cardDescription;

    const firstParagraph = extractTag(html, /<p[^>]*>([\s\S]*?)<\/p>/i);
    if (firstParagraph && firstParagraph.length >= 20) return firstParagraph;

    return fallback;
}

function inferBadge(category, slug) {
    if (category === 'reviews') return CATEGORY_LABELS.reviews.badge;
    for (const [keyword, badge] of Object.entries(BADGE_PATTERNS)) {
        if (slug.includes(keyword)) return badge;
    }
    return CATEGORY_LABELS[category]?.badge || titleFromSlug(category || 'Content');
}

function inferCta(category) {
    return CATEGORY_LABELS[category]?.cta || 'Open';
}

function isContentRoot(dirent) {
    if (!dirent.isDirectory()) return false;
    if (EXCLUDED_TOP_LEVEL_DIRS.has(dirent.name)) return false;
    return fs.existsSync(path.join(ROOT, dirent.name));
}

function discoverContentRoots() {
    return fs.readdirSync(ROOT, { withFileTypes: true })
        .filter(isContentRoot)
        .map(dirent => dirent.name)
        .filter(name => {
            const full = path.join(ROOT, name);
            return fs.readdirSync(full, { withFileTypes: true })
                .some(child => child.isDirectory() && fs.existsSync(path.join(full, child.name, 'index.html')));
        })
        .sort();
}

function readMeta(folderPath) {
    const metaPath = path.join(folderPath, 'meta.json');
    if (!fs.existsSync(metaPath)) return null;
    try {
        return JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    } catch (err) {
        console.warn(`Invalid meta.json: ${posixPath(path.relative(ROOT, metaPath))} (${err.message})`);
        return null;
    }
}

function buildStructuredData(item) {
    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebPage',
                '@id': `${SITE_URL}/${item.link}#webpage`,
                url: `${SITE_URL}/${item.link}`,
                name: item.title,
                description: item.description,
                isPartOf: {
                    '@type': 'WebSite',
                    '@id': `${SITE_URL}/#website`,
                    name: 'NeonStack',
                    url: `${SITE_URL}/`
                }
            },
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: 'Home',
                        item: `${SITE_URL}/`
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        name: titleFromSlug(item.category),
                        item: `${SITE_URL}/${item.category}/`
                    },
                    {
                        '@type': 'ListItem',
                        position: 3,
                        name: item.title,
                        item: `${SITE_URL}/${item.link}`
                    }
                ]
            }
        ]
    };
}

function replaceOrInsertHead(html, tagHtml, matcher) {
    if (matcher.test(html)) {
        return html.replace(matcher, tagHtml);
    }
    return html.replace(/<\/head>/i, `    ${tagHtml}\n</head>`);
}

function ensureMainH1(html) {
    if (/<h1[\s>]/i.test(html)) return html;
    return html.replace(/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/i, '<h1$1>$2</h1>');
}

function ensureAdsenseCode(html) {
    if (html.includes(`pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`)) {
        return html;
    }
    return html.replace(/<\/head>/i, `    ${ADSENSE_CODE}\n</head>`);
}

function updateStaticPages() {
    for (const relativePath of STATIC_PAGE_PATHS) {
        const indexPath = path.join(ROOT, relativePath);
        if (!fs.existsSync(indexPath)) continue;
        const originalHtml = fs.readFileSync(indexPath, 'utf8');
        const html = ensureAdsenseCode(originalHtml);
        if (html !== originalHtml) {
            fs.writeFileSync(indexPath, html, 'utf8');
        }
    }
}

function updatePageSeo(indexPath, item) {
    const originalHtml = fs.readFileSync(indexPath, 'utf8');
    let html = originalHtml;
    const canonical = `${SITE_URL}/${item.link}`;
    const title = escapeHtml(item.seoTitle || item.title);
    const description = escapeHtml(item.description);
    const schema = JSON.stringify(buildStructuredData(item), null, 2)
        .split('\n')
        .map((line, index) => index === 0 ? line : `    ${line}`)
        .join('\n');

    html = replaceOrInsertHead(
        html,
        `<title>${title}</title>`,
        /<title[^>]*>[\s\S]*?<\/title>/i
    );
    html = replaceOrInsertHead(
        html,
        `<meta name="description" content="${description}">`,
        /<meta\s+name=["']description["']\s+content=(["']).*?\1\s*\/?>/i
    );
    html = replaceOrInsertHead(
        html,
        `<link rel="canonical" href="${canonical}">`,
        /<link\s+rel=["']canonical["'][^>]*>/i
    );

    const schemaBlock = `<script type="application/ld+json" data-generated-seo>\n    ${schema}\n    </script>`;
    if (/<script\s+type=["']application\/ld\+json["']\s+data-generated-seo>[\s\S]*?<\/script>/i.test(html)) {
        html = html.replace(/<script\s+type=["']application\/ld\+json["']\s+data-generated-seo>[\s\S]*?<\/script>/i, schemaBlock);
    } else {
        html = html.replace(/<\/head>/i, `    ${schemaBlock}\n</head>`);
    }

    html = ensureMainH1(html);
    // /apps/ pages are sales pages - no ads there.
    if (item.category !== 'apps') {
        html = ensureAdsenseCode(html);
    }
    if (html !== originalHtml) {
        fs.writeFileSync(indexPath, html, 'utf8');
    }
}

function scanContentRoot(category) {
    const categoryPath = path.join(ROOT, category);
    const folders = fs.readdirSync(categoryPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .filter(dirent => fs.existsSync(path.join(categoryPath, dirent.name, 'index.html')))
        .map(dirent => dirent.name)
        .sort();

    console.log(`Scanning ${category}/: ${folders.length} pages`);

    return folders.map(slug => {
        const folderPath = path.join(categoryPath, slug);
        const indexPath = path.join(folderPath, 'index.html');
        const html = fs.readFileSync(indexPath, 'utf8');
        const meta = readMeta(folderPath) || {};
        const title = stripTags(meta.title || titleFromSlug(slug));
        const seoTitle = stripTags(meta.seoTitle || extractTitle(html, `${title} | NeonStack`));
        const description = stripTags(meta.description || extractDescription(html, `${title} on NeonStack.`));
        const item = {
            title,
            seoTitle,
            badge: stripTags(meta.badge || inferBadge(category, slug)),
            description,
            link: meta.link || `${category}/${slug}/`,
            cta: stripTags(meta.cta || inferCta(category)),
            category,
            slug
        };
        updatePageSeo(indexPath, item);
        return item;
    });
}

function generateSitemap(items) {
    const staticUrls = STATIC_PAGE_PATHS
        .filter(relativePath => fs.existsSync(path.join(ROOT, relativePath)))
        .map(relativePath => ({
            loc: relativePath === 'index.html'
                ? `${SITE_URL}/`
                : `${SITE_URL}/${relativePath.replace(/index\.html$/, '')}`,
            lastmod: new Date(fs.statSync(path.join(ROOT, relativePath)).mtime).toISOString()
        }));

    const contentUrls = items.map(item => ({
        loc: `${SITE_URL}/${item.link}`,
        lastmod: new Date(fs.statSync(path.join(ROOT, item.link, 'index.html')).mtime).toISOString()
    }));

    const urls = [...staticUrls, ...contentUrls];

    const body = urls
        .map(url => [
            '  <url>',
            `    <loc>${escapeXml(url.loc)}</loc>`,
            `    <lastmod>${url.lastmod}</lastmod>`,
            '  </url>'
        ].join('\n'))
        .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function generateRobots() {
    return [
        'User-agent: *',
        'Allow: /',
        '',
        'Disallow: /assets/',
        'Disallow: /policy/',
        'Disallow: /data/',
        'Disallow: /admin/',
        '',
        `Sitemap: ${SITE_URL}/sitemap.xml`,
        ''
    ].join('\n');
}

function writeManifest(manifest) {
    const json = JSON.stringify(manifest, null, 2);
    fs.writeFileSync(MANIFEST_JSON, `${json}\n`, 'utf8');
    fs.mkdirSync(path.dirname(MANIFEST_JS), { recursive: true });
    fs.writeFileSync(MANIFEST_JS, `window.__CONTENT_MANIFEST__ = ${json};\n`, 'utf8');
}

function writeSeoFiles(manifest) {
    fs.writeFileSync(SITEMAP, generateSitemap(manifest.items), 'utf8');
    fs.writeFileSync(ROBOTS, generateRobots(), 'utf8');
}

function requestUrl(url) {
    return new Promise(resolve => {
        https.get(url, res => {
            res.resume();
            resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode });
        }).on('error', err => resolve({ ok: false, error: err.message }));
    });
}

async function notifySearchEngines() {
    if (process.env.SEARCH_ENGINE_PING !== '1') {
        console.log('Search engine ping skipped. Set SEARCH_ENGINE_PING=1 if you want sitemap ping attempts.');
        console.log('Search Console submission requires Google credentials and is not faked by this script.');
        return;
    }

    const sitemap = encodeURIComponent(`${SITE_URL}/sitemap.xml`);
    const targets = [
        `https://www.google.com/ping?sitemap=${sitemap}`,
        `https://www.bing.com/ping?sitemap=${sitemap}`
    ];

    for (const target of targets) {
        const result = await requestUrl(target);
        console.log(`Ping ${target}: ${result.ok ? 'ok' : `failed (${result.status || result.error})`}`);
    }
}

function buildManifest(categories) {
    const grouped = {};
    const items = [];
    for (const category of categories) {
        grouped[category] = scanContentRoot(category);
        items.push(...grouped[category]);
    }

    return {
        generated: new Date().toISOString(),
        siteUrl: SITE_URL,
        categories,
        items,
        grouped,
        tools: grouped.tools || [],
        reviews: grouped.reviews || [],
        games: grouped.games || [],
        apps: grouped.apps || []
    };
}

function watchForChanges() {
    const categories = discoverContentRoots();
    let timer = null;
    const runSoon = (eventType, filename) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            console.log(`Change detected: ${eventType}${filename ? ` ${filename}` : ''}`);
            main().catch(err => {
                console.error(err);
                process.exitCode = 1;
            });
        }, 300);
    };

    categories.forEach(category => {
        fs.watch(path.join(ROOT, category), { recursive: true }, runSoon);
    });
    console.log(`Watching ${categories.join(', ')}. Press Ctrl+C to stop.`);
}

async function main() {
    console.log('Scanning NeonStack content...');
    const categories = discoverContentRoots();
    if (!categories.length) {
        throw new Error('No content directories found.');
    }

    updateStaticPages();
    const manifest = buildManifest(categories);
    writeManifest(manifest);
    writeSeoFiles(manifest);
    await notifySearchEngines();

    console.log('Generated content-manifest.json');
    console.log('Generated assets/content-manifest.js');
    console.log('Generated sitemap.xml');
    console.log('Generated robots.txt');
    console.log(`Content roots: ${categories.join(', ')}`);
    console.log(`Total indexed content pages: ${manifest.items.length}`);
}

main()
    .then(() => {
        if (process.argv.includes('--watch')) watchForChanges();
    })
    .catch(err => {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    });
