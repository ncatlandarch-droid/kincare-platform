/**
 * KinCare Core Module — Global State & Shared Utilities
 * Clean Build Architecture: Core Module (Loads 1st)
 */

(function(window) {
    'use strict';

    // Global Application State
    window.KINCARE_STATE = {
        currentUser: null,
        currentRole: 'family', // 'family' | 'provider' | 'admin'
        currentView: 'home',
        activeBookings: [],
        notifications: [],
        config: {
            platformFeePercent: 20,
            membershipFeeMonthly: 9.99,
            city: 'Greensboro, NC'
        }
    };

    // Shared Utilities
    window.KinCareCore = {
        formatCurrency(amount) {
            const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2
            }).format(num);
        },

        escapeHTML(str) {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        },

        showToast(message, type = 'info') {
            let container = document.getElementById('kincare-toast-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'kincare-toast-container';
                container.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:10px;pointer-events:none;';
                document.body.appendChild(container);
            }

            const toast = document.createElement('div');
            const bg = type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#32CD32';
            toast.style.cssText = `background:${bg};color:#0A1628;padding:12px 20px;border-radius:8px;font-family:'Inter',sans-serif;font-weight:600;font-size:0.9rem;box-shadow:0 10px 25px rgba(0,0,0,0.3);pointer-events:auto;animation:fadeInUp 0.3s ease;`;
            toast.textContent = message;

            container.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(10px)';
                toast.style.transition = 'all 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
    };
})(window);
