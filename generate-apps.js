#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const store = require('./lib/appdata');
const { escapeHtml } = require('./lib/html');

const ROOT = __dirname;
const APPS_DIR = path.join(ROOT, 'apps');
const SITE_URL = (process.env.SITE_URL || 'https://neonstack.net').replace(/\/$/, '');
// AdSense is kept on the content pages (home, tools, reviews, games) and stays
// off the /apps/ pages, which monetise by selling instead of by ads.

// Badge is derived from the app type, so it never has to be typed in.
const BADGE_FROM_TYPE = {
    script: 'Script',
    desktop: 'Desktop',
    web: 'Web app',
    template: 'Template'
};

// Shown when an app has no FAQ rows of its own in data/apps-details.csv.
// Per-app questions can still be added there and will override these.
const DEFAULT_FAQ = [
    {
        question: 'Is it safe to use?',
        answer: 'Yes. Everything runs locally on your own machine. There is no account, no cloud sync, and nothing about you is uploaded.'
    },
    {
        question: 'How do I set it up?',
        answer: 'Every download includes a README with step-by-step install and usage instructions. Most setups take less than five minutes.'
    },
    {
        question: 'How do updates arrive?',
        answer: 'You get an email whenever a new version ships, with a one-click download link. Updates are included for the version you bought.'
    }
];

// Trust bullets under the buy button.
// Paid apps are bought by contacting the author directly (email), so the
// wording stays neutral about payment methods.
const TRUST_FREE = [
    'Runs locally, nothing uploaded',
    'Data stays in your browser',
    'Source available on request'
];

const TRUST_PAID = [
    'Lifetime updates included',
    'Direct support from the developer',
    '30-day refund on request',
    'Reply within 24 hours'
];

// Both the market page and every app page use this exact component, so the
// questions always look the same.
function qaHtml(items) {
    return `                    <div class="qa-list">
${items.map(item => `                        <div class="qa-item">
                            <h4>${escapeHtml(item.question)}</h4>
                            <p>${escapeHtml(item.answer)}</p>
                        </div>`).join('\n')}
                    </div>`;
}

function badgeFor(app) {
    return BADGE_FROM_TYPE[app.type] || 'App';
}

function applicationCategory(app) {
    if (app.tags.includes('trading') || app.tags.includes('quant')) return 'FinanceApplication';
    if (app.type === 'script') return 'BrowserApplication';
    if (app.type === 'web') return 'WebApplication';
    if (app.type === 'template') return 'DeveloperApplication';
    return 'DesktopApplication';
}

