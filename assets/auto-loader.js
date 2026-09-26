// Auto-loader for dynamically populating tools, reviews, and games sections
// This script loads content from generated manifest files.

let contentManifest = null;

// Fallback static manifest (used if generated manifest files fail to load)
const fallbackManifest = {
    tools: [
        {
            title: "Freelance Rate Calculator",
            badge: "Calculator",
            description: "Estimate an hourly rate from income goals, taxes, expenses, and billable hours.",
            link: "tools/freelance-rate-calculator/",
            cta: "Open tool"
        },
        {
            title: "Word Counter",
            badge: "Writing",
            description: "Count words, characters, paragraphs, reading time, and keyword density.",
            link: "tools/word-counter/",
            cta: "Open tool"
        },
        {
            title: "Time Zone Coordinator",
            badge: "Planning",
            description: "Compare global working hours and pick a meeting slot across cities.",
            link: "tools/time-zone-coordinator/",
            cta: "Open tool"
        },
        {
            title: "Password Generator",
            badge: "Security",
            description: "Generate strong, random passwords with customizable length and character sets.",
            link: "tools/password-generator/",
            cta: "Open tool"
        },
        {
            title: "JSON Formatter",
            badge: "Developer",
            description: "Format, validate, and beautify JSON data with syntax highlighting.",
            link: "tools/json-formatter/",
            cta: "Open tool"
        },
        {
            title: "Color Converter",
            badge: "Design",
            description: "Convert between HEX, RGB, HSL color formats instantly.",
            link: "tools/color-converter/",
            cta: "Open tool"
        },
        {
            title: "Base64 Tool",
            badge: "Developer",
            description: "Encode and decode Base64 strings for text and files.",
            link: "tools/base64-tool/",
            cta: "Open tool"
        },
        {
            title: "QR Code Generator",
            badge: "Utility",
            description: "Create scannable QR codes for URLs, text, and contact info.",
            link: "tools/qr-code-generator/",
            cta: "Open tool"
        },
        {
            title: "Pomodoro Timer",
            badge: "Productivity",
            description: "Stay focused with customizable work/break interval timers.",
            link: "tools/pomodoro-timer/",
            cta: "Open tool"
        },
        {
            title: "BMI Calculator",
            badge: "Health",
            description: "Calculate body mass index and health range recommendations.",
            link: "tools/bmi-calculator/",
            cta: "Open tool"
        },
        {
            title: "Loan Calculator",
            badge: "Finance",
            description: "Calculate monthly payments and total interest for loans.",
            link: "tools/loan-calculator/",
            cta: "Open tool"
        },
        {
            title: "Unit Converter",
            badge: "Calculator",
            description: "Convert between metric and imperial units instantly.",
            link: "tools/unit-converter/",
            cta: "Open tool"
        },
        {
            title: "World Clock",
            badge: "Planning",
            description: "View current time across multiple time zones simultaneously.",
            link: "tools/world-clock/",
            cta: "Open tool"
        },
        {
            title: "Countdown Generator",
            badge: "Event",
            description: "Create countdowns to important dates and deadlines.",
            link: "tools/countdown-generator/",
            cta: "Open tool"
        },
        {
            title: "Text Diff Checker",
            badge: "Developer",
            description: "Compare two text blocks and highlight differences.",
            link: "tools/text-diff-checker/",
            cta: "Open tool"
        },
        {
            title: "Regex Tester",
            badge: "Developer",
            description: "Test and debug regular expressions with live matching.",
            link: "tools/regex-tester/",
            cta: "Open tool"
        },
        {
            title: "Markdown Previewer",
            badge: "Writing",
            description: "Preview markdown formatting in real-time.",
            link: "tools/markdown-previewer/",
            cta: "Open tool"
        },
        {
            title: "Image Compressor",
            badge: "Utility",
            description: "Reduce image file sizes while maintaining quality.",
            link: "tools/image-compressor/",
            cta: "Open tool"
        },
        {
            title: "Text to Speech",
            badge: "Accessibility",
            description: "Convert written text to spoken audio playback.",
            link: "tools/text-to-speech/",
            cta: "Open tool"
        },
        {
            title: "Hex Color Picker",
            badge: "Design",
            description: "Pick and preview colors with hex, RGB, and HSL values.",
            link: "tools/hex-color-picker/",
            cta: "Open tool"
        },
        {
            title: "Emoji Picker",
            badge: "Writing",
            description: "Browse and copy emojis with search and categories.",
            link: "tools/emoji-picker/",
            cta: "Open tool"
        },
        {
            title: "Morse Code Converter",
            badge: "Fun",
            description: "Translate text to morse code and play audio signals.",
            link: "tools/morse-code-converter/",
            cta: "Open tool"
        },
        {
            title: "Speed Test",
            badge: "Network",
            description: "Check your internet download and upload speeds.",
            link: "tools/speed-test/",
            cta: "Open tool"
        }
    ],
    reviews: [
        {
            title: "Quiet Mechanical Keyboards",
            badge: "Buying guide",
            description: "Compare switches, sound profiles, typing feel, and gaming tradeoffs.",
            link: "reviews/mechanical-keyboard-guide/",
            cta: "Read guide"
        },
        {
            title: "ANC Headphones",
            badge: "Buying guide",
            description: "Review comfort, battery life, noise cancellation, and travel value.",
            link: "reviews/anc-headphones-review/",
            cta: "Read guide"
        },
        {
            title: "Standing Desks",
            badge: "Buying guide",
            description: "Compare stability, height range, motor noise, frames, and desktop options.",
            link: "reviews/standing-desk-review/",
            cta: "Read guide"
        },
        {
            title: "Ergonomic Chairs",
            badge: "Buying guide",
            description: "Review lumbar support, adjustability, and long-term comfort.",
            link: "reviews/ergonomic-chair/",
            cta: "Read guide"
        },
        {
            title: "Silent Office Mouse",
            badge: "Buying guide",
            description: "Compare click noise, sensor precision, and battery life.",
            link: "reviews/silent-office-mouse/",
            cta: "Read guide"
        },
        {
            title: "Gaming Monitors",
            badge: "Buying guide",
            description: "Review refresh rates, response times, panel types, and HDR.",
            link: "reviews/gaming-monitor/",
            cta: "Read guide"
        },
        {
            title: "Webcams",
            badge: "Buying guide",
            description: "Compare video quality, autofocus, low-light performance.",
            link: "reviews/webcam/",
            cta: "Read guide"
        },
        {
            title: "Microphones",
            badge: "Buying guide",
            description: "Review audio quality, polar patterns, and noise rejection.",
            link: "reviews/microphone/",
            cta: "Read guide"
        },
        {
            title: "E-Readers",
            badge: "Buying guide",
            description: "Compare screen tech, battery life, library ecosystems.",
            link: "reviews/e-reader-comparison/",
            cta: "Read guide"
        },
        {
            title: "Desk Lamps",
            badge: "Buying guide",
            description: "Review brightness controls, color temperature, and eye strain.",
            link: "reviews/desk-lamp/",
            cta: "Read guide"
        },
        {
            title: "USB-C Hubs",
            badge: "Buying guide",
            description: "Compare port selection, power delivery, and data speeds.",
            link: "reviews/usb-c-hub/",
            cta: "Read guide"
        },
        {
            title: "External SSDs",
            badge: "Buying guide",
            description: "Review transfer speeds, durability, and capacity options.",
            link: "reviews/external-ssd/",
            cta: "Read guide"
        },
        {
            title: "WiFi Routers",
            badge: "Buying guide",
            description: "Compare range, speed standards, and device handling.",
            link: "reviews/wifi-router/",
            cta: "Read guide"
        },
        {
            title: "Power Banks",
            badge: "Buying guide",
            description: "Review capacity, charging speed, and portability.",
            link: "reviews/power-bank/",
            cta: "Read guide"
        },
        {
            title: "Wireless Chargers",
            badge: "Buying guide",
            description: "Compare charging speeds, compatibility, and build quality.",
            link: "reviews/wireless-charger/",
            cta: "Read guide"
        },
        {
            title: "Bluetooth Speakers",
            badge: "Buying guide",
            description: "Review sound quality, battery life, and water resistance.",
            link: "reviews/bluetooth-speaker/",
            cta: "Read guide"
        },
        {
            title: "Wired Earbuds",
            badge: "Buying guide",
            description: "Compare audio clarity, cable durability, and price value.",
            link: "reviews/wired-earbuds/",
            cta: "Read guide"
        },
        {
            title: "Bone Conduction Headphones",
            badge: "Buying guide",
            description: "Review safety, sound quality, and exercise suitability.",
            link: "reviews/bone-conduction-headphones/",
            cta: "Read guide"
        },
        {
            title: "Fitness Trackers",
            badge: "Buying guide",
            description: "Compare heart rate accuracy, sleep tracking, and battery.",
            link: "reviews/fitness-tracker/",
            cta: "Read guide"
        },
        {
            title: "Smart Thermostats",
            badge: "Buying guide",
            description: "Review scheduling, energy savings, and smart home integration.",
            link: "reviews/smart-thermostat/",
            cta: "Read guide"
        },
        {
            title: "Robot Vacuums",
            badge: "Buying guide",
            description: "Compare suction power, navigation, and self-emptying options.",
            link: "reviews/robot-vacuum/",
            cta: "Read guide"
        },
        {
            title: "Portable Projectors",
            badge: "Buying guide",
            description: "Review brightness, resolution, and battery runtime.",
            link: "reviews/portable-projector/",
            cta: "Read guide"
        },
        {
            title: "Streaming Devices",
            badge: "Buying guide",
            description: "Compare app support, 4K capability, and remote controls.",
            link: "reviews/streaming-device/",
            cta: "Read guide"
        },
        {
            title: "Mini PCs",
            badge: "Buying guide",
            description: "Review performance, upgradeability, and thermal management.",
            link: "reviews/mini-pc/",
            cta: "Read guide"
        },
        {
            title: "Drawing Tablets",
            badge: "Buying guide",
            description: "Compare pressure levels, pen accuracy, and software support.",
            link: "reviews/drawing-tablet/",
            cta: "Read guide"
        },
        {
            title: "Mirrorless Cameras",
            badge: "Buying guide",
            description: "Review sensor size, autofocus systems, and lens ecosystems.",
            link: "reviews/mirrorless-camera-guide/",
            cta: "Read guide"
        }
    ],
    games: [
        {
            title: "Pokemon Type Calculator",
            badge: "Calculator",
            description: "Check weaknesses, resistances, and immunities for single or dual types.",
            link: "games/pokemon-type-calculator/",
            cta: "Open helper"
        },
        {
            title: "Minecraft Crafting Guide",
            badge: "Lookup",
            description: "Search common crafting recipes without leaving your game flow.",
            link: "games/minecraft-crafting-guide/",
            cta: "Open helper"
        },
        {
            title: "Stardew Valley Profit",
            badge: "Calculator",
            description: "Compare crop returns by season, growth time, and seed costs.",
            link: "games/stardew-valley-profit/",
            cta: "Open helper"
        },
        {
            title: "Genshin Material Calculator",
            badge: "Calculator",
            description: "Track character and weapon ascension material requirements.",
            link: "games/genshin-material-calculator/",
            cta: "Open helper"
        },
        {
            title: "Valorant Weapon Stats",
            badge: "Reference",
            description: "Compare damage, fire rate, and magazine size across weapons.",
            link: "games/valorant-weapon-stats/",
            cta: "Open helper"
        },
        {
            title: "Monster Hunter Weakness",
            badge: "Lookup",
            description: "Check monster elemental weaknesses and breakable parts.",
            link: "games/monster-hunter-weakness/",
            cta: "Open helper"
        },
        {
            title: "Zelda Shrine Tracker",
            badge: "Tracker",
            description: "Track completed shrines across all regions with maps.",
            link: "games/zelda-shrine-tracker/",
            cta: "Open helper"
        },
        {
            title: "Animal Crossing Art Guide",
            badge: "Lookup",
            description: "Identify real vs fake artwork for Redd's gallery.",
            link: "games/animal-crossing-art-guide/",
            cta: "Open helper"
        },
        {
            title: "Steam Regional Pricing",
            badge: "Comparison",
            description: "Compare game prices across Steam regions and currencies.",
            link: "games/steam-regional-pricing/",
            cta: "Open helper"
        }
    ],
    apps: [
        {
            title: "Boss Auto-Apply",
            badge: "Script",
            description: "Apply to matched jobs on BOSS Zhipin automatically, with rules you control.",
            link: "apps/boss-auto-apply/",
            cta: "View app"
        },
        {
            title: "LinkedIn Toolkit",
            badge: "Script",
            description: "Track conversations and fill repeated application fields from one saved profile.",
            link: "apps/linkedin-toolkit/",
            cta: "View app"
        },
        {
            title: "CareerOS",
            badge: "Desktop",
            description: "A local command-line assistant that collects job listings and drafts applications.",
            link: "apps/career-os/",
            cta: "View app"
        },
        {
            title: "War3 Hotkey Editor",
            badge: "Web app",
            description: "Build a custom Warcraft III hotkey layout visually and export the config.",
            link: "apps/war3-hotkey-editor/",
            cta: "View app"
        },
        {
            title: "Wallet Connect Kit",
            badge: "Template",
            description: "Drop-in React wallet connection for EVM and Solana chains.",
            link: "apps/wallet-connect-kit/",
            cta: "View app"
        },
        {
            title: "Quantify Strategy Lab",
            badge: "Desktop",
            description: "Backtest trading strategies against historical candles and export Pine scripts.",
            link: "apps/quantify-strategy-lab/",
            cta: "View app"
        }
    ]
};

