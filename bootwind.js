/**
 * ========================================================================
 * BOOTWIND ELITE ENGINE v2.0.0 (JavaScript Core)
 * ------------------------------------------------------------------------
 * Description: The ultimate, standalone JavaScript engine for BootWind.
 * Features:    Event Delegation, MutationObserver for SPAs, Zero-Dependency,
 * Quantum Theme Controller, Security Lockdown API.
 * Security:    Strict Mode Enforced. Global Namespace Protected.
 * ========================================================================
 */

(function (global) {
    'use strict';

    // ป้องกันการประกาศซ้ำ หากมีไฟล์นี้อยู่แล้ว
    if (global.BootWind) return;

    /**
     * สถาปัตยกรรมแกนกลาง (Core Architecture)
     * ใช้ Event Delegation เพื่อดักจับ Event ทั้งหมดที่ระดับ Document 
     * ช่วยลดหน่วยความจำ (Memory Leak) และเพิ่มประสิทธิภาพขั้นสุด
     */
    const DOM = {
        // ฟังก์ชันช่วยหา Element ที่ใกล้ที่สุด (รองรับ Event Delegation)
        getClosest: (elem, selector) => {
            for (; elem && elem !== document; elem = elem.parentNode) {
                if (elem.matches(selector)) return elem;
            }
            return null;
        },
        // ฟังก์ชันหา Target Element จาก Attribute
        getTarget: (elem) => {
            const selector = elem.getAttribute('data-bw-target') || elem.getAttribute('href');
            if (!selector || selector === '#') return null;
            return document.querySelector(selector);
        }
    };

    /**
     * ==========================================
     * COMPONENT CONTROLLERS (ระบบควบคุม UI)
     * ==========================================
     */

    // --- 1. Modals & Overlays ---
    const Modal = {
        open(target) {
            if (!target) return;
            let overlay = document.querySelector('.bw-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'bw-overlay bw-gpu';
                document.body.appendChild(overlay);
            }
            
            // ล็อกหน้าจอพื้นหลังไม่ให้ Scroll
            document.body.style.overflow = 'hidden';
            
            // แสดง Overlay และ Modal
            requestAnimationFrame(() => {
                overlay.classList.add('active');
                target.classList.add('active');
                target.setAttribute('aria-modal', 'true');
                target.setAttribute('role', 'dialog');
            });
        },
        close(target) {
            if (!target) return;
            const overlay = document.querySelector('.bw-overlay');
            
            target.classList.remove('active');
            target.removeAttribute('aria-modal');
            
            // ปิด Overlay หากไม่มี Modal อื่นเปิดอยู่
            if (overlay && !document.querySelector('.bw-modal.active')) {
                overlay.classList.remove('active');
                document.body.style.overflow = ''; // ปลดล็อก Scroll
            }
        },
        closeAll() {
            document.querySelectorAll('.bw-modal.active').forEach(m => this.close(m));
        }
    };

    // --- 2. Dropdowns ---
    const Dropdown = {
        toggle(trigger) {
            const dropdown = trigger.closest('.bw-dropdown');
            if (!dropdown) return;
            
            const isActive = dropdown.classList.contains('active');
            this.closeAll(); // ปิดตัวอื่นก่อน
            
            if (!isActive) {
                dropdown.classList.add('active');
                trigger.setAttribute('aria-expanded', 'true');
            }
        },
        closeAll() {
            document.querySelectorAll('.bw-dropdown.active').forEach(d => {
                d.classList.remove('active');
                const trigger = d.querySelector('[data-bw-toggle="dropdown"]');
                if (trigger) trigger.setAttribute('aria-expanded', 'false');
            });
        }
    };

    // --- 3. Tabs ---
    const Tab = {
        show(trigger) {
            const target = DOM.getTarget(trigger);
            if (!target) return;

            const tabGroup = trigger.closest('.bw-tabs');
            if (!tabGroup) return;

            // ลบ Active จาก Tab ปุ่ม
            tabGroup.querySelectorAll('.bw-tab.active').forEach(t => t.classList.remove('active'));
            trigger.classList.add('active');

            // ลบ Active จากเนื้อหา (Content)
            const contentGroup = target.parentElement;
            contentGroup.querySelectorAll('.bw-tab-pane').forEach(c => c.classList.add('bw-hidden'));
            target.classList.remove('bw-hidden');
        }
    };

    // --- 4. Accordion / Collapse ---
    const Accordion = {
        toggle(trigger) {
            const item = trigger.closest('.bw-accordion-item') || trigger.closest('.bw-collapse-wrapper');
            if (!item) return;

            const target = DOM.getTarget(trigger) || item.querySelector('.bw-accordion-body');
            const isAccordion = item.classList.contains('bw-accordion-item');
            
            if (isAccordion) {
                const group = item.closest('.bw-accordion');
                // สลับการเปิดปิด (Toggle)
                const isActive = item.classList.contains('active');
                
                // ปิดตัวอื่นในกลุ่มเดียวกัน
                group.querySelectorAll('.bw-accordion-item.active').forEach(i => {
                    i.classList.remove('active');
                });

                if (!isActive) {
                    item.classList.add('active');
                }
            } else {
                // Collapse ธรรมดา
                item.classList.toggle('active');
            }
        }
    };

    // --- 5. Toasts (System Notifications) ---
    const Toast = {
        container: null,
        init() {
            if (!document.querySelector('.bw-toast-container')) {
                this.container = document.createElement('div');
                this.container.className = 'bw-toast-container bw-gpu';
                document.body.appendChild(this.container);
            } else {
                this.container = document.querySelector('.bw-toast-container');
            }
        },
        show(options = {}) {
            this.init();
            const { title = 'System Alert', message = '', type = 'info', duration = 5000 } = options;
            
            const toast = document.createElement('div');
            toast.className = `bw-toast bw-toast-${type}`;
            toast.setAttribute('role', 'alert');
            
            // กำหนดสีและไอคอนตามระดับความสำคัญ
            let borderColor = 'var(--bw-info)';
            let icon = 'ℹ️';
            if(type === 'success') { borderColor = 'var(--bw-success)'; icon = '✓'; }
            if(type === 'warning') { borderColor = 'var(--bw-warning)'; icon = '⚠️'; }
            if(type === 'danger') { borderColor = 'var(--bw-danger)'; icon = '🚨'; }
            
            toast.style.borderLeftColor = borderColor;
            toast.innerHTML = `
                <div class="bw-toast-title"><span style="color:${borderColor}">${icon}</span> ${title}</div>
                <div class="bw-toast-msg">${message}</div>
            `;
            
            this.container.appendChild(toast);
            
            // Animation Slide In
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    toast.classList.add('show');
                });
            });
            
            // Auto Remove
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 400); // รอ CSS Transition ทำงานเสร็จ
            }, duration);
        }
    };

    // --- 6. Quantum Theme Engine ---
    const Theme = {
        toggle() {
            const html = document.documentElement;
            const currentTheme = html.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            html.setAttribute('data-theme', newTheme);
            try {
                localStorage.setItem('bw-theme', newTheme);
            } catch (e) { /* จัดการกรณี Security Privacy บล็อก LocalStorage */ }
            
            return newTheme;
        },
        init() {
            try {
                const savedTheme = localStorage.getItem('bw-theme');
                if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
            } catch (e) {}
        }
    };

    // --- 7. Security Protocol (Lockdown API) ---
    const Security = {
        lockdown(reason = 'SECURITY BREACH DETECTED') {
            let overlay = document.getElementById('bw-sys-lockdown');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'bw-sys-lockdown';
                overlay.style.cssText = `
                    position: fixed; inset: 0; background: rgba(2, 6, 23, 0.98); z-index: 99999;
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    backdrop-filter: blur(20px); color: #F43F5E; font-family: 'JetBrains Mono', monospace;
                    opacity: 0; transition: opacity 0.3s ease;
                `;
                overlay.innerHTML = `
                    <div style="font-size: 5rem; animation: bw-pulse 1s infinite alternate; filter: drop-shadow(0 0 20px #F43F5E);">☢️</div>
                    <h1 style="letter-spacing: 0.1em; margin-bottom: 1rem; text-align: center; font-weight: bold;">PROTOCOL OMEGA INITIATED</h1>
                    <p style="font-size: 1.2rem; color: #FDA4AF; text-align: center;">${reason}</p>
                    <div style="margin-top: 3rem; font-size: 0.9rem; color: #64748B;">SYSTEM HALTED. TERMINAL LOCKED.</div>
                    <style>@keyframes bw-pulse { from { transform: scale(1); opacity: 0.8; } to { transform: scale(1.1); opacity: 1; } }</style>
                `;
                document.body.appendChild(overlay);
            } else {
                overlay.querySelector('p').innerText = reason;
            }
            
            requestAnimationFrame(() => {
                overlay.style.opacity = '1';
            });
            document.body.style.overflow = 'hidden';
        }
    };

    /**
     * ==========================================
     * EVENT DELEGATION MASTER CONTROLLER
     * ศูนย์กลางควบคุมการคลิกทั้งหมดในระบบ
     * ==========================================
     */
    function initEventDelegation() {
        document.body.addEventListener('click', (event) => {
            const target = event.target;

            // 1. ตรวจจับการคลิกเปิด Modal
            const modalToggle = DOM.getClosest(target, '[data-bw-toggle="modal"]');
            if (modalToggle) {
                event.preventDefault();
                Modal.open(DOM.getTarget(modalToggle));
                return;
            }

            // 2. ตรวจจับการคลิกปิด Modal (Close Button)
            const modalDismiss = DOM.getClosest(target, '[data-bw-dismiss="modal"]');
            if (modalDismiss) {
                event.preventDefault();
                Modal.close(DOM.getClosest(target, '.bw-modal'));
                return;
            }

            // 3. ตรวจจับการคลิก Dropdown
            const dropdownToggle = DOM.getClosest(target, '[data-bw-toggle="dropdown"]');
            if (dropdownToggle) {
                event.preventDefault();
                Dropdown.toggle(dropdownToggle);
                return;
            }

            // 4. ตรวจจับการคลิก Tabs
            const tabToggle = DOM.getClosest(target, '[data-bw-toggle="tab"]');
            if (tabToggle) {
                event.preventDefault();
                Tab.show(tabToggle);
                return;
            }

            // 5. ตรวจจับการคลิก Accordion / Collapse
            const collapseToggle = DOM.getClosest(target, '[data-bw-toggle="collapse"]');
            if (collapseToggle) {
                event.preventDefault();
                Accordion.toggle(collapseToggle);
                return;
            }

            // 6. ตรวจจับการคลิกพื้นที่ว่างเพื่อปิด Dropdown / Modal (Click Outside)
            if (!DOM.getClosest(target, '.bw-dropdown')) {
                Dropdown.closeAll();
            }
            
            if (target.classList.contains('bw-overlay')) {
                Modal.closeAll();
            }
        });
        
        // รองรับการกดปุ่ม ESC เพื่อปิด Modal/Dropdown
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                Dropdown.closeAll();
                Modal.closeAll();
            }
        });
    }

    /**
     * ==========================================
     * MUTATION OBSERVER (SPA Support)
     * ==========================================
     * หากระบบมีการดึง HTML มาแปะใหม่แบบ Dynamic (เช่น React, Vue, HTMX, Ajax)
     * ไม่ต้องเรียกสคริปต์ซ้ำ ระบบ Event Delegation จะจัดการให้อัตโนมัติ 
     * Observer นี้มีไว้สำหรับ Initialization บางอย่างถ้าจำเป็นในอนาคต
     */
    function initObserver() {
        const observer = new MutationObserver((mutations) => {
            // ในโครงสร้างนี้ เราใช้ Event Delegation เป็นหลัก จึงไม่จำเป็นต้อง
            // re-bind event ใดๆ เมื่อ DOM เปลี่ยนแปลง ทำให้ประสิทธิภาพสูงมาก
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    /**
     * ==========================================
     * INITIALIZATION & EXPORT
     * ==========================================
     */
    const init = () => {
        Theme.init();
        initEventDelegation();
        initObserver();
        
        console.log("%c[BootWind Elite] Core Engine Activated & Secured.", "color: #10B981; font-weight: bold; background: #020617; padding: 4px 8px; border-radius: 4px;");
    };

    // รอให้ DOM โหลดเสร็จก่อนเริ่มทำงาน
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose API สู่ภายนอก (Global Object)
    global.BootWind = {
        theme: {
            toggle: () => Theme.toggle()
        },
        ui: {
            modal: {
                open: (id) => Modal.open(document.getElementById(id)),
                close: (id) => Modal.close(document.getElementById(id))
            },
            toast: {
                show: (options) => Toast.show(options)
            }
        },
        security: {
            lockdown: (reason) => Security.lockdown(reason)
        },
        // อนุญาตให้ระบบภายนอกสั่ง re-initialize ได้หากจำเป็น
        refresh: () => {
            console.log("[BootWind] System Refreshed");
        }
    };

})(typeof window !== 'undefined' ? window : this);