function pageHead(title, description, canonical, depth) {
    const up = depth === 1 ? '../' : '../../';
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/png" href="/favicon.png">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${canonical}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${up}assets/site.css">
</head>`;
}

function siteHeader(depth) {
    const up = depth === 1 ? '../' : '../../';
    return `<header class="header">
        <div class="container navbar">
            <a href="${up}" class="logo">Neon<span>Stack</span></a>
            <nav class="nav-links" aria-label="Primary navigation">
                <a href="${up}#tools">Tools</a>
                <a href="${up}#reviews">Reviews</a>
                <a href="${up}#games">Games</a>
                <a href="${up}apps/">Apps</a>
                <a href="${up}contact/">Contact</a>
            </nav>
        </div>
    </header>`;
}

function siteFooter(depth) {
    const up = depth === 1 ? '../' : '../../';
    return `<footer class="footer">
        <div class="container text-center">
            <nav class="footer-links" aria-label="Footer navigation">
                <a href="${up}about/">About</a>
                <a href="${up}contact/">Contact</a>
                <a href="${up}privacy-policy/">Privacy Policy</a>
                <a href="${up}disclaimer/">Disclaimer</a>
            </nav>
            <p>&copy; 2026 NeonStack. Apps are sold by their developers.</p>
        </div>
    </footer>`;
}

function authorCard(author, depth) {
    const up = depth === 1 ? '../' : '../../';
    const contacts = [
        { mark: '@', label: author.email, href: author.email ? `mailto:${author.email}` : '' },
        { mark: '&gt;', label: String(author.website || '').replace(/^https?:\/\//, ''), href: author.website },
        { mark: '&#215;', label: 'X / Twitter', href: author.x },
        { mark: '&#9679;', label: 'Telegram', href: author.telegram }
    ].filter(item => item.href && !String(item.href).includes('REPLACE'));

    const links = contacts.map(item =>
        `                        <a class="contact-btn" href="${escapeHtml(item.href)}" rel="noopener"><span class="contact-mark">${item.mark}</span> ${escapeHtml(item.label)}</a>`
    ).join('\n');

    return `<div class="author-card" style="margin-top:18px;">
                    <div class="author-head">
                        <div class="author-avatar">${authorAvatarHtml(author, up)}</div>
                        <div>
                            <p class="author-name">${escapeHtml(author.name)}</p>
                            <p class="author-role">${escapeHtml(author.role)}</p>
                        </div>
                    </div>
${author.bio ? `                    <p class="author-bio">${escapeHtml(author.bio)}</p>\n` : ''}                    <div class="contact-list">
${links}
                    </div>
${fs.existsSync(path.join(ROOT, 'authors', author.slug, 'index.html')) ? `                    <p style="margin-top:14px;"><a class="card-link" href="${up}authors/${escapeHtml(author.slug)}/">View full profile</a></p>\n` : ''}                </div>`;
}

function buildMarketIndex(data) {
    const cards = data.apps.map(app => {
        const free = app.price === 0;
        const author = store.authorFor(data, app);
        return `                    <a class="app-card" href="${escapeHtml(app.slug)}/"
                       data-category="${escapeHtml(app.type)}" data-price="${free ? 'free' : 'paid'}" data-amount="${app.price === null ? 999999 : app.price}"
                       data-name="${escapeHtml(app.name)}" data-author="${escapeHtml(author.name)}"
                       data-tags="${escapeHtml(app.tags.join(' '))}">
                        <div class="app-card-head">
                            <div class="app-icon${app.tint ? ' ' + escapeHtml(app.tint) : ''}">${escapeHtml(app.icon)}</div>
                            <div>
                                <h3 class="app-title">${escapeHtml(app.name)}</h3>
                                <p class="app-author">by ${escapeHtml(author.name)}</p>
                            </div>
                        </div>
                        <p class="app-desc">${escapeHtml(app.tagline)}</p>
                        <div class="app-tags">
${app.tags.slice(0, 3).map(tag => `                            <span class="tag">${escapeHtml(tag)}</span>`).join('\n')}
                        </div>
                        <div class="app-foot">
                            ${free
            ? `<div class="price is-free">Free</div>`
            : app.price === null
                ? `<div class="price">Contact<small>for pricing</small></div>`
                : `<div class="price">$${app.price}<small>one-time</small></div>`}
                            <span class="app-cta">View details</span>
                        </div>
                    </a>`;
    }).join('\n\n');

    return `${pageHead('Software Market | NeonStack Apps',
        'Small, focused software from indie developers. Browser extensions, desktop tools, and scripts that solve one real problem.',
        `${SITE_URL}/apps/`, 1)}
<body>
    ${siteHeader(1)}

    <main>
        <section class="site-hero">
            <div class="container text-center">
                <span class="badge">Software Market</span>
                <h1>Small software that solves one real problem.</h1>
                <p>Every app here is built and maintained by an independent developer. Pay once, keep it forever, and talk directly to the person who wrote it.</p>
                <div class="market-search">
                    <input id="app-search" type="search" placeholder="Search apps, tags, or developers..." aria-label="Search apps">
                </div>
                <div class="market-actions">
                    <a class="btn" href="#all-apps">Browse apps</a>
                    <a class="btn btn-secondary" href="../contact/">Sell your app</a>
                </div>
            </div>
        </section>

        <section class="section-band">
            <div class="container">
                <div class="stats-grid">
                    <div class="stat-box">
                        <span class="stat-num">${data.apps.length}</span>
                        <span class="stat-lbl">Apps</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-num">${new Set(data.apps.map(app => store.authorFor(data, app).slug)).size}</span>
                        <span class="stat-lbl">Developers</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-num">30d</span>
                        <span class="stat-lbl">Refund window</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-num">&infin;</span>
                        <span class="stat-lbl">Updates included</span>
                    </div>
                </div>
            </div>
        </section>

        <section id="all-apps" class="section-band">
            <div class="container">
                <div class="section-heading">
                    <div>
                        <h2>All apps</h2>
                        <p>Filter by type and price, or search by name.</p>
                    </div>
                </div>

                <div class="filter-bar">
                    <div class="filter-row" role="group" aria-label="Filter by category">
                        <span class="filter-label">Type</span>
                        <button class="chip is-active" data-filter="category" data-value="all">All</button>
                        <button class="chip" data-filter="category" data-value="script">Script</button>
                        <button class="chip" data-filter="category" data-value="desktop">Desktop</button>
                        <button class="chip" data-filter="category" data-value="web">Web app</button>
                        <button class="chip" data-filter="category" data-value="template">Template</button>
                    </div>
                    <div class="filter-row" role="group" aria-label="Filter by price">
                        <span class="filter-label">Price</span>
                        <button class="chip is-active" data-filter="price" data-value="all">Any</button>
                        <button class="chip" data-filter="price" data-value="free">Free</button>
                        <button class="chip" data-filter="price" data-value="paid">Paid</button>
                    </div>
                    <div class="filter-row">
                        <span class="filter-label">Sort</span>
                        <button class="chip is-active" data-filter="sort" data-value="featured">Featured</button>
                        <button class="chip" data-filter="sort" data-value="price-asc">Price low to high</button>
                        <button class="chip" data-filter="sort" data-value="price-desc">Price high to low</button>
                        <button class="chip" data-filter="sort" data-value="name">Name A-Z</button>
                        <span class="filter-count" id="result-count">${data.apps.length} apps</span>
                    </div>
                </div>

                <div class="app-grid" id="app-grid">

${cards}

                </div>

                <p class="no-results" id="no-results" hidden>No apps match that filter. Try clearing the search box.</p>
            </div>
        </section>

        <section class="section-band">
            <div class="container">
                <div class="content-panel text-center">
                    <span class="badge">Developers</span>
                    <h2>Have a tool people would pay for?</h2>
                    <p>List it here and keep 85% of every sale. You keep your code, your users, and your roadmap.</p>
                    <div class="market-actions">
                        <a class="btn" href="../contact/">Submit your app</a>
                    </div>
                </div>
            </div>
        </section>

        <section class="faq-section">
            <div class="container">
                <div class="section-heading">
                    <div>
                        <h2>Before you buy</h2>
                        <p>The short version of how this works.</p>
                    </div>
                </div>
${qaHtml([
        { question: 'How do I receive the app?', answer: 'The developer contacts you by email after you get in touch, and sends the download and license key directly.' },
        { question: 'How do I pay?', answer: 'Any way the developer accepts — they tell you the options by email. No card details are entered on this site.' },
        { question: 'Can I get a refund?', answer: 'Yes. Email within 30 days and you get a full refund, no questions asked.' },
        { question: 'Are updates included?', answer: 'Every purchase includes all future updates for that major version.' },
        { question: 'Who do I contact for support?', answer: 'The developer directly. Their contact details are on every app page.' }
    ])}
            </div>
        </section>
    </main>

    ${siteFooter(1)}

    <script>
    (function () {
        var grid = document.getElementById('app-grid');
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.app-card'));
        var search = document.getElementById('app-search');
        var count = document.getElementById('result-count');
        var empty = document.getElementById('no-results');
        var state = { category: 'all', price: 'all', sort: 'featured', query: '' };

        function apply() {
            var visible = cards.filter(function (card) {
                var data = card.dataset;
                if (state.category !== 'all' && data.category !== state.category) return false;
                if (state.price !== 'all' && data.price !== state.price) return false;
                if (state.query) {
                    var haystack = (data.name + ' ' + data.author + ' ' + data.tags).toLowerCase();
                    if (haystack.indexOf(state.query) === -1) return false;
                }
                return true;
            });

            if (state.sort === 'price-asc') {
                visible.sort(function (a, b) { return Number(a.dataset.amount) - Number(b.dataset.amount); });
            } else if (state.sort === 'price-desc') {
                visible.sort(function (a, b) { return Number(b.dataset.amount) - Number(a.dataset.amount); });
            } else if (state.sort === 'name') {
                visible.sort(function (a, b) { return a.dataset.name.localeCompare(b.dataset.name); });
            }

            cards.forEach(function (card) { card.hidden = true; });
            visible.forEach(function (card) { grid.appendChild(card); card.hidden = false; });

            count.textContent = visible.length + (visible.length === 1 ? ' app' : ' apps');
            empty.hidden = visible.length !== 0;
        }

        document.querySelectorAll('.chip').forEach(function (chip) {
            chip.addEventListener('click', function () {
                var group = chip.dataset.filter;
                document.querySelectorAll('.chip[data-filter="' + group + '"]').forEach(function (other) {
                    other.classList.toggle('is-active', other === chip);
                });
                state[group] = chip.dataset.value;
                apply();
            });
        });

        search.addEventListener('input', function () {
            state.query = search.value.trim().toLowerCase();
            apply();
        });

        apply();
    })();
    </script>
</body>
</html>
`;
}

// Image paths must stay relative so the same files work locally and on the
// server. Returns the src to use, or null when there is nothing to show.
function imageSrc(app) {
    const value = app.image;
    if (!value) {
        const fallback = 'shot.png';
        return fs.existsSync(path.join(APPS_DIR, app.slug, fallback)) ? fallback : null;
    }
    if (/^[a-z]+:\/\//i.test(value)) return value;                 // http(s) URL, fine
    if (/^([a-z]:)?[\\/]/i.test(value)) {                          // absolute disk path
        console.warn(`  ! ${app.slug}: image "${value}" looks like an absolute path. Use a relative path like "shot.png".`);
        return null;
    }
    if (value.startsWith('../')) return value;                     // ../assets/img/x.png
    const local = path.join(APPS_DIR, app.slug, value);
    if (!fs.existsSync(local)) {
        console.warn(`  ! ${app.slug}: image "${value}" not found in apps/${app.slug}/.`);
        return null;
    }
    return value;
}

function authorAvatarHtml(author, up) {
    const value = String(author.avatar || '').trim().replace(/\\/g, '/');
    if (value) {
        if (/^[a-z]+:\/\//i.test(value)) return `<img src="${escapeHtml(value)}" alt="${escapeHtml(author.name)}">`;
        if (/^([a-z]:)?[\\/]/i.test(value)) return escapeHtml(String(author.name || '?').charAt(0));
        const local = path.join(ROOT, value);
        if (fs.existsSync(local)) return `<img src="${up}${escapeHtml(value)}" alt="${escapeHtml(author.name)}">`;
    }
    return escapeHtml(String(author.name || '?').charAt(0));
}

// Renders the product image when one exists, otherwise renders nothing at all.
function screenshotBlock(app) {
    const src = imageSrc(app);
    if (!src) return '';
    return `<div class="screenshot-frame"><img src="${escapeHtml(src)}" alt="${escapeHtml(app.name)} screenshot" loading="lazy"></div>`;
}

function resolveBuy(app, author) {
    if (app.price === 0) return { mode: 'free', href: '', label: 'Open the app' };
    const label = app.price === null ? 'Contact for pricing' : 'Buy';
    // No author email yet -> fall back to the site contact page.
    if (!author.email) return { mode: 'contact', href: '../../contact/', label };
    return {
        mode: 'mailto',
        href: `mailto:${escapeHtml(author.email)}?subject=${encodeURIComponent(app.name)}`,
        label
    };
}

function buildAppPage(app, detail, data) {
    const free = app.price === 0;
    const unknownPrice = app.price === null;
    const author = store.authorFor(data, app);
    const url = `${SITE_URL}/apps/${app.slug}/`;
    const other = data.apps
        .filter(item => item.slug !== app.slug && store.authorFor(data, item).slug === author.slug)
        .slice(0, 3);
    const buy = resolveBuy(app, author);
    const faq = detail.faq.length ? detail.faq : DEFAULT_FAQ;
    const trust = free ? TRUST_FREE : TRUST_PAID;
    // Secondary contact button: author email when available, else the site contact page.
    const askHref = author.email
        ? `mailto:${escapeHtml(author.email)}?subject=${encodeURIComponent(app.name)}`
        : '../../contact/';

    // One price, one button. No license picker, no duplicated headings.
    const buyBlock = `${free
        ? `<div class="price is-free">Free</div>
                    <a class="btn btn-full" href="${url}">Open the app</a>`
        : `<div class="price">$${app.price}<small>one-time</small></div>
                    <a class="btn btn-full" id="buy-button" href="${buy.href}">${escapeHtml(buy.label)}</a>`}
                    <a class="btn btn-secondary btn-full" href="${askHref}">${free ? 'Report a bug' : 'Ask a question'}</a>
                    <ul class="trust-list">
${trust.map(item => `                        <li><span class="trust-mark">&#10003;</span> ${escapeHtml(item)}</li>`).join('\n')}
                    </ul>`;

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: app.name,
        applicationCategory: applicationCategory(app),
        operatingSystem: app.platforms.join(', '),
        softwareVersion: app.version,
        url,
        description: app.tagline,
        author: { '@type': 'Person', name: author.name, url: `${SITE_URL}/authors/${author.slug}/` }
    };
    // Only advertise a price when one is published.
    if (!unknownPrice) {
        schema.offers = {
            '@type': 'Offer',
            price: app.price.toFixed(2),
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock'
        };
    }

    const featuresHtml = detail.features.length ? `
                    <h2 style="margin-top:30px;">What it does</h2>
                    <div class="feature-grid">
${detail.features.map((feature, index) => `                        <div class="feature-item">
                            <span class="feature-mark">${String(index + 1).padStart(2, '0')}</span>
                            <div><strong>${escapeHtml(feature.title)}</strong><span>${escapeHtml(feature.text)}</span></div>
                        </div>`).join('\n')}
                    </div>` : '';

    const changelogHtml = detail.changelog.length ? `
                    <h2 style="margin-top:30px;">What's new</h2>
                    <div>
${detail.changelog.map(entry => `                        <div class="log-entry">
                            <span class="log-version">${escapeHtml(entry.version)}</span><span class="log-date">${escapeHtml(entry.date)}</span>
                            <p>${escapeHtml(entry.text)}</p>
                        </div>`).join('\n')}
                    </div>` : '';

    const requirementsHtml = detail.requirements.length ? `
                    <h2 style="margin-top:30px;">Requirements</h2>
                    <ul class="spec-list">
${detail.requirements.map(item => `                        <li><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></li>`).join('\n')}
                    </ul>` : '';

    const faqHtml = `
                    <h2 style="margin-top:30px;">Questions</h2>
${qaHtml(faq)}`;

    const description = app.description || app.tagline;

    return `${pageHead(`${app.name} | NeonStack Apps`, description, url, 2)}
    <script type="application/ld+json">
    ${JSON.stringify(schema, null, 6)}
    </script>
<body>
    ${siteHeader(2)}

    <main class="container main-content">
        <p class="breadcrumb"><a href="../../">Home</a> / <a href="../">Apps</a> / ${escapeHtml(app.name)}</p>

        <div class="app-layout">
            <div>
                <section class="content-panel">
                    <div class="app-detail-head">
                        <div class="app-icon${app.tint ? ' ' + escapeHtml(app.tint) : ''}">${escapeHtml(app.icon)}</div>
                        <div>
                            <h1>${escapeHtml(app.name)}</h1>
                            <p>${escapeHtml(app.tagline)}</p>
                        </div>
                    </div>
${app.version || app.updated || app.platforms.length ? `                    <div class="detail-meta">
${app.version ? `                        <span class="tag">v${escapeHtml(app.version)}</span>\n` : ''}${app.updated ? `                        <span class="tag">Updated ${escapeHtml(app.updated)}</span>\n` : ''}${app.type ? `                        <span class="badge">${escapeHtml(badgeFor(app))}</span>\n` : ''}${app.platforms.map(platform => `                        <span class="tag">${escapeHtml(platform)}</span>`).join('\n')}
                    </div>\n` : ''}
                    ${screenshotBlock(app)}

                    <p>${escapeHtml(description)}</p>
${featuresHtml}
${changelogHtml}
${requirementsHtml}
${faqHtml}
                </section>
            </div>

            <aside>
                <div class="buy-card">
                    ${buyBlock}
                </div>

${authorCard(author, 2)}
            </aside>
        </div>

        <section class="section-band">
            <div class="section-heading">
                <div>
                    <h2>More by ${escapeHtml(author.name)}</h2>
                </div>
                <a class="card-link" href="../">View all apps</a>
            </div>
            <div class="app-grid">
${other.map(item => `                <a class="app-card" href="../${escapeHtml(item.slug)}/">
                    <div class="app-card-head">
                        <div class="app-icon${item.tint ? ' ' + escapeHtml(item.tint) : ''}">${escapeHtml(item.icon)}</div>
                        <div><h3 class="app-title">${escapeHtml(item.name)}</h3><p class="app-author">by ${escapeHtml(store.authorFor(data, item).name)}</p></div>
                    </div>
                    <p class="app-desc">${escapeHtml(item.tagline)}</p>
                    <div class="app-foot">${item.price === 0 ? '<div class="price is-free">Free</div>' : item.price === null ? '<div class="price">Contact<small>for pricing</small></div>' : `<div class="price">$${item.price}<small>one-time</small></div>`}<span class="app-cta">View details</span></div>
                </a>`).join('\n')}
            </div>
        </section>
    </main>

    ${siteFooter(2)}
</body>
</html>
`;
}

function writeMetaJson(app, author) {
    const meta = {
        title: app.name,
        badge: badgeFor(app),
        description: app.description || app.tagline,
        price: app.price,
        license: app.price === 0 ? ['free'] : ['one-time'],
        platform: app.platforms,
        author: author.slug,
        tags: app.tags,
        version: app.version,
        updated: app.updated
    };
    return JSON.stringify(meta, null, 2) + '\n';
}

function main() {
    const data = store.loadApps();
    if (!data.authors || !Object.keys(data.authors).length) {
        throw new Error('Missing data/authors.json');
    }

    const apps = data.apps.filter(app => app.status !== 'draft');
    if (!apps.length) {
        throw new Error('No published apps found. Check the status column in data/apps.csv.');
    }

    fs.writeFileSync(path.join(APPS_DIR, 'index.html'), buildMarketIndex({ ...data, apps }), 'utf8');
    console.log('Generated apps/index.html');

    for (const app of apps) {
        const detail = data.details[app.slug] || store.emptyDetail();
        const dir = path.join(APPS_DIR, app.slug);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'index.html'), buildAppPage(app, detail, { ...data, apps }), 'utf8');
        fs.writeFileSync(path.join(dir, 'meta.json'), writeMetaJson(app, store.authorFor(data, app)), 'utf8');
        console.log(`Generated apps/${app.slug}/`);
    }

    const drafts = data.apps.length - apps.length;
    console.log(`Apps: ${apps.length}${drafts ? ` (skipped ${drafts} draft${drafts > 1 ? 's' : ''})` : ''}`);
}

main();
