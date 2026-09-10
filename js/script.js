
document.addEventListener("DOMContentLoaded", () => {

    /**
     * stop all drag and drop operations
     */
    document.body.addEventListener("ondragstart", () => {return false;})
    document.body.addEventListener("ondrop", () => {return false;})

    // default video poster for all videos
    const videos = document.querySelectorAll("video");

    videos.forEach(video => {
        video.setAttribute("poster", "/inkscape/images/video/poster/default.svg")
    });

    // audio waveforms
    const audioElements = document.querySelectorAll("audio");
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();

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

        const source = audioCtx.createMediaElementSource(audio);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 32; 
        analyser.smoothingTimeConstant = 0.7;
        
        source.connect(analyser);
        analyser.connect(audioCtx.destination);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const peaks = new Array(8).fill(0);
        const gravity = 1.2;

        function render() {
            requestAnimationFrame(render);
            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barCount = 8;
            const totalSpacingRatio = 0.25;
            const barWidth = (canvas.width / barCount) * (1 - totalSpacingRatio);
            const spacing = (canvas.width / barCount) * totalSpacingRatio;

            const segmentHeight = 4;
            const segmentGap = 2;

            for (let i = 0; i < barCount; i++) {
                let intensity = dataArray[i];
                let currentBarHeight = (intensity / 255) * canvas.height;

                if (currentBarHeight > peaks[i]) {
                    peaks[i] = currentBarHeight;
                } else {
                    peaks[i] -= gravity;
                }

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
        }

        audio.addEventListener("play", () => {
            if (audioCtx.state === "suspended") audioCtx.resume();
            render();
        }, { once: true });
    });

    // open images when clicked
    const images = document.querySelectorAll("article img");
    images.forEach(img => {
        img.addEventListener("click", () => {
            const imgSrc = img.getAttribute("src");
            window.open(imgSrc, "_blank");
        });
    });

    // Theme Toggle Logic
    const toggleBtn = document.getElementById("theme-toggle");
    const root = document.documentElement;
    
    const setTheme = (theme) => {
        root.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
        if (toggleBtn) {
            toggleBtn.innerHTML = theme === "dark" ? `<svg class="svg-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5M2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1m18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1M11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1m0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1M5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0z"></path></svg>` : `<svg class="svg-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1"></path></svg>`;
        }
    
        const utterancesIframe = document.querySelector(`.utterances-frame`);
        if (utterancesIframe) {
            const message = {
                type: `set-theme`,
                theme: theme === `light` ? `github-light` : `github-dark`
            };
            utterancesIframe.contentWindow.postMessage(message, `https://utteranc.es`); 
        }
    };

    const savedTheme = localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(savedTheme);

    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            const newTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
            setTheme(newTheme);
            document.activeElement.blur();
        });
    }

    // Footer Year
    const currentYearEl = document.getElementById("current-year");
    if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();

    // Pagination Constants
    const ITEMS_PER_PAGE = 10;

    /**
     * kebabCase helper
     */
    const kebabCase = (value) => {
        return value.toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    };

    /**
     * remapArticles helper
     */
    const remapArticles = (data) => {
        return data.map((item) => {
            return { id: item[0], title: item[1], description: item[2], url: `/inkscape/article/${kebabCase(item[1])}`, open_graph: item[3] };
        });
    };

    // Browse Articles Logic with URL Query Parameter ("page")
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

    // Search Logic with URL Query Parameters ("query" and "page")
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

            // Read initial parameters from URL
            const urlParams = new URLSearchParams(window.location.search);
            const initialQuery = urlParams.get("query") || "";
            const initialPage = Math.max(1, parseInt(urlParams.get("page"), 10) || 1);

            if (initialQuery) {
                searchInput.value = initialQuery;
            }
            executeSearch(initialQuery, initialPage, false, false);

            // Typing a new query resets back to page 1
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

    // Generic Render Function for Paginated Lists
    function renderList(items, container, paginatorId, page, isSearch, onPageChange) {
        container.innerHTML = "";
        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
        
        // Clamp current page within allowable range
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
        ul.setAttribute("label", "List of Results");

        pageItems.forEach(item => {
            const li = document.createElement("li");
            const itemContainer = document.createElement("div");
            itemContainer.style.display = "flex";

            const itemTextual = document.createElement("div");
            itemTextual.style.flex = 1;

            const itemHeader = document.createElement("h2");
            itemHeader.innerHTML = `<a href="${item.url}">${item.title}</a>`;
            itemTextual.appendChild(itemHeader);

            const itemDescription = document.createElement("p");
            itemDescription.innerText = item.description;
            itemTextual.appendChild(itemDescription);

            itemContainer.appendChild(itemTextual);

            if (item.open_graph === true) {
                const imageTop = document.createElement("div");
                imageTop.style.backgroundImage = `url(/inkscape/images/open-graph/article/${item.id}.webp)`;
                imageTop.classList.add("item-image-side");
                imageTop.setAttribute("alt", "Article Cover Image");
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

        // Render Pagination UI
        const paginator = document.getElementById(paginatorId);
        if (!paginator) return;

        paginator.innerHTML = `
            <div aria-label="Page Range of Total Results">Showing ${startIndex + 1}-${endIndex} of ${totalItems}</div>
            <div aria-label="Pagination">
                <button id="${paginatorId}-first-page" ${page === 1 ? "disabled" : ""} title="First Page" aria-label="Go To First Page in Results" aria-role="button" aria-disabled="${page === 1 ? "true" : "false"}"><svg class="svg-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M18.41 16.59 13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z"></path></svg></button>
                <button id="${paginatorId}-prev" ${page === 1 ? "disabled" : ""} title="Previous Page" aria-label="Go To Previous Page in Results" aria-role="button" aria-disabled="${page === 1 ? "true" : "false"}"><svg class="svg-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg></button>
                <span aria-label="Current Page and Total Pages">Page ${page} of ${totalPages}</span>
                <button id="${paginatorId}-next" ${page === totalPages ? "disabled" : ""} title="Next Page" aria-label="Go To Next Page in Results" aria-role="button" aria-disabled="${page === totalPages ? "true" : "false"}"><svg class="svg-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg></button>
                <button id="${paginatorId}-last-page" ${page === totalPages ? "disabled" : ""} title="Last Page" aria-label="Go To Last Page in Results" aria-role="button" aria-disabled="${page === totalPages ? "true" : "false"}"><svg class="svg-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M5.59 7.41 10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z"></path></svg></button>
            </div>
        `;

        // scroll back to top of the page after pagination
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

