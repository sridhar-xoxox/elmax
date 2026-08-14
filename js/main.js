/**
 * ELMAX ELECTRICALS - Core Interactive Engine
 * Dynamic features: Scroll Reveal, Glassmorphism Sticky Header, 
 * Unified Lightbox Engine, Projects Search & Filtering, 
 * Stat Counter Animations, and Back-to-Top Progress Indicator.
 */

document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initScrollReveal();
    initLightbox();
    initProjectsFilter();
    initStatCounters();
    initHeroEffects();
});

/* ==========================================
   1. STICKY HEADER & MOBILE NAVIGATION
   ========================================== */
function initHeader() {
    const header = document.querySelector('header');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');

    // Add scroll progress indicator on header
    if (header && !header.querySelector('.header-scroll-progress')) {
        const progressLine = document.createElement('div');
        progressLine.className = 'header-scroll-progress';
        header.appendChild(progressLine);
    }
    const progressBar = header?.querySelector('.header-scroll-progress');

    // Sticky shrink & progress update on scroll
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        if (scrollTop > 30) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }

        if (progressBar) {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            progressBar.style.width = `${Math.min(scrollPercent, 100)}%`;
        }
    }, { passive: true });

    // Mobile Menu Toggle
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navMenu.classList.toggle('open');
            mobileMenuBtn.classList.toggle('active', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('open') && !header.contains(e.target)) {
                navMenu.classList.remove('open');
                mobileMenuBtn.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('open')) {
                navMenu.classList.remove('open');
                mobileMenuBtn.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

/* ==========================================
   2. SCROLL REVEAL ANIMATIONS (IntersectionObserver)
   ========================================== */
function initScrollReveal() {
    const revealTargets = document.querySelectorAll(
        '[data-reveal], .hero-content, .section-title, .gallery-item, .client-logo-box, .value-card, .screenshot-card, .projects-section-block, .office-info, .mission-box, .stat-card'
    );

    if (!('IntersectionObserver' in window)) {
        revealTargets.forEach(el => el.classList.add('revealed'));
        return;
    }

    const isMobile = window.innerWidth <= 768;
    const observerOptions = {
        threshold: isMobile ? 0.05 : 0.12,
        rootMargin: isMobile ? '0px 0px -20px 0px' : '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealTargets.forEach((el, index) => {
        if (!el.dataset.reveal) {
            el.dataset.reveal = 'fade-up';
        }
        // Stagger animation for grid items
        const parentGrid = el.closest('.gallery-grid, .clients-grid, .values-grid, .screenshot-grid');
        if (parentGrid) {
            const siblings = Array.from(parentGrid.children);
            const childIndex = siblings.indexOf(el);
            el.style.transitionDelay = `${(childIndex % 6) * 0.06}s`;
        }
        observer.observe(el);
    });
}

/* ==========================================
   3. UNIFIED LIGHTBOX MODAL ENGINE
   ========================================== */
let lightboxItems = [];
let currentLightboxIndex = 0;

