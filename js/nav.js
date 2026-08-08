/**
 * KinCare Navigation Module — View Switching & Responsive Nav
 * Clean Build Architecture: Navigation Module (Loads 3rd)
 */

(function(window) {
    'use strict';

    window.KinCareNav = {
        switchView(viewId) {
            const views = document.querySelectorAll('.view');
            if (!views.length) return;

            views.forEach(v => v.classList.remove('active'));

            const target = document.getElementById('view-' + viewId);
            if (target) {
                target.classList.add('active');
                if (window.KINCARE_STATE) {
                    window.KINCARE_STATE.currentView = viewId;
                }
            }

            // Update active nav items
            document.querySelectorAll('[data-view]').forEach(item => {
                if (item.getAttribute('data-view') === viewId) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        },

        initMobileMenu() {
            const btn = document.getElementById('mobileMenuBtn');
            const menu = document.getElementById('mobileNav');
            if (!btn || !menu) return;

            btn.addEventListener('click', () => {
                menu.classList.toggle('active');
                btn.classList.toggle('open');
            });
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        window.KinCareNav.initMobileMenu();
    });
})(window);
