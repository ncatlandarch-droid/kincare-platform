/**
 * KinCare Automated Provider Vetting & Auto-Categorization Engine
 * Handles Checkr API hooks, applicant categorization, status automation,
 * and roster synchronization across the KinCare platform.
 */

(function(window) {
    'use strict';

    const STORAGE_KEY_APPLICANTS = 'kincare_provider_applicants';

    // Default Seed Applicants with Tiers, Ratings, Tips, and Strike Status
    const DEFAULT_APPLICANTS = [
        {
            id: 'APP-1001',
            fullName: 'Jessica Taylor',
            email: 'jessica.t@uncg.edu',
            phone: '(336) 555-0192',
            city: 'Greensboro, NC',
            serviceType: 'Babysitting',
            experience: '3-5 years',
            availability: ['Afternoons', 'Evenings', 'Weekends'],
            whyKinCare: 'Senior nursing student at UNCG. Passionate about early childhood safety and care.',
            submittedAt: '2026-08-08T10:15:00Z',
            checkrStatus: 'passed',
            mvrStatus: 'not_required',
            categories: ['Babysitting', 'Tutoring'],
            baseRate: 22.00,
            tier: 'Gold',
            rating: 4.92,
            jobsCompleted: 38,
            tipsEarned: 345.50,
            strikes: 0,
            status: 'approved'
        },
        {
            id: 'APP-1002',
            fullName: 'Marcus Vance',
            email: 'marcus.vance@gmail.com',
            phone: '(336) 555-0841',
            city: 'Greensboro, NC',
            serviceType: 'Kid Transport',
            experience: '5+ years',
            availability: ['Mornings', 'Afternoons', 'Flexible'],
            whyKinCare: 'Former school bus driver looking for flexible part-time transit & pet sitting.',
            submittedAt: '2026-08-08T11:40:00Z',
            checkrStatus: 'passed',
            mvrStatus: 'passed',
            categories: ['Kid Transport', 'Pet Care'],
            baseRate: 25.00,
            tier: 'Platinum',
            rating: 4.98,
            jobsCompleted: 62,
            tipsEarned: 580.00,
            strikes: 0,
            status: 'approved'
        },
        {
            id: 'APP-1003',
            fullName: 'Samantha Reed',
            email: 'sam.reed@ncat.edu',
            phone: '(336) 555-0319',
            city: 'Greensboro, NC',
            serviceType: 'Multiple',
            experience: '1-3 years',
            availability: ['Weekends', 'Flexible'],
            whyKinCare: 'Junior at NC A&T. CPR certified and experience with toddlers & pets.',
            submittedAt: '2026-08-08T13:05:00Z',
            checkrStatus: 'pending',
            mvrStatus: 'pending',
            categories: ['Babysitting', 'Pet Care', 'Home Help'],
            baseRate: 18.00,
            tier: 'Bronze',
            rating: 4.75,
            jobsCompleted: 6,
            tipsEarned: 45.00,
            strikes: 0,
            status: 'pending_review'
        },
        {
            id: 'APP-1004',
            fullName: 'David Holloway',
            email: 'dholloway@yahoo.com',
            phone: '(336) 555-0722',
            city: 'Greensboro, NC',
            serviceType: 'Senior Companion',
            experience: '5+ years',
            availability: ['Mornings', 'Afternoons', 'Evenings'],
            whyKinCare: 'CNA background with 6 years experience in elder companion care and home assistance.',
            submittedAt: '2026-08-08T14:12:00Z',
            checkrStatus: 'pending',
            mvrStatus: 'not_required',
            categories: ['Senior Companion', 'Home Help'],
            baseRate: 28.00,
            tier: 'Platinum',
            rating: 4.96,
            jobsCompleted: 54,
            tipsEarned: 490.00,
            strikes: 0,
            status: 'pending_review'
        }
    ];

    const KinCareAutomator = {
        getApplicants() {
            try {
                const stored = localStorage.getItem(STORAGE_KEY_APPLICANTS);
                return stored ? JSON.parse(stored) : DEFAULT_APPLICANTS;
            } catch (e) {
                return DEFAULT_APPLICANTS;
            }
        },

        saveApplicants(applicants) {
            try {
                localStorage.setItem(STORAGE_KEY_APPLICANTS, JSON.stringify(applicants));
            } catch (e) {
                console.error('Failed to save applicants:', e);
            }
        },

        autoCategorize(serviceType, whyText = '') {
            const categories = [];
            const text = (serviceType + ' ' + whyText).toLowerCase();

            if (text.includes('baby') || text.includes('child') || text.includes('kid') || serviceType === 'Babysitting' || serviceType === 'Multiple') {
                categories.push('Babysitting');
            }
            if (text.includes('pet') || text.includes('dog') || text.includes('cat') || serviceType === 'Pet Care' || serviceType === 'Multiple') {
                categories.push('Pet Care');
            }
            if (text.includes('transport') || text.includes('driver') || text.includes('transit') || serviceType === 'Kid Transport' || serviceType === 'Multiple') {
                categories.push('Kid Transport');
            }
            if (text.includes('senior') || text.includes('elder') || text.includes('cna') || serviceType === 'Senior Companion' || serviceType === 'Multiple') {
                categories.push('Senior Companion');
            }
            if (text.includes('clean') || text.includes('home') || text.includes('help') || serviceType === 'Home Help' || serviceType === 'Multiple') {
                categories.push('Home Help');
            }
            if (text.includes('tutor') || text.includes('school') || text.includes('math') || serviceType === 'Tutoring' || serviceType === 'Multiple') {
                categories.push('Tutoring');
            }

            if (categories.length === 0) {
                categories.push(serviceType || 'Babysitting');
            }

            return categories;
        },

        calculateSuggestedRate(categories, experience) {
            let base = 20;
            if (categories.includes('Senior Companion') || categories.includes('Kid Transport')) base = 25;
            if (categories.includes('Tutoring')) base = 24;

            if (experience === '5+ years') base += 3;
            if (experience === '3-5 years') base += 2;

            return `$${base}/hr`;
        },

        ingestApplication(formData) {
            const list = this.getApplicants();
            const categories = this.autoCategorize(formData.serviceType || '', formData.whyKinCare || '');
            const requiresMvr = formData.serviceType === 'Kid Transport' || categories.includes('Kid Transport');
            
            const newApplicant = {
                id: 'APP-' + (1000 + list.length + 1),
                fullName: formData.fullName || 'Anonymous Applicant',
                email: formData.email || '',
                phone: formData.phone || '',
                city: formData.city || 'Greensboro, NC',
                serviceType: formData.serviceType || 'Babysitting',
                experience: formData.experience || '1-3 years',
                availability: formData.availability || ['Flexible'],
                whyKinCare: formData.whyKinCare || '',
                submittedAt: new Date().toISOString(),
                checkrStatus: 'pending',
                mvrStatus: requiresMvr ? 'pending' : 'not_required',
                categories: categories,
                baseRate: Math.max(17.00, parseFloat(formData.requestedRate || 18.00)), // Baseline pay $17.00/hr guarantee
                tier: 'Bronze',
                rating: 5.00,
                jobsCompleted: 0,
                tipsEarned: 0.00,
                strikes: 0,
                status: 'pending_review'
            };

            list.unshift(newApplicant);
            this.saveApplicants(list);
            return newApplicant;
        },

        recordStrike(applicantId, reason) {
            const list = this.getApplicants();
            const target = list.find(a => a.id === applicantId);
            if (!target) return null;

            target.strikes = (target.strikes || 0) + 1;
            if (target.strikes >= 3) {
                target.status = 'banned_3_strikes';
            }
            this.saveApplicants(list);
            return target;
        },

        calculateTier(jobsCompleted, rating) {
            if (jobsCompleted >= 50 && rating >= 4.90) return 'Platinum';
            if (jobsCompleted >= 25 && rating >= 4.80) return 'Gold';
            if (jobsCompleted >= 10 && rating >= 4.60) return 'Silver';
            return 'Bronze';
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
                    if (target.mvrStatus === 'pending') {
                        target.mvrStatus = 'passed';
                    }
                    target.status = 'approved';
                    this.saveApplicants(refreshed);
                    if (window.onCheckrUpdate) window.onCheckrUpdate(target);
                }
            }, 1500);
        },

        approveApplicant(applicantId) {
            const applicants = this.getApplicants();
            const applicant = applicants.find(a => a.id === applicantId);
            if (applicant) {
                applicant.status = 'approved';
                applicant.checkrStatus = 'passed';
                if (applicant.mvrStatus === 'pending') applicant.mvrStatus = 'passed';
                this.saveApplicants(applicants);
            }
            return applicant;
        }
    };

    window.KinCareAutomator = KinCareAutomator;
})(window);