function initLightbox() {
    // Create Lightbox DOM if not present
    let lightbox = document.getElementById('lightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.className = 'lightbox-modal';
        lightbox.setAttribute('aria-hidden', 'true');
        lightbox.setAttribute('role', 'dialog');
        lightbox.innerHTML = `
            <div class="lightbox-content-wrapper">
                <button class="lightbox-close" id="lightbox-close-btn" aria-label="Close lightbox">&times;</button>
                <button class="lightbox-btn lightbox-prev" id="lightbox-prev-btn" aria-label="Previous image">&#10094;</button>
                <button class="lightbox-btn lightbox-next" id="lightbox-next-btn" aria-label="Next image">&#10095;</button>
                <div class="lightbox-img-container">
                    <img id="lightbox-img" class="lightbox-content" src="" alt="Enlarged view">
                    <div class="lightbox-counter" id="lightbox-counter"></div>
                </div>
                <div id="lightbox-caption" class="lightbox-caption"></div>
            </div>
        `;
        document.body.appendChild(lightbox);
    }

    const imgElement = document.getElementById('lightbox-img');
    const captionElement = document.getElementById('lightbox-caption');
    const counterElement = document.getElementById('lightbox-counter');
    const closeBtn = document.getElementById('lightbox-close-btn');
    const prevBtn = document.getElementById('lightbox-prev-btn');
    const nextBtn = document.getElementById('lightbox-next-btn');

    // Collect gallery items from gallery.html and testimonals.html
    const targetSelector = '.gallery-grid .gallery-item, .screenshot-grid .screenshot-card';
    const elements = document.querySelectorAll(targetSelector);

    if (elements.length === 0) return;

    lightboxItems = Array.from(elements).map(el => {
        const img = el.querySelector('img');
        const captionText = el.querySelector('.screenshot-caption')?.textContent || 
                            img?.getAttribute('alt') || '';
        return {
            src: img ? img.src : '',
            caption: captionText
        };
    });

    elements.forEach((el, index) => {
        el.style.cursor = 'pointer';
        el.addEventListener('click', () => {
            openLightbox(index);
        });
    });

    function openLightbox(index) {
        currentLightboxIndex = index;
        updateLightboxContent();
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function updateLightboxContent() {
        const item = lightboxItems[currentLightboxIndex];
        if (!item) return;

        imgElement.style.opacity = '0.4';
        imgElement.style.transform = 'scale(0.96)';

        setTimeout(() => {
            imgElement.src = item.src;
            imgElement.alt = item.caption;
            captionElement.textContent = item.caption;
            if (counterElement) {
                counterElement.textContent = `${currentLightboxIndex + 1} / ${lightboxItems.length}`;
            }
            imgElement.style.opacity = '1';
            imgElement.style.transform = 'scale(1)';
        }, 120);
    }

    function showPrev() {
        currentLightboxIndex = (currentLightboxIndex - 1 + lightboxItems.length) % lightboxItems.length;
        updateLightboxContent();
    }

    function showNext() {
        currentLightboxIndex = (currentLightboxIndex + 1) % lightboxItems.length;
        updateLightboxContent();
    }

    closeBtn?.addEventListener('click', closeLightbox);
    prevBtn?.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
    nextBtn?.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-content-wrapper')) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showPrev();
        if (e.key === 'ArrowRight') showNext();
    });

    // Touch Swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchEndX < touchStartX - 40) showNext();
        if (touchEndX > touchStartX + 40) showPrev();
    }, { passive: true });
}

/* ==========================================
   4. INSTANT PROJECTS SEARCH & CATEGORY FILTER
   ========================================== */
