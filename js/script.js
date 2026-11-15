

document.addEventListener("DOMContentLoaded", () => {

/**
 * Classic AdSense-Style Text Ad Engine for Article Websites
 * Includes configurable placement zones (aboveMain, inArticle, belowMain, sidebar),
 * @media print hiding, container measurement, 15-second rotation, and localStorage("theme") support.
 */
(function initArticleAdSense(options = {}) {
  // 1. Placement Settings Object (Controls where and how adverts appear)
  const DEFAULT_PLACEMENTS = {
    // Use existing [data-ad-slot] elements if present on the page
    useManualSlots: true,
    // Set to true to ONLY render inside manual [data-ad-slot] elements and disable auto-injection
    manualSlotsOnly: false,

    // Zone 1: Leaderboard placed directly above the <main> element
    aboveMain: {
      enabled: true,
      mainSelector: "main",
    },

    // Zone 2: In-article units spaced between body paragraphs
    inArticle: {
      enabled: true,
      containerSelector: "main article, article, main",
      startAfterParagraph: 2, // Inject first ad after the Nth qualifying paragraph
      paragraphInterval: 4,   // Inject subsequent ads every N qualifying paragraphs
      maxUnits: 3,            // Maximum number of ads inside the article body
      minParagraphChars: 110, // Minimum character count for a paragraph to qualify
    },

    // Zone 3: Closing banner placed directly below the <main> element
    belowMain: {
      enabled: true,
      mainSelector: "main",
      minTotalParagraphs: 3,  // Only show if the main content has at least N qualifying paragraphs
    },

    // Zone 4: Sidebar units inside <aside> elements outside the main article
    sidebar: {
      enabled: true,
      selector: "aside",
      topUnit: true,          // Place an ad at the top of the sidebar
      stickyBottomUnit: true, // Place a sticky ad at the bottom on long pages
      minPageHeightForSticky: 1400,
    },

    // Zone 5: Fallback placement if no other zones match on the page
    fallback: {
      enabled: true,
      selector: "main, body",
    },
  };

  // Merge user-supplied placement overrides with defaults
  const userPlacements = options.placements || {};
  const PLACEMENTS = {
    useManualSlots:
      userPlacements.useManualSlots ?? DEFAULT_PLACEMENTS.useManualSlots,
    manualSlotsOnly:
      userPlacements.manualSlotsOnly ?? DEFAULT_PLACEMENTS.manualSlotsOnly,
    aboveMain: {
      ...DEFAULT_PLACEMENTS.aboveMain,
      ...(userPlacements.aboveMain || {}),
    },
    inArticle: {
      ...DEFAULT_PLACEMENTS.inArticle,
      ...(userPlacements.inArticle || {}),
    },
    belowMain: {
      ...DEFAULT_PLACEMENTS.belowMain,
      ...(userPlacements.belowMain || {}),
    },
    sidebar: {
      ...DEFAULT_PLACEMENTS.sidebar,
      ...(userPlacements.sidebar || {}),
    },
    fallback: {
      ...DEFAULT_PLACEMENTS.fallback,
      ...(userPlacements.fallback || {}),
    },
  };

  const CONFIG = {
    rotationIntervalMs: options.rotationIntervalMs || 15000,
    adLabelText: options.adLabelText || "Ads",
    themeStorageKey: options.themeStorageKey || "theme",
    placements: PLACEMENTS,
  };

  // 2. Advertisement Inventory (Multiple variations per URL)
  const AD_CATALOG = {
    "https://webmconverter.app?affiliate=salivity": [
      {
        title: "Free Online WebM Converter",
        description: "Convert MP4, MOV, and AVI files to high-quality WebM format right in your browser.",
        displayUrl: "webmconverter.app",
      },
      {
        title: "Fast Video to WebM Tool",
        description: "Compress and convert videos to HTML5 WebM with zero quality loss. No software install needed.",
        displayUrl: "webmconverter.app/convert",
      },
      {
        title: "Batch WebM Video Converter",
        description: "Transcode multiple video files to WebM in seconds. Fast, private, browser-based processing.",
        displayUrl: "webmconverter.app",
      },
    ],
    "https://textreader.app?affiliate=salivity": [
      {
        title: "Natural Online Text Reader",
        description: "Listen to documents, articles, and pasted text with lifelike text-to-speech voices.",
        displayUrl: "textreader.app",
      },
      {
        title: "Read Any Text Aloud Free",
        description: "Convert PDFs, web pages, and notes into clear spoken audio instantly inside your browser.",
        displayUrl: "textreader.app/listen",
      },
      {
        title: "Instant Text-to-Speech App",
        description: "Boost productivity and accessibility. Paste your text and listen at custom playback speeds.",
        displayUrl: "textreader.app",
      },
    ],
    "https://avifconverter.app?affiliate=salivity": [
      {
        title: "Next-Gen AVIF Image Converter",
        description: "Shrink image file sizes by up to 50% by converting JPG and PNG files to AVIF online.",
        displayUrl: "avifconverter.app",
      },
      {
        title: "Convert JPG & PNG to AVIF",
        description: "Need standard image formats? Instantly turn PNG or JPEG files pictures into widely supported AVIF.",
        displayUrl: "avifconverter.app/decode",
      },
      {
        title: "Bulk AVIF Compression Tool",
        description: "Speed up your website with ultra-lightweight AVIF images. Free client-side batch conversion.",
        displayUrl: "avifconverter.app",
      },
    ],
    "https://webpconverter.app?affiliate=salivity": [
      {
        title: "Instant WebP Image Converter",
        description: "Convert PNG and JPG images to fast-loading WebP format or turn WebP back into standard formats.",
        displayUrl: "webpconverter.app",
      },
      {
        title: "Free Bulk WebP Optimizer",
        description: "Optimize images for Core Web Vitals. Select dozens of photos for instant WebP conversion.",
        displayUrl: "webpconverter.app/batch",
      },
      {
        title: "Convert PNG & JPG to WebP Online",
        description: "Downloaded a WebP file you cannot open? Convert it to a standard PNG or JPEG in one click.",
        displayUrl: "webpconverter.app",
      },
    ],
    "https://imagedownloader.website?affiliate=salivity": [
      {
        title: "Bulk Web Image Downloader",
        description: "Extract and download all photos, icons, and SVGs from any webpage URL in a single click.",
        displayUrl: "imagedownloader.website",
      },
      {
        title: "Download All Images from URL",
        description: "Filter web images by resolution, file type, or dimensions before downloading them in bulk.",
        displayUrl: "imagedownloader.website/extract",
      },
      {
        title: "Free Online Gallery Grabber",
        description: "Save high-resolution pictures from public web pages quickly without installing browser extensions.",
        displayUrl: "imagedownloader.website",
      },
    ],
    "https://pngconverter.app?affiliate=salivity": [
      {
        title: "Universal PNG Converter",
        description: "Turn images into crisp, lossless PNG files directly in your browser.",
        displayUrl: "pngconverter.app",
      },
      {
        title: "Lossless PNG Format Tool",
        description: "Preserve transparency and sharp edges. Convert images to and from PNG format with zero uploads.",
        displayUrl: "pngconverter.app/tools",
      },
      {
        title: "Fast Batch PNG Conversion",
        description: "Convert dozens of graphics to high-grade PNGs simultaneously. 100% free and privacy-focused.",
        displayUrl: "pngconverter.app",
      },
    ],
    "https://urlopener.link?affiliate=salivity": [
      {
        title: "Bulk URL Opener Tool",
        description: "Paste a list of links and open dozens of web pages in separate browser tabs with a single click.",
        displayUrl: "urlopener.link",
      },
      {
        title: "Open Multiple Links at Once",
        description: "Built for SEO pros, researchers, and power users. Manage and launch batch URL lists effortlessly.",
        displayUrl: "urlopener.link/batch",
      },
      {
        title: "Fast Multi-Tab Link Launcher",
        description: "Stop copying and pasting links one by one. Launch your entire daily workflow list instantly.",
        displayUrl: "urlopener.link",
      },
    ],
    "https://unzipper.app?affiliate=salivity": [
      {
        title: "Extract ZIP Files Online",
        description: "Open and unpack ZIP, APK, CBZ, CRX and JAR archives right in your browser without installing software.",
        displayUrl: "unzipper.app",
      },
      {
        title: "Free Browser Archive Unzipper",
        description: "Preview and download individual files from compressed archives safely on any device.",
        displayUrl: "unzipper.app/extract",
      },
      {
        title: "Fast & Private Online Unzipper",
        description: "Unpack compressed folders locally in your browser. Your private files never leave your computer.",
        displayUrl: "unzipper.app",
      },
    ],
  };

  const ALL_ADS = Object.entries(AD_CATALOG).flatMap(([url, variations]) =>
    variations.map((ad) => ({ ...ad, targetUrl: url }))
  );

  // 3. Theme Resolution & Synchronization (localStorage "theme": "light" | "dark")
  function getCurrentTheme() {
    try {
      const storedTheme = localStorage.getItem(CONFIG.themeStorageKey);
      if (storedTheme === "dark" || storedTheme === "light") {
        return storedTheme;
      }
    } catch (e) {
      // Ignore storage access errors in restricted contexts
    }
    return "light";
  }

  function applyThemeToSlots() {
    const activeTheme = getCurrentTheme();
    document.querySelectorAll(".retro-ad-slot").forEach((slot) => {
      slot.setAttribute("data-ad-theme", activeTheme);
    });
  }

  function observeThemeChanges() {
    window.addEventListener("storage", (event) => {
      if (event.key === CONFIG.themeStorageKey || event.key === null) {
        applyThemeToSlots();
      }
    });

    try {
      const originalSetItem = Storage.prototype.setItem;
      if (!Storage.prototype._retroAdPatched) {
        Storage.prototype.setItem = function (key, value) {
          originalSetItem.apply(this, arguments);
          if (key === CONFIG.themeStorageKey) {
            applyThemeToSlots();
          }
        };
        Storage.prototype._retroAdPatched = true;
      }
    } catch (e) {
      // Fallback if Storage prototype is frozen
    }

    if ("MutationObserver" in window) {
      const attrObserver = new MutationObserver(() => applyThemeToSlots());
      attrObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class", "data-theme", "style"],
      });
      if (document.body) {
        attrObserver.observe(document.body, {
          attributes: true,
          attributeFilter: ["class", "data-theme", "style"],
        });
      }
    }
  }

  // 4. Inject Light, Dark & Print Mode Styles
  function injectStyles() {
    if (document.getElementById("retro-adsense-styles")) return;

    const style = document.createElement("style");
    style.id = "retro-adsense-styles";
    style.textContent = `
      .retro-ad-slot,
      .retro-ad-slot[data-ad-theme="light"] {
        --ad-bg: #ffffff;
        --ad-border: #d9d9d9;
        --ad-divider: #ececec;
        --ad-title: #1a0dab;
        --ad-title-visited: #681da8;
        --ad-title-hover: #cc0000;
        --ad-desc: #202124;
        --ad-url: #006621;
        --ad-badge: #5f6368;
        --ad-badge-icon: #00aecd;
      }

      .retro-ad-slot[data-ad-theme="dark"] {
        --ad-bg: #18191c;
        --ad-border: #33363d;
        --ad-divider: #282a30;
        --ad-title: #8ab4f8;
        --ad-title-visited: #c58af9;
        --ad-title-hover: #f28b82;
        --ad-desc: #e8eaed;
        --ad-url: #81c995;
        --ad-badge: #9aa0a6;
        --ad-badge-icon: #4dd0e1;
      }

      .retro-ad-slot {
        box-sizing: border-box;
        background-color: var(--ad-bg);
        border: 1px solid var(--ad-border);
        border-radius: 2px;
        font-family: Arial, Helvetica, sans-serif;
        padding: 10px 12px 20px 12px;
        margin: 22px 0;
        position: relative;
        overflow: hidden;
        width: 100%;
        clear: both;
        transition: opacity 0.25s ease-in-out, background-color 0.2s ease, border-color 0.2s ease;
      }
      .retro-ad-slot--leaderboard {
        min-height: 90px;
      }
      .retro-ad-slot--inarticle {
        min-height: 98px;
        margin: 26px 0;
      }
      .retro-ad-slot--sidebar {
        min-height: 250px;
      }
      .retro-ad-slot--sidebar-sticky {
        min-height: 250px;
        position: sticky;
        top: 20px;
      }
      .retro-ad-grid {
        display: flex;
        gap: 14px;
        width: 100%;
        height: 100%;
      }
      .retro-ad-grid--row {
        flex-direction: row;
        align-items: stretch;
      }
      .retro-ad-grid--column {
        flex-direction: column;
      }
      .retro-ad-item {
        flex: 1 1 0;
        min-width: 0;
        line-height: 1.4;
        text-align: left;
      }
      .retro-ad-grid--row .retro-ad-item:not(:first-child) {
        border-left: 1px solid var(--ad-divider);
        padding-left: 12px;
      }
      .retro-ad-grid--column .retro-ad-item:not(:first-child) {
        border-top: 1px solid var(--ad-divider);
        padding-top: 8px;
      }
      .retro-ad-title {
        display: inline-block;
        color: var(--ad-title);
        font-size: 14px;
        font-weight: bold;
        text-decoration: underline;
        margin-bottom: 3px;
        word-wrap: break-word;
      }
      .retro-ad-title:visited {
        color: var(--ad-title-visited);
      }
      .retro-ad-title:hover {
        color: var(--ad-title-hover);
      }
      .retro-ad-desc {
        color: var(--ad-desc);
        font-size: 12px;
        margin: 2px 0 4px 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .retro-ad-url {
        display: block;
        color: var(--ad-url);
        font-size: 11px;
        text-decoration: none;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .retro-ad-badge {
        position: absolute;
        bottom: 3px;
        right: 8px;
        font-size: 10px;
        color: var(--ad-badge);
        font-family: Arial, sans-serif;
        user-select: none;
      }
      .retro-ad-badge::before {
        content: "";
        color: var(--ad-badge-icon);
        font-weight: bold;
      }

      /* Completely hide all advertisements when printing the page */
      @media print {
        .retro-ad-slot,
        [data-ad-slot] {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
          min-height: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          overflow: hidden !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // 5. Article-Aware HTML5 Placement Engine Driven by CONFIG.placements
  function isSafeArticleParagraph(p, minChars) {
    if (
      p.closest(
        "blockquote, figure, figcaption, table, li, aside, nav, header, footer"
      )
    ) {
      return false;
    }
    const text = (p.textContent || "").trim();
    if (text.length < minChars) {
      return false;
    }
    const nextEl = p.nextElementSibling;
    if (
      text.endsWith(":") &&
      nextEl &&
      /^(UL|OL|PRE|TABLE|BLOCKQUOTE)$/i.test(nextEl.tagName)
    ) {
      return false;
    }
    return true;
  }

  function injectArticleContainers() {
    const pCfg = CONFIG.placements;
    const theme = getCurrentTheme();
    const injectedSlots = [];

    // Check for manually placed [data-ad-slot] containers
    if (pCfg.useManualSlots) {
      const manualSlots = Array.from(
        document.querySelectorAll("[data-ad-slot], .retro-ad-slot")
      );
      manualSlots.forEach((slot) => {
        slot.classList.add("retro-ad-slot");
        slot.setAttribute("data-ad-theme", theme);
        injectedSlots.push(slot);
      });

      if (pCfg.manualSlotsOnly || injectedSlots.length > 0) {
        return injectedSlots;
      }
    }

    const createSlot = (modifierClass, zoneName) => {
      const slot = document.createElement("aside");
      slot.className = `retro-ad-slot ${modifierClass}`;
      slot.setAttribute("aria-label", "Advertisement");
      slot.setAttribute("data-ad-theme", theme);
      slot.setAttribute("data-ad-zone", zoneName);
      return slot;
    };

    const article = document.querySelector(pCfg.inArticle.containerSelector);

    // Zone 1: Above <main>
    if (pCfg.aboveMain.enabled) {
      const mainEl = document.querySelector(pCfg.aboveMain.mainSelector);
      if (mainEl && mainEl.parentNode) {
        const slot = createSlot("retro-ad-slot--leaderboard", "aboveMain");
        mainEl.parentNode.insertBefore(slot, mainEl);
        injectedSlots.push(slot);
      }
    }

    // Zone 2: In-Article Paragraphs
    const qualifyingParagraphs = article
      ? Array.from(article.querySelectorAll("p")).filter((p) =>
          isSafeArticleParagraph(p, pCfg.inArticle.minParagraphChars)
        )
      : [];

    if (article && pCfg.inArticle.enabled && pCfg.inArticle.maxUnits > 0) {
      let inArticleCount = 0;
      const startIdx = Math.max(0, pCfg.inArticle.startAfterParagraph - 1);
      const interval = Math.max(1, pCfg.inArticle.paragraphInterval);

      for (let i = startIdx; i < qualifyingParagraphs.length - 1; i++) {
        const isStartParagraph = i === startIdx;
        const isIntervalParagraph =
          i > startIdx && (i - startIdx) % interval === 0;

        if (
          (isStartParagraph || isIntervalParagraph) &&
          inArticleCount < pCfg.inArticle.maxUnits
        ) {
          const targetP = qualifyingParagraphs[i];
          const slot = createSlot("retro-ad-slot--inarticle", "inArticle");
          targetP.parentNode.insertBefore(slot, targetP.nextSibling);
          injectedSlots.push(slot);
          inArticleCount++;
        }
      }
    }

    // Zone 3: Below <main>
    if (pCfg.belowMain.enabled) {
      const mainEl = document.querySelector(pCfg.belowMain.mainSelector);
      const mainParagraphCount =
        qualifyingParagraphs.length ||
        (mainEl ? mainEl.querySelectorAll("p").length : 0);

      if (
        mainEl &&
        mainEl.parentNode &&
        mainParagraphCount >= pCfg.belowMain.minTotalParagraphs
      ) {
        const endSlot = createSlot("retro-ad-slot--leaderboard", "belowMain");
        mainEl.parentNode.insertBefore(endSlot, mainEl.nextSibling);
        injectedSlots.push(endSlot);
      }
    }

    // Zone 4: Sidebar Units
    if (pCfg.sidebar.enabled) {
      const sidebars = Array.from(
        document.querySelectorAll(pCfg.sidebar.selector)
      ).filter(
        (el) =>
          !el.classList.contains("retro-ad-slot") &&
          (!article || !article.contains(el))
      );

      sidebars.forEach((sidebar) => {
        if (pCfg.sidebar.topUnit) {
          const topSlot = createSlot("retro-ad-slot--sidebar", "sidebarTop");
          sidebar.prepend(topSlot);
          injectedSlots.push(topSlot);
        }

        if (
          pCfg.sidebar.stickyBottomUnit &&
          sidebar.children.length > 2 &&
          document.body.scrollHeight >= pCfg.sidebar.minPageHeightForSticky
        ) {
          const stickySlot = createSlot(
            "retro-ad-slot--sidebar-sticky",
            "sidebarSticky"
          );
          sidebar.appendChild(stickySlot);
          injectedSlots.push(stickySlot);
        }
      });
    }

    // Zone 5: Fallback
    if (injectedSlots.length === 0 && pCfg.fallback.enabled) {
      const fallbackHost =
        document.querySelector(pCfg.fallback.selector) || document.body;
      const slot = createSlot("retro-ad-slot--inarticle", "fallback");
      fallbackHost.appendChild(slot);
      injectedSlots.push(slot);
    }

    return injectedSlots;
  }

  // 6. Measure Container Size & Calculate Optimal Layout
  function calculateLayoutForContainer(container) {
    const rect = container.getBoundingClientRect();
    const width = rect.width || container.clientWidth || 300;
    const height = rect.height || container.clientHeight || 100;

    if (width < 220 && height < 95) {
      return { direction: "column", count: 1, showDescription: false };
    }
    if (width >= 640 && height < 210) {
      return { direction: "row", count: 3, showDescription: true };
    }
    if (width >= 440 && height < 210) {
      return { direction: "row", count: 2, showDescription: true };
    }
    if (width < 380 && height >= 210) {
      const count = Math.min(4, Math.max(2, Math.floor(height / 92)));
      return { direction: "column", count, showDescription: true };
    }
    if (width >= 380 && height >= 210) {
      const cols = width >= 580 ? 2 : 1;
      const rows = Math.min(3, Math.max(2, Math.floor(height / 95)));
      return {
        direction: cols > 1 ? "row" : "column",
        count: cols * rows,
        showDescription: true,
      };
    }
    return { direction: "column", count: 1, showDescription: true };
  }

  // 7. Select Non-Repeating Ads Across Domains
  function pickRandomAds(count, excludeTitles = new Set()) {
    const shuffled = [...ALL_ADS].sort(() => Math.random() - 0.5);
    const selected = [];
    const usedDomains = new Set();

    for (const ad of shuffled) {
      if (selected.length >= count) break;
      if (!usedDomains.has(ad.targetUrl) && !excludeTitles.has(ad.title)) {
        selected.push(ad);
        usedDomains.add(ad.targetUrl);
      }
    }

    for (const ad of shuffled) {
      if (selected.length >= count) break;
      if (!selected.includes(ad)) {
        selected.push(ad);
      }
    }

    return selected;
  }

  // 8. Render Ad Unit Inside Container
  function renderSlot(slot) {
    slot.setAttribute("data-ad-theme", getCurrentTheme());

    const layout = calculateLayoutForContainer(slot);
    const previousTitles = new Set(
      (slot.dataset.lastTitles || "").split("|").filter(Boolean)
    );
    const adsToDisplay = pickRandomAds(layout.count, previousTitles);

    slot.dataset.lastTitles = adsToDisplay.map((a) => a.title).join("|");

    const grid = document.createElement("div");
    grid.className = `retro-ad-grid retro-ad-grid--${layout.direction}`;

    adsToDisplay.forEach((ad) => {
      const item = document.createElement("div");
      item.className = "retro-ad-item";

      const titleLink = document.createElement("a");
      titleLink.className = "retro-ad-title";
      titleLink.href = ad.targetUrl;
      titleLink.target = "_blank";
      titleLink.rel = "noopener noreferrer sponsored";
      titleLink.textContent = ad.title;
      item.appendChild(titleLink);

      if (layout.showDescription) {
        const desc = document.createElement("p");
        desc.className = "retro-ad-desc";
        desc.textContent = ad.description;
        item.appendChild(desc);
      }

      const urlLink = document.createElement("a");
      urlLink.className = "retro-ad-url";
      urlLink.href = ad.targetUrl;
      urlLink.target = "_blank";
      urlLink.rel = "noopener noreferrer sponsored";
      urlLink.textContent = ad.displayUrl;
      item.appendChild(urlLink);

      grid.appendChild(item);
    });

    const badge = document.createElement("span");
    badge.className = "retro-ad-badge";
    badge.textContent = CONFIG.adLabelText;

    slot.innerHTML = "";
    slot.appendChild(grid);
    slot.appendChild(badge);
  }

  // 9. Initialize Engine, Observers & 15-Second Rotation
  function startAdEngine() {
    injectStyles();
    observeThemeChanges();

    const slots = injectArticleContainers();
    slots.forEach((slot) => renderSlot(slot));

    if ("ResizeObserver" in window) {
      let resizeTimer;
      const resizeObserver = new ResizeObserver((entries) => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          entries.forEach((entry) => renderSlot(entry.target));
        }, 150);
      });
      slots.forEach((slot) => resizeObserver.observe(slot));
    }

    setInterval(() => {
      slots.forEach((slot) => {
        slot.style.opacity = "0.2";
        setTimeout(() => {
          renderSlot(slot);
          slot.style.opacity = "1";
        }, 200);
      });
    }, CONFIG.rotationIntervalMs);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startAdEngine);
  } else {
    startAdEngine();
  }
})({
  // Customize placement settings when invoking the function
  placements: {
    aboveMain: { enabled: true, mainSelector: "main" },
    inArticle: {
      enabled: true,
      startAfterParagraph: 2,
      paragraphInterval: 4,
      maxUnits: 3,
    },
    belowMain: { enabled: true, mainSelector: "main", minTotalParagraphs: 3 },
    sidebar: {
      enabled: true,
      topUnit: true,
      stickyBottomUnit: true,
    },
  },
});

    document.body.addEventListener("dragstart", (e) => { e.preventDefault(); });
    document.body.addEventListener("drop", (e) => { e.preventDefault(); });

    // Profile Loader for Article Pages
    const profileContainer = document.getElementById("profile-sidebar");
    if (profileContainer) {
        const PROFILE_BASE_URL = "https://salivity.github.io/profile";
        fetch(`${PROFILE_BASE_URL}/profile.json`)
            .then(res => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then(data => {
                let linkGroups = [];

                // Support new multiple link groups format
                if (data.link_groups && Array.isArray(data.link_groups)) {
                    linkGroups = data.link_groups;
                } else if (data.linkGroups && Array.isArray(data.linkGroups)) {
                    linkGroups = data.linkGroups;
                } else if (data.links && Array.isArray(data.links)) {
                    // Fallback backward-compatibility for single links array
                    linkGroups = [{
                        title: data.links_title || data.linksTitle || "Links",
                        links: data.links
                    }];
                }

                const linksHtml = linkGroups.map(group => {
                    if (!group.links || !Array.isArray(group.links) || group.links.length === 0) return "";
                    const groupTitle = group.title || "Links";
                    return `
                        <div class="profile-links-group">
                            <div class="profile-links-title">${groupTitle}</div>
                            <ul class="profile-links">
                                ${group.links.map(l => {
                                    const label = typeof l === "string" ? l : (l.label || l.url);
                                    const title = typeof l === "string" ? l : (l.title || l.label || l.url);
                                    const href = typeof l === "string" ? l : l.url;
                                    return `<li><a href="${href}" target="_blank" title="${title}">${label}</a></li>`;
                                }).join("")}
                            </ul>
                        </div>
                    `;
                }).join("");

                let detailsHtml = "";
                if (data.country) {
                    detailsHtml = `
                        <div class="profile-details">
                            <span class="profile-detail-label">Country:</span><span class="profile-detail-value" title="${data.country}">${data.country}</span>
                        </div>
                    `;
                }

                profileContainer.innerHTML = `
                    <img class="profile-avatar" src="${PROFILE_BASE_URL}/profile.webp" alt="${data.name || "Profile"} Avatar">
                    ${data.name ? `<div class="profile-name">${data.name}</div>` : ""}
                    ${data.biography ? `<div class="profile-bio">${data.biography}</div>` : ""}
                    ${detailsHtml}${linksHtml}
                `;
            })
            .catch(err => {
                console.error("Failed to load profile data:", err);
                profileContainer.style.display = "none";
            });
    }

    // default video poster for all videos
    const videos = document.querySelectorAll("video");
    videos.forEach(video => {
        video.setAttribute("poster", "/inkscape/images/video/poster/default.svg");
    });

    // audio waveforms
    const audioElements = document.querySelectorAll("audio");
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (audioElements.length > 0 && AudioContext) {
        let audioCtx = null;

        audioElements.forEach((audio) => {
            const container = document.createElement("div");
            container.style.cssText = "width: 100%; display: flex; flex-direction: column; margin: 20px 0;";

            const canvas = document.createElement("canvas");
            canvas.width = 1200; 
            canvas.height = 75;
            canvas.style.cssText = "width: 100%; height: 75px; background: #000; display: block; margin-top: 10px; margin-bottom: 10px; padding: 10px;";
            
            const ctx = canvas.getContext("2d");
            audio.style.width = "100%";

            audio.parentNode.insertBefore(container, audio);
            container.appendChild(canvas);
            container.appendChild(audio);

            let analyser = null;
            let dataArray = null;
            let animationId = null;
            const peaks = new Array(8).fill(0);
            const gravity = 1.2;

            function initAudio() {
                if (!audioCtx) {
                    audioCtx = new AudioContext();
                }
                if (!analyser) {
                    const source = audioCtx.createMediaElementSource(audio);
                    analyser = audioCtx.createAnalyser();
                    analyser.fftSize = 32; 
                    analyser.smoothingTimeConstant = 0.7;
                    
                    source.connect(analyser);
                    analyser.connect(audioCtx.destination);
                    dataArray = new Uint8Array(analyser.frequencyBinCount);
                }
            }

            function render() {
                analyser.getByteFrequencyData(dataArray);

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                const barCount = 8;
                const totalSpacingRatio = 0.25;
                const barWidth = (canvas.width / barCount) * (1 - totalSpacingRatio);
                const spacing = (canvas.width / barCount) * totalSpacingRatio;

                const segmentHeight = 4;
                const segmentGap = 2;
                let hasActivePeaks = false;

                for (let i = 0; i < barCount; i++) {
                    let intensity = dataArray[i];
                    let currentBarHeight = (intensity / 255) * canvas.height;

                    if (currentBarHeight > peaks[i]) {
                        peaks[i] = currentBarHeight;
                    } else {
                        peaks[i] = Math.max(0, peaks[i] - gravity);
                    }

                    if (peaks[i] > 0) hasActivePeaks = true;

                    const x = i * (barWidth + spacing) + (spacing / 2);

                    for (let y = canvas.height; y > (canvas.height - currentBarHeight); y -= (segmentHeight + segmentGap)) {
                        let color = "#00FF41";
                        if (y < canvas.height * 0.3) color = "#FF3131";
                        else if (y < canvas.height * 0.6) color = "#FFD700";

                        ctx.fillStyle = color;
                        ctx.fillRect(x, y - segmentHeight, barWidth, segmentHeight);
                    }

                    if (peaks[i] > 2) {
                        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                        const peakY = canvas.height - peaks[i];
                        ctx.fillRect(x, peakY - 2, barWidth, 2);
                    }
                }

                if (!audio.paused || hasActivePeaks) {
                    animationId = requestAnimationFrame(render);
                } else {
                    animationId = null;
                }
            }

            audio.addEventListener("play", () => {
                initAudio();
                if (audioCtx.state === "suspended") audioCtx.resume();
                if (!animationId) render();
            });
        });
    }

    // open images when clicked
    const images = document.querySelectorAll("article img");
    images.forEach(img => {
        img.addEventListener("click", () => {
            const imgSrc = img.getAttribute("src");
            window.open(imgSrc, "_blank");
        });
    });

    // update disqus theme
    function reloadDisqus() {
        if (typeof DISQUS !== "undefined") {
            DISQUS.reset({
                reload: true,
                config: function () {
                    //this.page.identifier = PAGE_IDENTIFIER;
                    this.page.url = window.location.href;         
                }
            });
        }
    }

    // Theme Toggle Logic
    const toggleBtn = document.getElementById("theme-toggle");
    const root = document.documentElement;
    
    const setTheme = (theme) => {
        root.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
        if (toggleBtn) {
            toggleBtn.innerHTML = theme === "dark" ? `<svg class="svg-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5M2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1m18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1M11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1m0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1M5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0z"></path></svg>` : `<svg class="svg-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1"></path></svg>`;
        }
    
       
    };

    const savedTheme = localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(savedTheme);

    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            const newTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
            setTheme(newTheme);
            reloadDisqus();
            document.activeElement.blur();
        });
    }

    // Footer Year
    const currentYearEl = document.getElementById("current-year");
    if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();

    // Pagination Constants
    const ITEMS_PER_PAGE = 10;

    const kebabCase = (str, { transliterate = false } = {}) => {
        if (!str) return "";
        let normalized = str.normalize("NFKC");
        if (transliterate) {
            normalized = normalized.normalize("NFD").replace(/\p{Diacritic}/gu, "");
        }
        return normalized
            .replace(/(\p{Ll}|\p{Lo})(\p{Lu})/gu, "$1-$2")
            .replace(/(\p{Lu}+)(\p{Lu}[\p{Ll}\p{Lo}])/gu, "$1-$2")
            .replace(/([\p{L}\p{Lo}])(\p{N})/gu, "$1-$2")
            .replace(/(\p{N})([\p{L}\p{Lo}])/gu, "$1-$2")
            .replace(/[^\p{L}\p{N}]+/gu, "-")
            .replace(/^-+|-+$/g, "")
            .toLowerCase();
    };

    const decodeEntities = (str) => {
        if (!str) return "";
        return str
            .replaceAll("&quot;", "\"")
            .replaceAll("&#39;", "\x27")
            .replaceAll("&lt;", "<")
            .replaceAll("&gt;", ">")
            .replaceAll("&amp;", "&");
    };

    const remapArticles = (data) => {
        return data.map((item) => {
            const title = decodeEntities(item[1]);
            const description = decodeEntities(item[2]);
            return { id: item[0], title, description, url: `/inkscape/article/${kebabCase(title)}`, open_graph: item[3] };
        });
    };

    // Browse Articles Logic
    const articlesContainer = document.getElementById("articles-container");
    if (articlesContainer) {
        fetch("/inkscape/js/articles.json").then(res => res.json()).then(data => {
            const remapped_data = remapArticles(data);

            const getBrowsePageFromUrl = () => {
                const params = new URLSearchParams(window.location.search);
                return Math.max(1, parseInt(params.get("page"), 10) || 1);
            };

            const navigateBrowsePage = (targetPage, replace = false) => {
                const url = new URL(window.location);
                if (targetPage > 1) {
                    url.searchParams.set("page", targetPage);
                } else {
                    url.searchParams.delete("page");
                }
                if (replace) {
                    window.history.replaceState({ page: targetPage }, "", url);
                } else {
                    window.history.pushState({ page: targetPage }, "", url);
                }
                renderList(remapped_data, articlesContainer, "articles-pagination", targetPage, false, (p) => navigateBrowsePage(p, false));
            };

            const initialPage = getBrowsePageFromUrl();
            renderList(remapped_data, articlesContainer, "articles-pagination", initialPage, false, (p) => navigateBrowsePage(p, false));

            window.addEventListener("popstate", () => {
                const page = getBrowsePageFromUrl();
                renderList(remapped_data, articlesContainer, "articles-pagination", page, false, (p) => navigateBrowsePage(p, false));
            });
        });
    }

    // Search Logic
    const searchInput = document.getElementById("search-input");
    const searchResultsContainer = document.getElementById("search-results");
    if (searchInput && searchResultsContainer) {
        fetch("/inkscape/js/articles.json").then(res => res.json()).then(data => {
            const remapped_data = remapArticles(data);

            const fuse = new Fuse(remapped_data, {
                keys: ["title", "description"],
                useExtendedSearch: true,
                threshold: 0.15,
                ignoreLocation: true
            });

            const updateSearchUrl = (query, page, replace = false) => {
                const url = new URL(window.location);
                if (query) {
                    url.searchParams.set("query", query);
                } else {
                    url.searchParams.delete("query");
                }

                if (page > 1) {
                    url.searchParams.set("page", page);
                } else {
                    url.searchParams.delete("page");
                }

                if (replace) {
                    window.history.replaceState({ query, page }, "", url);
                } else {
                    window.history.pushState({ query, page }, "", url);
                }
            };

            const executeSearch = (query, page, shouldUpdateUrl = false, replaceUrl = false) => {
                if (shouldUpdateUrl) {
                    updateSearchUrl(query, page, replaceUrl);
                }

                if (!query) {
                    renderList([], searchResultsContainer, "search-pagination", 1, true, (nextPage) => {
                        executeSearch(query, nextPage, true, false);
                    });
                    return;
                }

                const results = fuse.search(query).map(result => result.item);
                renderList(results, searchResultsContainer, "search-pagination", page, true, (nextPage) => {
                    executeSearch(query, nextPage, true, false);
                });
            };

            const urlParams = new URLSearchParams(window.location.search);
            const initialQuery = urlParams.get("query") || "";
            const initialPage = Math.max(1, parseInt(urlParams.get("page"), 10) || 1);

            if (initialQuery) {
                searchInput.value = initialQuery;
            }
            executeSearch(initialQuery, initialPage, false, false);

            searchInput.addEventListener("input", (e) => {
                const newQuery = e.target.value.trim();
                executeSearch(newQuery, 1, true, true);
            });

            window.addEventListener("popstate", () => {
                const currentParams = new URLSearchParams(window.location.search);
                const currentQuery = currentParams.get("query") || "";
                const currentPage = Math.max(1, parseInt(currentParams.get("page"), 10) || 1);
                searchInput.value = currentQuery;
                executeSearch(currentQuery, currentPage, false, false);
            });
        });
    }

    function renderList(items, container, paginatorId, page, isSearch, onPageChange) {
        container.innerHTML = "";
        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
        
        if (page > totalPages) page = totalPages;
        if (page < 1) page = 1;

        if (totalItems === 0) {
            container.innerHTML = `<p>${isSearch ? "No results found." : "No articles available."}</p>`;
            const paginator = document.getElementById(paginatorId);
            if (paginator) paginator.innerHTML = "";
            return;
        }

        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
        const pageItems = items.slice(startIndex, endIndex);

        const ul = document.createElement("ul");
        ul.className = "item-list";
        ul.setAttribute("aria-label", "List of Results");

        pageItems.forEach(item => {
            const li = document.createElement("li");
            const itemContainer = document.createElement("div");
            itemContainer.style.display = "flex";

            const itemTextual = document.createElement("div");
            itemTextual.style.flex = 1;

            const itemHeader = document.createElement("h2");
            const itemTitle = document.createElement("a");
            itemTitle.setAttribute("href", item.url);
            itemTitle.innerText = item.title;

            itemHeader.appendChild(itemTitle);
            itemTextual.appendChild(itemHeader);

            const itemDescription = document.createElement("p");
            itemDescription.innerText = item.description;
            itemTextual.appendChild(itemDescription);

            itemContainer.appendChild(itemTextual);

            if (item.open_graph === true) {
                const imageTop = document.createElement("div");
                imageTop.style.backgroundImage = `url(/inkscape/images/open-graph/article/${item.id}.webp)`;
                imageTop.classList.add("item-image-side");
                imageTop.setAttribute("role", "img");
                imageTop.setAttribute("aria-label", "Article Cover Image");
                itemContainer.prepend(imageTop);

                const imageBottom = new Image();
                imageBottom.src = `/inkscape/images/open-graph/article/${item.id}.webp`;
                imageBottom.classList.add("item-image-bottom");
                imageBottom.setAttribute("alt", "Article Cover Image");
                itemContainer.append(imageBottom);
            }

            li.appendChild(itemContainer);
            ul.appendChild(li);
        });
        container.appendChild(ul);

        const paginator = document.getElementById(paginatorId);
        if (!paginator) return;

        paginator.innerHTML = `
            <div aria-label="Page Range of Total Results">Showing ${startIndex + 1}-${endIndex} of ${totalItems}</div>
            <div aria-label="Pagination">
                <button id="${paginatorId}-first-page" ${page === 1 ? "disabled" : ""} title="First Page" aria-label="Go To First Page in Results" aria-disabled="${page === 1 ? "true" : "false"}"><svg class="svg-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M18.41 16.59 13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z"></path></svg></button>
                <button id="${paginatorId}-prev" ${page === 1 ? "disabled" : ""} title="Previous Page" aria-label="Go To Previous Page in Results" aria-disabled="${page === 1 ? "true" : "false"}"><svg class="svg-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg></button>
                <span aria-label="Current Page and Total Pages">Page ${page} of ${totalPages}</span>
                <button id="${paginatorId}-next" ${page === totalPages ? "disabled" : ""} title="Next Page" aria-label="Go To Next Page in Results" aria-disabled="${page === totalPages ? "true" : "false"}"><svg class="svg-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg></button>
                <button id="${paginatorId}-last-page" ${page === totalPages ? "disabled" : ""} title="Last Page" aria-label="Go To Last Page in Results" aria-disabled="${page === totalPages ? "true" : "false"}"><svg class="svg-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M5.59 7.41 10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z"></path></svg></button>
            </div>
        `;

        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant",
        });

        const prevBtn = document.getElementById(`${paginatorId}-prev`);
        const nextBtn = document.getElementById(`${paginatorId}-next`);
        const firstBtn = document.getElementById(`${paginatorId}-first-page`);
        const lastBtn = document.getElementById(`${paginatorId}-last-page`);

        const changePage = (newPage) => {
            if (onPageChange) {
                onPageChange(newPage);
            } else {
                renderList(items, container, paginatorId, newPage, isSearch, onPageChange);
            }
        };

        if (prevBtn) prevBtn.onclick = () => changePage(page - 1);
        if (nextBtn) nextBtn.onclick = () => changePage(page + 1);
        if (firstBtn) firstBtn.onclick = () => changePage(1);
        if (lastBtn) lastBtn.onclick = () => changePage(totalPages);
    }
});
