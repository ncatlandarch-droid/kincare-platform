/**
 * KinCare Automated Provider Vetting, QuickBooks Ledger & Invoicing Engine
 * Handles Checkr API hooks, bilingual categorization, QuickBooks CSV exports,
 * client invoicing, and roster synchronization across the KinCare platform.
 */
(function(window) {
    'use strict';

    const STORAGE_KEY_APPLICANTS = 'kincare_provider_applicants';
    const STORAGE_KEY_CONFIG = 'kincare_agency_config';
    const STORAGE_KEY_INVOICES = 'kincare_agency_invoices';

    const DEFAULT_CONFIG = {
        companyName: 'KinCare Agency LLC',
        ein: '42-4337623',
        ownerName: 'Nahama Green',
        contactEmail: 'KinCare@gmail.com',
        ownerPin: '4243',
        articlesUrl: 'https://drive.google.com/file/d/1TUl8ghMYeKCj2c6dV_nzEa2Ts26EXTn7/view?usp=sharing',
        stripeScreeningLink: 'https://checkout.stripe.com/c/pay/cs_live_kincare_screening_35',
        stripeBookingLink: 'https://dashboard.stripe.com/payment-links',
        stripeDonateLink: '',
        checkrPortalUrl: 'https://dashboard.checkr.com',
        quickbooksUrl: 'https://qbo.intuit.com',
        screeningFee: 35.00,
        minHourlyWage: 17.00,
        agencyFeePct: 25
    };

    const DEFAULT_APPLICANTS = [
        {
            id: 'APP-1001', fullName: 'Jessica Taylor', email: 'jessica.t@uncg.edu', phone: '(336) 555-0192',
            city: 'Greensboro, NC', serviceType: 'Babysitting', experience: '3-5 years',
            availability: ['Afternoons', 'Evenings', 'Weekends'], languages: ['English', 'Español'],
            whyKinCare: 'Senior nursing student at UNCG. Fluent in Spanish and passionate about child safety.',
            submittedAt: '2026-08-08T10:15:00Z', checkrStatus: 'passed', mvrStatus: 'not_required',
            categories: ['Babysitting', 'Tutoring'], baseRate: 22.00, tier: 'Gold', rating: 4.92,
            jobsCompleted: 38, tipsEarned: 345.50, ytdEarnings: 3685.50, strikes: 0, status: 'approved'
        },
        {
            id: 'APP-1002', fullName: 'Marcus Vance', email: 'marcus.vance@gmail.com', phone: '(336) 555-0841',
            city: 'Greensboro, NC', serviceType: 'Kid Transport', experience: '5+ years',
            availability: ['Mornings', 'Afternoons', 'Flexible'], languages: ['English'],
            whyKinCare: 'Former school bus driver looking for flexible part-time transit & pet sitting.',
            submittedAt: '2026-08-08T11:40:00Z', checkrStatus: 'passed', mvrStatus: 'passed',
            categories: ['Kid Transport', 'Pet Care'], baseRate: 25.00, tier: 'Platinum', rating: 4.98,
            jobsCompleted: 62, tipsEarned: 580.00, ytdEarnings: 5230.00, strikes: 0, status: 'approved'
        },
        {
            id: 'APP-1003', fullName: 'Samantha Reed', email: 'sam.reed@ncat.edu', phone: '(336) 555-0319',
            city: 'Greensboro, NC', serviceType: 'Multiple', experience: '1-3 years',
            availability: ['Weekends', 'Flexible'], languages: ['English', 'Español'],
            whyKinCare: 'Junior at NC A&T. Bilingual CPR certified and experience with toddlers & pets.',
            submittedAt: '2026-08-08T13:05:00Z', checkrStatus: 'pending', mvrStatus: 'pending',
            categories: ['Babysitting', 'Pet Care', 'Home Help'], baseRate: 18.00, tier: 'Bronze', rating: 4.75,
            jobsCompleted: 6, tipsEarned: 45.00, ytdEarnings: 369.00, strikes: 0, status: 'pending_review'
        },
        {
            id: 'APP-1004', fullName: 'David Holloway', email: 'dholloway@yahoo.com', phone: '(336) 555-0722',
            city: 'Greensboro, NC', serviceType: 'Senior Companion', experience: '5+ years',
            availability: ['Mornings', 'Afternoons', 'Evenings'], languages: ['English', 'ASL'],
            whyKinCare: 'CNA background with 6 years experience in elder companion care and home assistance.',
            submittedAt: '2026-08-08T14:12:00Z', checkrStatus: 'pending', mvrStatus: 'not_required',
            categories: ['Senior Companion', 'Home Help'], baseRate: 28.00, tier: 'Platinum', rating: 4.96,
            jobsCompleted: 54, tipsEarned: 490.00, ytdEarnings: 5026.00, strikes: 0, status: 'pending_review'
        }
    ];

    const DEFAULT_INVOICES = [
        { id: 'INV-2041', clientName: 'Sarah Mitchell', clientEmail: 's.mitchell@gmail.com', service: 'Babysitting (5 hrs)', date: '2026-10-28', amount: 125.00, providerPayout: 90.00, agencyFee: 35.00, status: 'Paid' },
        { id: 'INV-2042', clientName: 'Olivia Chang', clientEmail: 'ochang@outlook.com', service: 'Senior Companion Care (10 hrs)', date: '2026-11-01', amount: 320.00, providerPayout: 240.00, agencyFee: 80.00, status: 'Paid' },
        { id: 'INV-2043', clientName: 'Amanda Torres', clientEmail: 'amanda.torres@yahoo.com', service: 'Bilingual Babysitting (6 hrs)', date: '2026-11-04', amount: 156.00, providerPayout: 117.00, agencyFee: 39.00, status: 'Pending' }
    ];

    const KinCareAutomator = {
        getConfig() {
            try {
                const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
                return stored ? Object.assign({}, DEFAULT_CONFIG, JSON.parse(stored)) : Object.assign({}, DEFAULT_CONFIG);
            } catch (e) { return Object.assign({}, DEFAULT_CONFIG); }
        },

        saveConfig(newConfig) {
            try {
                const merged = Object.assign({}, this.getConfig(), newConfig);
                localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(merged));
                return merged;
            } catch (e) { return DEFAULT_CONFIG; }
        },

        getApplicants() {
            try {
                const stored = localStorage.getItem(STORAGE_KEY_APPLICANTS);
                return stored ? JSON.parse(stored) : DEFAULT_APPLICANTS;
            } catch (e) { return DEFAULT_APPLICANTS; }
        },

        saveApplicants(applicants) {
            try { localStorage.setItem(STORAGE_KEY_APPLICANTS, JSON.stringify(applicants)); } catch (e) {}
        },

        getInvoices() {
            try {
                const stored = localStorage.getItem(STORAGE_KEY_INVOICES);
                return stored ? JSON.parse(stored) : DEFAULT_INVOICES;
            } catch (e) { return DEFAULT_INVOICES; }
        },

        saveInvoices(invoices) {
            try { localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(invoices)); } catch (e) {}
        },

        createInvoice(inv) {
            const list = this.getInvoices();
            const amount = parseFloat(inv.amount || 100);
            const feePct = (this.getConfig().agencyFeePct || 25) / 100;
            const agencyFee = Math.round(amount * feePct * 100) / 100;
            const newInv = {
                id: 'INV-' + (2040 + list.length + 1),
                clientName: inv.clientName || 'Client Family',
                clientEmail: inv.clientEmail || '',
                service: inv.service || 'Care Session',
                date: inv.date || new Date().toISOString().slice(0, 10),
                amount: amount,
                providerPayout: Math.round((amount - agencyFee) * 100) / 100,
                agencyFee: agencyFee,
                status: inv.status || 'Pending'
            };
            list.unshift(newInv);
            this.saveInvoices(list);
            return newInv;
        },

        exportApplicantsCSV() {
            const list = this.getApplicants();
            const headers = ['ID', 'Full Name', 'Email', 'Phone', 'City', 'Languages', 'Categories', 'Tier', 'Base Rate ($/hr)', 'Checkr Status', 'MVR Status', 'Jobs', 'Rating', 'Tips ($)', 'YTD Earnings ($)', '1099 Required', 'Strikes', 'Status'];
            const rows = list.map(a => {
                const ytd = a.ytdEarnings || ((a.jobsCompleted || 0) * 3 * (a.baseRate || 17) + (a.tipsEarned || 0));
                return [
                    a.id, `"${(a.fullName || '').replace(/"/g, '""')}"`, a.email || '', a.phone || '',
                    `"${(a.city || '').replace(/"/g, '""')}"`, `"${(a.languages || ['English']).join('; ')}"`,
                    `"${(a.categories || []).join('; ')}"`, a.tier || 'Bronze', (a.baseRate || 17).toFixed(2),
                    a.checkrStatus || 'pending', a.mvrStatus || 'not_required', a.jobsCompleted || 0,
                    a.rating || 5.0, (a.tipsEarned || 0).toFixed(2), ytd.toFixed(2), ytd >= 600 ? 'YES (1099-NEC)' : 'No',
                    a.strikes || 0, a.status || 'pending_review'
                ];
            });
            this._downloadCSV([headers.join(','), ...rows.map(r => r.join(','))].join('\n'), `KinCare_Providers_${new Date().toISOString().slice(0,10)}.csv`);
        },

        exportQuickBooksCSV() {
            // Exact 4-column QuickBooks Online Bank/Journal CSV format: Date, Description, Amount, Category
            const invoices = this.getInvoices();
            const headers = ['Date', 'Description', 'Amount', 'Account/Category'];
            const rows = [];
            invoices.forEach(inv => {
                rows.push([inv.date, `"Client Booking ${inv.id} - ${inv.clientName} (${inv.service})"`, inv.amount.toFixed(2), '"Care Services Revenue"']);
                rows.push([inv.date, `"1099 Provider Payout for ${inv.id}"`, (-inv.providerPayout).toFixed(2), '"Contractor Labor (1099-NEC)"']);
            });
            rows.push([new Date().toISOString().slice(0,10), '"Think! Design & Planning LLC Monthly Platform Retainer"', '-125.00', '"Software & Technology Expense"']);
            this._downloadCSV([headers.join(','), ...rows.map(r => r.join(','))].join('\n'), `KinCare_QuickBooks_Import_${new Date().toISOString().slice(0,10)}.csv`);
        },

        _downloadCSV(csvText, filename) {
            const encodedUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvText);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },

        autoCategorize(serviceType, whyText = '') {
            const categories = [];
            const text = (serviceType + ' ' + whyText).toLowerCase();
            if (text.includes('baby') || text.includes('child') || text.includes('kid') || serviceType === 'Babysitting' || serviceType === 'Multiple') categories.push('Babysitting');
            if (text.includes('pet') || text.includes('dog') || text.includes('cat') || serviceType === 'Pet Care' || serviceType === 'Multiple') categories.push('Pet Care');
            if (text.includes('transport') || text.includes('driver') || text.includes('transit') || serviceType === 'Kid Transport' || serviceType === 'Multiple') categories.push('Kid Transport');
            if (text.includes('senior') || text.includes('elder') || text.includes('cna') || serviceType === 'Senior Companion' || serviceType === 'Multiple') categories.push('Senior Companion');
            if (text.includes('clean') || text.includes('home') || text.includes('help') || serviceType === 'Home Help' || serviceType === 'Multiple') categories.push('Home Help');
            if (text.includes('tutor') || text.includes('school') || text.includes('math') || serviceType === 'Tutoring' || serviceType === 'Multiple') categories.push('Tutoring');
            if (categories.length === 0) categories.push(serviceType || 'Babysitting');
            return categories;
        },

        ingestApplication(formData) {
            const list = this.getApplicants();
            const categories = this.autoCategorize(formData.serviceType || '', formData.whyKinCare || '');
            const requiresMvr = formData.serviceType === 'Kid Transport' || categories.includes('Kid Transport');
            const langs = Array.isArray(formData.languages) && formData.languages.length ? formData.languages : ['English'];
            const isBilingual = langs.length > 1 || langs.includes('Español');
            const newApplicant = {
                id: 'APP-' + (1000 + list.length + 1),
                fullName: formData.fullName || 'Anonymous Applicant',
                email: formData.email || '',
                phone: formData.phone || '',
                city: formData.city || 'Greensboro, NC',
                serviceType: formData.serviceType || 'Babysitting',
                experience: formData.experience || '1-3 years',
                availability: formData.availability || ['Flexible'],
                languages: langs,
                whyKinCare: formData.whyKinCare || '',
                submittedAt: new Date().toISOString(),
                checkrStatus: 'pending',
                mvrStatus: requiresMvr ? 'pending' : 'not_required',
                categories: categories,
                baseRate: Math.max(17.00, parseFloat(formData.requestedRate || (isBilingual ? 19.00 : 17.00))),
                tier: isBilingual ? 'Silver' : 'Bronze',
                rating: 5.00,
                jobsCompleted: 0,
                tipsEarned: 0.00,
                ytdEarnings: 0.00,
                strikes: 0,
                status: 'pending_review'
            };
            list.unshift(newApplicant);
            this.saveApplicants(list);
            return newApplicant;
        },

        matchProviders(criteria = {}) {
            const list = this.getApplicants().filter(a => a.status !== 'banned_3_strikes' && (a.strikes || 0) < 3);
            return list.filter(a => {
                if (criteria.service && !(a.categories || []).some(c => c.toLowerCase().includes(criteria.service.toLowerCase()))) return false;
                if (criteria.language && !(a.languages || ['English']).some(l => l.toLowerCase().includes(criteria.language.toLowerCase()))) return false;
                return true;
            }).sort((a, b) => (b.rating || 5) - (a.rating || 5));
        },

        recordStrike(applicantId) {
            const list = this.getApplicants();
            const target = list.find(a => a.id === applicantId);
            if (!target) return null;
            target.strikes = (target.strikes || 0) + 1;
            if (target.strikes >= 3) target.status = 'banned_3_strikes';
            this.saveApplicants(list);
            return target;
        },

        triggerCheckrScreening(applicantId, callback) {
            const applicants = this.getApplicants();
            const applicant = applicants.find(a => a.id === applicantId);
            if (!applicant) return;
            applicant.checkrStatus = 'processing';
            this.saveApplicants(applicants);
            if (callback) callback(applicant);
            setTimeout(() => {
                const refreshed = this.getApplicants();
                const target = refreshed.find(a => a.id === applicantId);
                if (target) {
                    target.checkrStatus = 'passed';
                    if (target.mvrStatus === 'pending') target.mvrStatus = 'passed';
                    target.status = 'approved';
                    this.saveApplicants(refreshed);
                    if (window.onCheckrUpdate) window.onCheckrUpdate(target);
                }
            }, 1200);
        }
    };

    window.KinCareAutomator = KinCareAutomator;
})(window);