function initProjectsFilter() {
    const projectBlocks = document.querySelectorAll('.projects-section-block');
    if (projectBlocks.length === 0) return;

    const mainContainer = document.querySelector('.projects-container') || projectBlocks[0].parentElement;

    // Build Search & Filter Control Panel
    const controlPanel = document.createElement('div');
    controlPanel.className = 'projects-filter-panel';
    controlPanel.innerHTML = `
        <div class="filter-search-wrapper">
            <input type="text" id="project-search-input" placeholder="Search by Project, Area, or Industry type..." aria-label="Search projects">
            <button id="search-clear-btn" class="search-clear-btn" aria-label="Clear search" style="display: none;">&times;</button>
        </div>
        <div class="filter-badges" id="filter-badges">
            <button class="filter-badge active" data-category="all">All Industries</button>
        </div>
    `;

    mainContainer.insertBefore(controlPanel, mainContainer.firstChild);

    const searchInput = document.getElementById('project-search-input');
    const clearBtn = document.getElementById('search-clear-btn');
    const filterBadgesContainer = document.getElementById('filter-badges');

    // Dynamically discover all Industry Categories from project blocks
    const categoriesSet = new Set();
    projectBlocks.forEach(block => {
        const titleEl = block.querySelector('h2');
        if (titleEl) {
            categoriesSet.add(titleEl.textContent.trim());
        }
    });

    categoriesSet.forEach(cat => {
        const badge = document.createElement('button');
        badge.className = 'filter-badge';
        badge.dataset.category = cat;
        badge.textContent = cat;
        filterBadgesContainer.appendChild(badge);
    });

    let activeCategory = 'all';

    function filterProjects() {
        const query = searchInput.value.toLowerCase().trim();
        clearBtn.style.display = query.length > 0 ? 'block' : 'none';

        let totalVisibleRows = 0;

        projectBlocks.forEach(block => {
            const blockTitle = block.querySelector('h2')?.textContent.trim() || '';
            const rows = block.querySelectorAll('tbody tr');
            let blockHasVisibleRow = false;

            const categoryMatch = (activeCategory === 'all' || blockTitle === activeCategory);

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                const searchMatch = !query || text.includes(query);

                if (categoryMatch && searchMatch) {
                    row.style.display = '';
                    blockHasVisibleRow = true;
                    totalVisibleRows++;
                } else {
                    row.style.display = 'none';
                }
            });

            block.style.display = blockHasVisibleRow ? '' : 'none';
        });

        // Show empty message if nothing found
        let noResultsMsg = document.getElementById('no-projects-found');
        if (totalVisibleRows === 0) {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('div');
                noResultsMsg.id = 'no-projects-found';
                noResultsMsg.className = 'no-results-box';
                noResultsMsg.innerHTML = `
                    <div class="no-results-content">
                        <svg viewBox="0 0 24 24" width="48" height="48" stroke="var(--primary-color)" stroke-width="1.5" fill="none">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <h3>No projects found</h3>
                        <p>Try searching for a different keyword or select another industry category.</p>
                    </div>
                `;
                mainContainer.appendChild(noResultsMsg);
            }
            noResultsMsg.style.display = 'block';
        } else if (noResultsMsg) {
            noResultsMsg.style.display = 'none';
        }
    }

    searchInput.addEventListener('input', filterProjects);
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        filterProjects();
        searchInput.focus();
    });

    filterBadgesContainer.addEventListener('click', (e) => {
        const badge = e.target.closest('.filter-badge');
        if (!badge) return;

        filterBadgesContainer.querySelectorAll('.filter-badge').forEach(b => b.classList.remove('active'));
        badge.classList.add('active');
        activeCategory = badge.dataset.category;
        filterProjects();
    });

    // Style table cells with badges automatically & insert mobile swipe hints
    document.querySelectorAll('.project-table tbody tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 5) {
            const industryCell = cells[4];
            const text = industryCell.textContent.trim();
            industryCell.innerHTML = `<span class="industry-chip">${text}</span>`;
        }
    });

    document.querySelectorAll('.table-responsive').forEach(wrapper => {
        if (!wrapper.previousElementSibling?.classList.contains('mobile-swipe-hint')) {
            const hint = document.createElement('div');
            hint.className = 'mobile-swipe-hint';
            hint.innerHTML = `<span class="swipe-hand">&larr;</span> Swipe table to explore full details <span class="swipe-hand">&rarr;</span>`;
            wrapper.parentElement.insertBefore(hint, wrapper);
        }
    });
}

/* ==========================================
   5. STAT COUNTER ANIMATIONS
   ========================================== */
function initStatCounters() {
    const statsElements = document.querySelectorAll('.stat-number');
    if (statsElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCount(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statsElements.forEach(el => observer.observe(el));

    function animateCount(el) {
        const target = parseInt(el.dataset.count || el.textContent, 10);
        if (isNaN(target)) return;
        const duration = 1800; // ms
        const start = 0;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // EaseOutExpo curve
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const current = Math.floor(start + (target - start) * easeProgress);

            el.textContent = current + (el.dataset.suffix || '');
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = target + (el.dataset.suffix || '');
            }
        }
        requestAnimationFrame(update);
    }
}



/* ==========================================
   7. HERO & AMBIENT VISUAL EFFECTS
   ========================================== */
function initHeroEffects() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    // Mouse movement subtle tilt / light effect on hero
    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        hero.style.setProperty('--mouse-x', `${x}px`);
        hero.style.setProperty('--mouse-y', `${y}px`);
    });
}