// Function to create a card element
function createCard(item) {
    const card = document.createElement('a');
    card.className = 'site-card';
    card.href = item.link;

    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = item.badge || 'Content';

    const title = document.createElement('h3');
    title.textContent = item.title || 'Untitled';

    const description = document.createElement('p');
    description.textContent = item.description || '';

    const cta = document.createElement('span');
    cta.className = 'card-link';
    cta.textContent = item.cta || 'Open';

    card.append(badge, title, description, cta);
    return card;
}

// Function to populate a section
function populateSection(sectionId, items) {
    const section = document.querySelector(`#${sectionId} .site-grid`);
    if (!section) return;
    
    // Clear existing content
    section.innerHTML = '';
    
    // Sort items alphabetically by title
    const sortedItems = [...items].sort((a, b) => a.title.localeCompare(b.title));
    
    // Add all items
    sortedItems.forEach(item => {
        section.appendChild(createCard(item));
    });
}

// Load manifest from JSON file
async function loadManifest() {
    if (window.__CONTENT_MANIFEST__) {
        return window.__CONTENT_MANIFEST__;
    }

    try {
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        const response = await fetch(`content-manifest.json?v=${timestamp}`);
        if (!response.ok) throw new Error('Manifest not found');
        return await response.json();
    } catch (err) {
        console.warn('Could not load content-manifest.json, using fallback:', err.message);
        return fallbackManifest;
    }
}

