/*!
 * ========================================================================
 * BOOTWIND ELITE SDK CORE v2.5.0 (Zero-Defect Masterpiece Edition)
 * ------------------------------------------------------------------------
 * (c) 2026 National Security Engineering
 * Architecture: Event Delegation, GPU-Accelerated UI, Anti-Tamper API.
 * Features:     Modal, Dropdown, Tab, Accordion, Offcanvas, Popover,
 * Scrollspy (Performance Optimized), Toast Queueing, Security.
 * ========================================================================
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.BootWind = factory();
    }
}(typeof window !== 'undefined' ? window : this, function () {
    'use strict';

    if (window.BootWind && window.BootWind.version === '2.5.0-Elite') return window.BootWind;

    let _isInitialized = false;
    let _config = {
        appId: 'NATIONAL-CORE',
        strictMode: false,
        theme: 'dark'
    };

    /* ====================================================================
     * UTILITIES & DOM HELPERS
     * ==================================================================== */
    const _DOM = {
        getClosest: (elem, selector) => {
            for (; elem && elem !== document; elem = elem.parentNode) {
                if (elem.matches(selector)) return elem;
            }
            return null;
        },
        getTarget: (elem) => {
            const selector = elem.getAttribute('data-bw-target') || elem.getAttribute('href');
            if (!selector || selector === '#') return null;
            try { return document.querySelector(selector); } catch (e) { return null; }
        },
        getOverlay: () => {
            let overlay = document.querySelector('.bw-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'bw-overlay bw-gpu';
                document.body.appendChild(overlay);
            }
            return overlay;
        }
    };

    /* ====================================================================
     * UI CONTROLLERS
     * ==================================================================== */
    const _UI = {
        Modal: {
            open(target) {
                if (!target) return;
                const overlay = _DOM.getOverlay();
                document.body.style.overflow = 'hidden';
                requestAnimationFrame(() => {
                    overlay.classList.add('active');
                    target.classList.add('active');
                    target.setAttribute('aria-modal', 'true');
                });
            },
            close(target) {
                if (!target) return;
                target.classList.remove('active');
                target.removeAttribute('aria-modal');
                const overlay = document.querySelector('.bw-overlay');
                if (overlay && !document.querySelector('.bw-modal.active') && !document.querySelector('.bw-offcanvas.show')) {
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            },
            closeAll() {
                document.querySelectorAll('.bw-modal.active').forEach(m => this.close(m));
            }
        },

        Offcanvas: {
            open(target) {
                if (!target) return;
                const overlay = _DOM.getOverlay();
                document.body.style.overflow = 'hidden';
                requestAnimationFrame(() => {
                    overlay.classList.add('active');
                    target.classList.add('show');
                    target.setAttribute('aria-modal', 'true');
                });
            },
            close(target) {
                if (!target) return;
                target.classList.remove('show');
                target.removeAttribute('aria-modal');
                const overlay = document.querySelector('.bw-overlay');
                if (overlay && !document.querySelector('.bw-modal.active') && !document.querySelector('.bw-offcanvas.show')) {
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            },
            closeAll() {
                document.querySelectorAll('.bw-offcanvas.show').forEach(o => this.close(o));
            }
        },

        Dropdown: {
            toggle(trigger) {
                const dropdown = trigger.closest('.bw-dropdown');
                if (!dropdown) return;
                const isActive = dropdown.classList.contains('active');
                this.closeAll();
                if (!isActive) {
                    dropdown.classList.add('active');
                    trigger.setAttribute('aria-expanded', 'true');
                }
            },
            closeAll() {
                document.querySelectorAll('.bw-dropdown.active').forEach(d => {
                    d.classList.remove('active');
                    const t = d.querySelector('[data-bw-toggle="dropdown"]');
                    if (t) t.setAttribute('aria-expanded', 'false');
                });
            }
        },

        Popover: {
            toggle(trigger) {
                const wrapper = trigger.closest('.bw-popover-wrapper');
                if (!wrapper) return;
                const popover = wrapper.querySelector('.bw-popover');
                if (!popover) return;
                const isActive = popover.classList.contains('active');
                this.closeAll();
                if (!isActive) popover.classList.add('active');
            },
            closeAll() {
                document.querySelectorAll('.bw-popover.active').forEach(p => p.classList.remove('active'));
            }
        },

        Tab: {
            show(trigger) {
                const target = _DOM.getTarget(trigger);
                const tabGroup = trigger.closest('.bw-tabs');
                if (!target || !tabGroup) return;
                
                tabGroup.querySelectorAll('.bw-tab.active').forEach(t => t.classList.remove('active'));
                trigger.classList.add('active');
                
                const contentGroup = target.parentElement;
                contentGroup.querySelectorAll('.bw-tab-pane').forEach(c => c.classList.add('bw-hidden'));
                target.classList.remove('bw-hidden');
            }
        },

        Accordion: {
            toggle(trigger) {
                const item = trigger.closest('.bw-accordion-item') || trigger.closest('.bw-collapse-wrap');
                if (!item) return;
                const isAccordion = item.classList.contains('bw-accordion-item');
                
                if (isAccordion) {
                    const group = item.closest('.bw-accordion');
                    const isActive = item.classList.contains('active');
                    group.querySelectorAll('.bw-accordion-item.active').forEach(i => i.classList.remove('active'));
                    if (!isActive) item.classList.add('active');
                } else {
                    item.classList.toggle('active');
                }
            }
        },

        Carousel: {
            _tm: new WeakMap(),
            _ops: new WeakMap(),
            _obs: new WeakMap(),
            _parse(el) {
                const interval = parseInt(el.getAttribute('data-bw-interval') || '0', 10) || 0;
                const pauseHover = (el.getAttribute('data-bw-pause') || '').toLowerCase() === 'hover';
                const wrap = (el.getAttribute('data-bw-wrap') || 'true') !== 'false';
                const touch = (el.getAttribute('data-bw-touch') || 'true') !== 'false';
                const keyboard = (el.getAttribute('data-bw-keyboard') || 'true') !== 'false';
                const effect = (el.getAttribute('data-bw-effect') || 'slide').toLowerCase(); // 'slide' | 'fade'
                const cfg = { interval, pauseHover, wrap, touch, keyboard, effect };
                this._ops.set(el, cfg);
                return cfg;
            },
            _clear(el) {
                const id = this._tm.get(el);
                if (id) {
                    clearInterval(id);
                    this._tm.delete(el);
                }
            },
            _currentDelay(el) {
                const ops = this._ops.get(el) || this._parse(el);
                const idx = parseInt(el.getAttribute('data-index') || '0', 10) || 0;
                const items = el.querySelectorAll('.bw-carousel-item');
                const slide = items[idx];
                const per = slide ? parseInt(slide.getAttribute('data-bw-interval') || '0', 10) || 0 : 0;
                return per > 0 ? per : ops.interval;
            },
            _start(el) {
                const ops = this._ops.get(el) || this._parse(el);
                this._clear(el);
                const delay = this._currentDelay(el);
                if (delay > 0) {
                    const id = setInterval(() => this.next(el), delay);
                    this._tm.set(el, id);
                }
            },
            _bind(el) {
                const ops = this._ops.get(el) || this._parse(el);
                if (ops.pauseHover) {
                    el.addEventListener('mouseenter', () => this._clear(el));
                    el.addEventListener('mouseleave', () => this._start(el));
                }
                if (ops.touch) {
                    let sx = 0, dx = 0, tracking = false;
                    const down = (ev) => {
                        tracking = true;
                        sx = (ev.touches ? ev.touches[0].clientX : ev.clientX) || 0;
                        dx = 0;
                        this._clear(el);
                    };
                    const move = (ev) => {
                        if (!tracking) return;
                        const x = (ev.touches ? ev.touches[0].clientX : ev.clientX) || 0;
                        dx = x - sx;
                    };
                    const up = () => {
                        if (!tracking) return;
                        tracking = false;
                        if (Math.abs(dx) > 40) {
                            if (dx < 0) this.next(el);
                            else this.prev(el);
                        }
                        dx = 0;
                        this._start(el);
                    };
                    el.addEventListener('touchstart', down, { passive: true });
                    el.addEventListener('touchmove', move, { passive: true });
                    el.addEventListener('touchend', up, { passive: true });
                    el.addEventListener('pointerdown', down);
                    el.addEventListener('pointermove', move);
                    el.addEventListener('pointerup', up);
                }
                if (ops.keyboard) {
                    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
                    el.addEventListener('keydown', (e) => {
                        if (e.key === 'ArrowRight') { e.preventDefault(); this.next(el); }
                        else if (e.key === 'ArrowLeft') { e.preventDefault(); this.prev(el); }
                    });
                }
                if ('IntersectionObserver' in window) {
                    const existing = this._obs.get(el);
                    if (existing) existing.disconnect();
                    const io = new IntersectionObserver((entries) => {
                        const visible = entries.some(en => en.isIntersecting);
                        if (visible) this._start(el);
                        else this._clear(el);
                    }, { threshold: 0.1 });
                    io.observe(el);
                    this._obs.set(el, io);
                }
                document.addEventListener('visibilitychange', () => {
                    if (document.hidden) this._clear(el);
                    else this._start(el);
                });
            },
            _count(el) {
                const items = el.querySelectorAll('.bw-carousel-item');
                return items.length || 0;
            },
            _set(el, idx) {
                const ops = this._ops.get(el) || this._parse(el);
                const total = this._count(el);
                if (!total) return;
                const m = ((idx % total) + total) % total;
                el.setAttribute('data-index', String(m));
                const track = el.querySelector('.bw-carousel-track');
                if (ops.effect === 'fade') {
                    el.style.position = 'relative';
                    const items = el.querySelectorAll('.bw-carousel-item');
                    items.forEach((it, i) => {
                        it.style.position = 'absolute';
                        it.style.inset = '0';
                        it.style.opacity = (i === m) ? '1' : '0';
                        it.style.transition = 'opacity .45s cubic-bezier(.2,.8,.2,1)';
                        it.style.pointerEvents = (i === m) ? 'auto' : 'none';
                    });
                } else {
                    if (track) track.style.transform = `translateX(${(-m * 100)}%)`;
                }
                const dots = el.querySelectorAll('[data-bw-carousel-indicator],[data-docs-carousel-indicator]');
                dots.forEach((d, i) => d.classList.toggle('active', i === m));
            },
            initAll() {
                document.querySelectorAll('.bw-carousel').forEach(el => {
                    const idx = parseInt(el.getAttribute('data-index') || '0', 10) || 0;
                    this._set(el, idx);
                    this._parse(el);
                    this._bind(el);
                    this._start(el);
                });
            },
            go(el, idx) {
                if (!el) return;
                this._set(el, idx);
                this._start(el);
            },
            next(el) {
                if (!el) return;
                const total = this._count(el);
                if (!total) return;
                const current = parseInt(el.getAttribute('data-index') || '0', 10) || 0;
                const ops = this._ops.get(el) || this._parse(el);
                let target = current + 1;
                if (target >= total) target = ops.wrap ? 0 : total - 1;
                this._set(el, target);
                this._start(el);
            },
            prev(el) {
                if (!el) return;
                const total = this._count(el);
                if (!total) return;
                const current = parseInt(el.getAttribute('data-index') || '0', 10) || 0;
                const ops = this._ops.get(el) || this._parse(el);
                let target = current - 1;
                if (target < 0) target = ops.wrap ? total - 1 : 0;
                this._set(el, target);
                this._start(el);
            }
        },

        Scrollspy: {
            init() {
                const spiedElements = document.querySelectorAll('[data-bw-spy="scroll"]');
                spiedElements.forEach(container => {
                    const targetSelector = container.getAttribute('data-bw-target');
                    if (!targetSelector) return;
                    
                    const navLinks = document.querySelectorAll(`${targetSelector} .bw-nav-link, ${targetSelector} .nav-link, ${targetSelector} .bw-tab, ${targetSelector} a`);
                    if (navLinks.length === 0) return;

                    const sections = Array.from(navLinks).map(link => {
                        const hash = link.getAttribute('href');
                        if (hash && hash.startsWith('#')) return document.querySelector(hash);
                        return null;
                    }).filter(Boolean);

                    const scrollTarget = container === document.body ? window : container;
                    
                    let ticking = false;
                    scrollTarget.addEventListener('scroll', () => {
                        if (!ticking) {
                            window.requestAnimationFrame(() => {
                                let current = '';
                                const scrollPos = (scrollTarget === window ? window.scrollY : container.scrollTop) + 150;
                                
                                sections.forEach(section => {
                                    if (scrollPos >= section.offsetTop) current = '#' + section.getAttribute('id');
                                });
                                
                                navLinks.forEach(link => {
                                    link.classList.remove('active');
                                    if (link.getAttribute('href') === current) link.classList.add('active');
                                });
                                ticking = false;
                            });
                            ticking = true;
                        }
                    });
                });
            }
        },

        Toast: {
            container: null,
            show({ title = 'System Alert', message = '', type = 'info', duration = 4000 }) {
                if (!this.container) {
                    this.container = document.createElement('div');
                    this.container.className = 'bw-toast-container bw-gpu';
                    document.body.appendChild(this.container);
                }
                
                const toast = document.createElement('div');
                toast.className = 'bw-toast bw-gpu';
                toast.setAttribute('role', 'alert');
                
                let bColor = 'var(--bw-info)';
                let icon = 'ℹ️';
                if(type === 'success') { bColor = 'var(--bw-success)'; icon = '✓'; }
                if(type === 'warning') { bColor = 'var(--bw-warning)'; icon = '⚠️'; }
                if(type === 'danger')  { bColor = 'var(--bw-danger)'; icon = '🚨'; }
                
                toast.style.borderLeftColor = bColor;
                toast.innerHTML = `
                    <div class="bw-toast-title"><span style="color:${bColor}">${icon}</span> ${title}</div>
                    <div class="bw-toast-msg">${message}</div>
                `;
                
                this.container.appendChild(toast);
                
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => toast.classList.add('show'));
                });
                
                setTimeout(() => {
                    toast.classList.remove('show');
                    setTimeout(() => toast.remove(), 400); 
                }, duration);
            }
        }
    };

    /* ====================================================================
     * QUANTUM THEME ENGINE
     * ==================================================================== */
    const _Theme = {
        init(defaultTheme) {
            try {
                const saved = localStorage.getItem('bw-theme');
                document.documentElement.setAttribute('data-theme', saved || defaultTheme);
            } catch (e) {
                document.documentElement.setAttribute('data-theme', defaultTheme);
            }
        },
        toggle() {
            const html = document.documentElement;
            const current = html.getAttribute('data-theme') || 'light';
            const next = current === 'light' ? 'dark' : 'light';
            html.setAttribute('data-theme', next);
            try { localStorage.setItem('bw-theme', next); } catch(e) {}
            return next;
        }
    };

    /* ====================================================================
     * SECURITY & TELEMETRY PROTOCOLS
     * ==================================================================== */
    const _Security = {
        applyStrictMode() {
            document.addEventListener('contextmenu', e => e.preventDefault());
            document.body.style.userSelect = 'none';
            document.body.style.webkitUserSelect = 'none';
            document.addEventListener('dragstart', e => e.preventDefault());
            console.log("%c[Q-Command] STRICT MODE ENFORCED. UI TAMPERING BLOCKED.", "color: #F43F5E; font-weight: bold; background: #020617; padding: 4px;");
        },
        lockdown(reason = 'CRITICAL SECURITY BREACH') {
            let overlay = document.getElementById('bw-sys-lockdown');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'bw-sys-lockdown';
                overlay.style.cssText = `position: fixed; inset: 0; background: rgba(2, 6, 23, 0.98); z-index: 2147483647; display: flex; flex-direction: column; align-items: center; justify-content: center; backdrop-filter: blur(20px); color: #F43F5E; font-family: 'JetBrains Mono', monospace; opacity: 0; transition: opacity 0.2s ease; user-select: none;`;
                overlay.innerHTML = `
                    <div style="font-size: 6rem; animation: bw-pulse 1s infinite alternate; filter: drop-shadow(0 0 30px #F43F5E);">☢️</div>
                    <h1 style="letter-spacing: 0.15em; margin: 1rem 0; text-align: center; font-weight: bold; font-size: 2.5rem;">PROTOCOL OMEGA INITIATED</h1>
                    <p id="bw-lockdown-reason" style="font-size: 1.2rem; color: #FDA4AF; text-align: center;">${reason}</p>
                    <div style="margin-top: 3rem; font-size: 0.85rem; color: #64748B; letter-spacing: 0.05em;">TERMINAL LOCKED. ALL CONNECTIONS SEVERED.</div>
                    <style>@keyframes bw-pulse { from { transform: scale(1); opacity: 0.8; } to { transform: scale(1.1); opacity: 1; } }</style>
                `;
                document.body.appendChild(overlay);
            } else {
                document.getElementById('bw-lockdown-reason').innerText = reason;
            }
            
            document.body.style.overflow = 'hidden';
            requestAnimationFrame(() => overlay.style.opacity = '1');
            
            if(_config.strictMode) {
                Array.from(document.body.children).forEach(child => {
                    if (child.id !== 'bw-sys-lockdown' && child.tagName !== 'SCRIPT') child.remove();
                });
            }
        },
        getTelemetry() {
            return {
                appId: _config.appId,
                theme: document.documentElement.getAttribute('data-theme'),
                strictMode: _config.strictMode,
                timestamp: new Date().toISOString(),
                status: 'SECURE_NODE'
            };
        }
    };

    /* ====================================================================
     * EVENT DELEGATION MASTER
     * ==================================================================== */
    const _initDelegation = () => {
        document.addEventListener('click', (e) => {
            const target = e.target;

            // Modals
            const modalToggle = _DOM.getClosest(target, '[data-bw-toggle="modal"]');
            if (modalToggle) { e.preventDefault(); _UI.Modal.open(_DOM.getTarget(modalToggle)); return; }
            const modalDismiss = _DOM.getClosest(target, '[data-bw-dismiss="modal"]');
            if (modalDismiss) { e.preventDefault(); _UI.Modal.close(_DOM.getClosest(target, '.bw-modal')); return; }

            // Offcanvas
            const offcanvasToggle = _DOM.getClosest(target, '[data-bw-toggle="offcanvas"]');
            if (offcanvasToggle) { e.preventDefault(); _UI.Offcanvas.open(_DOM.getTarget(offcanvasToggle)); return; }
            const offcanvasDismiss = _DOM.getClosest(target, '[data-bw-dismiss="offcanvas"]');
            if (offcanvasDismiss) { e.preventDefault(); _UI.Offcanvas.close(_DOM.getClosest(target, '.bw-offcanvas')); return; }

            // Dropdowns
            const dropdownToggle = _DOM.getClosest(target, '[data-bw-toggle="dropdown"]');
            if (dropdownToggle) { e.preventDefault(); _UI.Dropdown.toggle(dropdownToggle); return; }

            // Popovers
            const popoverToggle = _DOM.getClosest(target, '[data-bw-toggle="popover"]');
            if (popoverToggle) { e.preventDefault(); _UI.Popover.toggle(popoverToggle); return; }

            // Tabs
            const tabToggle = _DOM.getClosest(target, '[data-bw-toggle="tab"]');
            if (tabToggle) { e.preventDefault(); _UI.Tab.show(tabToggle); return; }

            // Accordion
            const collapseToggle = _DOM.getClosest(target, '[data-bw-toggle="collapse"]');
            if (collapseToggle) { e.preventDefault(); _UI.Accordion.toggle(collapseToggle); return; }

            // Carousel (canonical)
            const slideNext = _DOM.getClosest(target, '[data-bw-slide="next"]');
            if (slideNext) { 
                e.preventDefault(); 
                const tgt = _DOM.getTarget(slideNext) || _DOM.getClosest(target, '.bw-carousel'); 
                _UI.Carousel.next(tgt); 
                return; 
            }
            const slidePrev = _DOM.getClosest(target, '[data-bw-slide="prev"]');
            if (slidePrev) { 
                e.preventDefault(); 
                const tgt = _DOM.getTarget(slidePrev) || _DOM.getClosest(target, '.bw-carousel'); 
                _UI.Carousel.prev(tgt); 
                return; 
            }
            const slideTo = _DOM.getClosest(target, '[data-bw-slide-to]');
            if (slideTo) {
                e.preventDefault();
                const idx = parseInt(slideTo.getAttribute('data-bw-slide-to') || '0', 10) || 0;
                const tgt = _DOM.getTarget(slideTo) || _DOM.getClosest(target, '.bw-carousel');
                _UI.Carousel.go(tgt, idx);
                return;
            }

            // Carousel (docs compatibility)
            const docsNext = _DOM.getClosest(target, '[data-docs-carousel-next]');
            if (docsNext) {
                e.preventDefault();
                const tgt = _DOM.getClosest(target, '.bw-carousel');
                _UI.Carousel.next(tgt);
                return;
            }
            const docsPrev = _DOM.getClosest(target, '[data-docs-carousel-prev]');
            if (docsPrev) {
                e.preventDefault();
                const tgt = _DOM.getClosest(target, '.bw-carousel');
                _UI.Carousel.prev(tgt);
                return;
            }
            const docsGo = _DOM.getClosest(target, '[data-docs-carousel-go]');
            if (docsGo) {
                e.preventDefault();
                const idx = parseInt(docsGo.getAttribute('data-docs-carousel-go') || '0', 10) || 0;
                const tgt = _DOM.getClosest(target, '.bw-carousel');
                _UI.Carousel.go(tgt, idx);
                return;
            }

            // Click Outside Detection
            if (!_DOM.getClosest(target, '.bw-dropdown')) _UI.Dropdown.closeAll();
            if (!_DOM.getClosest(target, '.bw-popover-wrapper')) _UI.Popover.closeAll();
            
            // Background Overlay Click (Closes Modals & Offcanvas)
            if (target.classList.contains('bw-overlay')) {
                _UI.Modal.closeAll();
                _UI.Offcanvas.closeAll();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') { 
                _UI.Dropdown.closeAll(); 
                _UI.Popover.closeAll();
                _UI.Modal.closeAll(); 
                _UI.Offcanvas.closeAll(); 
            }
        });
    };

    /* ====================================================================
     * PUBLIC API (Immutable)
     * ==================================================================== */
    const BootWindAPI = {
        init: function (options = {}) {
            if (_isInitialized) return console.warn('[BootWind] System already initialized.');
            
            _config = { ..._config, ...options };
            
            _Theme.init(_config.theme);
            _initDelegation();
            _UI.Carousel.initAll();
            
            // Allow DOM to settle before calculating scrollspy offsets
            setTimeout(() => { _UI.Scrollspy.init(); }, 100);
            
            if (_config.strictMode) _Security.applyStrictMode();
            
            console.log(`%c 🛡️ BootWind Elite v2.5.0 | Node: ${_config.appId} | Status: SECURE `, "color: #FFF; font-weight: bold; background: linear-gradient(90deg, #0F172A, #2563EB); padding: 4px 8px; border-radius: 4px;");
            
            _isInitialized = true;
            if (typeof _config.onReady === 'function') _config.onReady();

            if (_config.strictMode) Object.freeze(this); // Anti-Tamper
        },
        
        ui: {
            toast: (opts) => { if(_isInitialized) _UI.Toast.show(opts); },
            modal: {
                open: (id) => _UI.Modal.open(document.getElementById(id)),
                close: (id) => _UI.Modal.close(document.getElementById(id))
            },
            offcanvas: {
                open: (id) => _UI.Offcanvas.open(document.getElementById(id)),
                close: (id) => _UI.Offcanvas.close(document.getElementById(id))
            },
            scrollspy: {
                refresh: () => _UI.Scrollspy.init()
            },
            carousel: {
                next: (id) => _UI.Carousel.next(document.getElementById(id)),
                prev: (id) => _UI.Carousel.prev(document.getElementById(id)),
                go: (id, idx) => _UI.Carousel.go(document.getElementById(id), idx)
            }
        },
        
        theme: {
            toggle: () => _Theme.toggle()
        },
        
        security: {
            lockdown: (reason) => _Security.lockdown(reason),
            telemetry: () => _Security.getTelemetry()
        },
        
        version: '2.5.0-Elite'
    };

    return BootWindAPI;
}));
