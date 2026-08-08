/**
 * KinCare Auth Module — Authentication & Session Management
 * Clean Build Architecture: Auth Module (Loads 2nd)
 */

(function(window) {
    'use strict';

    const STORAGE_KEY_USER = 'kincare_session_user';

    window.KinCareAuth = {
        init() {
            try {
                const saved = localStorage.getItem(STORAGE_KEY_USER);
                if (saved) {
                    window.KINCARE_STATE.currentUser = JSON.parse(saved);
                }
            } catch (e) {
                console.warn('Auth init failed:', e);
            }
        },

        login(email, role = 'family') {
            const user = {
                email: email,
                name: email.split('@')[0],
                role: role,
                loggedInAt: new Date().toISOString()
            };
            window.KINCARE_STATE.currentUser = user;
            window.KINCARE_STATE.currentRole = role;
            try {
                localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
            } catch (e) {}

            if (window.KinCareCore) {
                window.KinCareCore.showToast(`Welcome back, ${user.name}!`, 'success');
            }
            return user;
        },

        logout() {
            window.KINCARE_STATE.currentUser = null;
            try {
                localStorage.removeItem(STORAGE_KEY_USER);
            } catch (e) {}

            if (window.KinCareCore) {
                window.KinCareCore.showToast('Signed out successfully.', 'info');
            }
        },

        isAuthenticated() {
            return !!window.KINCARE_STATE.currentUser;
        }
    };

    // Auto-init on load
    window.KinCareAuth.init();
})(window);