function loadManifestScript() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `assets/content-manifest.js?v=${Date.now()}`;
        script.onload = () => {
            script.remove();
            resolve(window.__CONTENT_MANIFEST__);
        };
        script.onerror = () => {
            script.remove();
            reject(new Error('Manifest script not found'));
        };
        document.head.appendChild(script);
    });
}

async function loadFreshManifest() {
    if (location.protocol === 'file:') {
        return loadManifestScript();
    }

    const timestamp = new Date().getTime();
    const response = await fetch(`content-manifest.json?v=${timestamp}`);
    if (!response.ok) throw new Error('Manifest not found');
    return response.json();
}

async function refreshManifest() {
    const nextManifest = await loadFreshManifest();
    if (!nextManifest || nextManifest.generated === contentManifest?.generated) return;

    contentManifest = nextManifest;
    populateSection('tools', contentManifest.tools);
    populateSection('reviews', contentManifest.reviews);
    populateSection('games', contentManifest.games);
    populateSection('apps', contentManifest.apps || []);
}

function startLocalAutoRefresh() {
    const localHosts = ['', 'localhost', '127.0.0.1'];
    const isLocalPreview = location.protocol === 'file:' || localHosts.includes(location.hostname);
    if (!isLocalPreview) return;

    setInterval(async () => {
        try {
            await refreshManifest();
        } catch (err) {
            console.warn('Could not refresh content manifest:', err.message);
        }
    }, 2000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    contentManifest = await loadManifest();
    
    populateSection('tools', contentManifest.tools);
    populateSection('reviews', contentManifest.reviews);
    populateSection('games', contentManifest.games);
    populateSection('apps', contentManifest.apps || []);
    
    console.log('📦 Loaded content:', {
        tools: contentManifest.tools.length,
        reviews: contentManifest.reviews.length,
        games: contentManifest.games.length,
        apps: (contentManifest.apps || []).length
    });

    startLocalAutoRefresh();
});
