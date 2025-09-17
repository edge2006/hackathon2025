document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let currentPage = 'login';
    let pageHistory = [];
    let file = null;
    let loading = false;
    let lastResult = null;
    let verificationHistory = [];

    // --- DOM ELEMENT REFERENCES ---
    const loginBgAnimation = document.getElementById('login-bg-animation');
    const navbar = document.getElementById('navbar');
    const userGreeting = document.getElementById('user-greeting');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const backBtn = document.getElementById('back-btn');
    const navBrand = document.getElementById('nav-brand');
    const uploadCertBtn = document.getElementById('upload-cert-btn');
    const pageTransition = document.getElementById('page-transition');

    // Menu
    const menuBtn = document.getElementById('menu-btn');
    const menuDropdown = document.getElementById('menu-dropdown');
    const menuThemeToggle = document.getElementById('menu-theme-toggle');
    const menuHistoryBtn = document.getElementById('menu-history');
    const logoutBtn = document.getElementById('logout-btn');
    const menuDashboardLink = document.getElementById('menu-dashboard-link');

    // Upload Page
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const dropZoneContent = document.getElementById('drop-zone-content');
    const verifyBtn = document.getElementById('verify-btn');
    const verifyBtnText = document.getElementById('verify-btn-text');
    const loader = document.getElementById('loader');
    const viewResultBtn = document.getElementById('view-result-btn');

    // Results Page
    const cacheIndicator = document.getElementById('cache-indicator');
    const resultStatusText = document.getElementById('result-status-text');
    const qrCodeSection = document.getElementById('qr-code-section');
    const qrCodeResult = document.getElementById('qr-code-result');
    const resultTamperScore = document.getElementById('result-tamper-score');
    const resultAnalysisSummary = document.getElementById('result-analysis-summary');
    const dynamicDetailsContainer = document.getElementById('dynamic-details-container');
    const verifyAnotherBtn = document.getElementById('verify-another-btn');
    const downloadPdfBtn = document.getElementById('download-pdf-btn');

    // History Page
    const historyList = document.getElementById('history-list');
    const noHistoryMsg = document.getElementById('no-history-msg');
    const historySearch = document.getElementById('history-search');
    const historyFilter = document.getElementById('history-filter');

    // Dashboards
    const adminTotalVerifications = document.getElementById('admin-total-verifications');
    const adminHighRiskAlerts = document.getElementById('admin-high-risk-alerts');
    const adminSupportTickets = document.getElementById('admin-support-tickets');
    const instName = document.getElementById('inst-name');
    const instVerificationsToday = document.getElementById('inst-verifications-today');
    const instTotalRecords = document.getElementById('inst-total-records');

    // Modals
    const errorModal = document.getElementById('error-modal');
    const errorMessage = document.getElementById('error-message');
    const closeErrorModal = document.getElementById('close-error-modal');
    const contactFab = document.getElementById('contact-fab');
    const contactModal = document.getElementById('contact-modal');
    const closeContactModal = document.getElementById('close-contact-modal');
    const contactForm = document.getElementById('contact-form');
    const contactTextarea = document.getElementById('contact-textarea');
    const contactSuccessMsg = document.getElementById('contact-success');

    // SVGs
    const sunIcon = `☀️ Light Mode`;
    const moonIcon = `🌙 Dark Mode`;

    // --- ENHANCED ANIMATION UTILITIES ---
    const animateElement = (element, animationClass, delay = 0) => {
        if (!element) return;
        setTimeout(() => {
            element.classList.add(animationClass);
        }, delay);
    };

    const staggerAnimation = (elements, animationClass, staggerDelay = 100) => {
        elements.forEach((element, index) => {
            if (element) {
                setTimeout(() => {
                    element.classList.add(animationClass);
                }, index * staggerDelay);
            }
        });
    };

    const showPageTransition = () => {
        if (pageTransition) {
            pageTransition.classList.add('active');
            setTimeout(() => {
                pageTransition.classList.remove('active');
            }, 300);
        }
    };

    const addRippleEffect = (button, event) => {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;

        button.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    };

    // Add ripple CSS animation
    if (!document.querySelector('#ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `
            @keyframes ripple {
                to { transform: scale(4); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    // --- CORE FUNCTIONS WITH ENHANCED ANIMATIONS ---
    const navigateTo = (page, isBackAction = false) => {
        if (!isBackAction && currentPage !== page) {
            pageHistory.push(currentPage);
        }

        // Show page transition effect
        showPageTransition();

        setTimeout(() => {
            currentPage = page;

            // Hide all pages
            document.querySelectorAll('main section').forEach(p => {
                p.classList.add('hidden');
                // Remove animation classes
                p.classList.remove('animate-fade-in', 'animate-scale-in', 'animate-fade-in-up');
            });

            // Show target page with animation
            const targetPage = document.getElementById(`${page}-page`);
            if (targetPage) {
                targetPage.classList.remove('hidden');
                setTimeout(() => {
                    targetPage.classList.add('animate-fade-in');

                    // Add staggered animations to child elements
                    const childElements = targetPage.querySelectorAll('.animate-fade-in-up, .animate-scale-in, .animate-bounce-in');
                    childElements.forEach(el => el.classList.remove('animate-fade-in-up', 'animate-scale-in', 'animate-bounce-in'));

                    setTimeout(() => {
                        staggerAnimation(Array.from(childElements), 'animate-fade-in-up', 150);
                    }, 100);
                }, 50);
            }

            // Handle navbar visibility
            navbar.classList.toggle('hidden', page === 'login');
            if (navbar && !navbar.classList.contains('hidden')) {
                navbar.classList.add('navbar-slide-down');
            }

            // Handle contact FAB
            if (contactFab) contactFab.classList.toggle('hidden', page === 'login');

            // Handle login background
            loginBgAnimation.classList.toggle('hidden', page !== 'login');

            // Handle back button
            backBtn.classList.toggle('hidden', pageHistory.length === 0 || page === 'landing');

            // Page-specific handling
            if (page === 'upload') {
                setTimeout(() => updateUploadPageUI(), 200);
            }
            if (page === 'history') {
                setTimeout(() => renderHistory(), 200);
            }
            if (page.includes('dashboard')) {
                setTimeout(() => loadDashboardData(), 200);
            }

            window.scrollTo(0, 0);
        }, 150);
    };

    const showErrorModal = (message) => {
        errorMessage.textContent = message || "An unexpected error occurred.";
        errorModal.classList.remove('hidden');
        // Add shake animation to error modal
        const modalContent = errorModal.querySelector('.animate-scale-in');
        if (modalContent) {
            modalContent.classList.add('animate-shake');
            setTimeout(() => modalContent.classList.remove('animate-shake'), 500);
        }
    };

    const hideErrorModal = () => {
        errorModal.classList.add('hidden');
    };

    const handleBack = () => {
        const lastPage = pageHistory.pop();
        if (lastPage) {
            navigateTo(lastPage, true);
        }
    };

    // --- AUTHENTICATION & ROLES ---
    const handleLogin = async (e) => {
        e.preventDefault();
        loginError.classList.add('hidden');

        // Add loading animation to submit button
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: e.target.email.value,
                    password: e.target.password.value
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userName', data.userName);
            localStorage.setItem('userRole', data.userRole);

            setupUIForLoggedInUser(data.userName, data.userRole);
            navigateTo('landing');

        } catch (error) {
            loginError.textContent = error.message;
            loginError.classList.remove('hidden');
            loginError.classList.add('animate-shake');
            setTimeout(() => loginError.classList.remove('animate-shake'), 500);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        pageHistory = [];
        navigateTo('login');
    };

    const checkExistingToken = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigateTo('login');
            return;
        }

        try {
            const response = await fetch('/check_auth', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Session expired');

            const data = await response.json();
            setupUIForLoggedInUser(data.userName, data.userRole);
            navigateTo('landing');

        } catch (error) {
            handleLogout();
        }
    };

    const setupUIForLoggedInUser = (name, role) => {
        userGreeting.textContent = `Hello, ${name}`;
        menuDashboardLink.classList.add('hidden');

        if (role === 'admin') {
            menuDashboardLink.innerHTML = `
                <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                Admin Dashboard
            `;
            menuDashboardLink.dataset.page = "admin-dashboard";
            menuDashboardLink.classList.remove('hidden');
        } else if (role === 'institution') {
            menuDashboardLink.innerHTML = `
                <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                Institution Dashboard
            `;
            menuDashboardLink.dataset.page = "institution-dashboard";
            menuDashboardLink.classList.remove('hidden');
        }
    };

    // --- API & DATA HANDLING ---
    const fetchWithAuth = async (url, options = {}) => {
        const token = localStorage.getItem('authToken');
        const headers = { ...options.headers, 'Authorization': `Bearer ${token}` };
        const response = await fetch(url, { ...options, headers });

        if (response.status === 401) {
            handleLogout();
            throw new Error('Session expired.');
        }
        return response;
    };

    const handleVerification = async () => {
        if (!file) {
            showErrorModal("Please select a file.");
            return;
        }

        loading = true;
        loader.classList.remove('hidden');
        loader.classList.add('flex');
        verifyBtnText.classList.add('hidden');
        updateVerifyButtonState();

        // Add pulsing animation to verify button
        verifyBtn.classList.add('animate-pulse');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetchWithAuth('/process_document', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            renderResults(data);
            navigateTo('results');

        } catch (error) {
            showErrorModal(error.message);
        } finally {
            loading = false;
            loader.classList.add('hidden');
            loader.classList.remove('flex');
            verifyBtnText.classList.remove('hidden');
            verifyBtn.classList.remove('animate-pulse');
            updateVerifyButtonState();
        }
    };

    const loadDashboardData = async () => {
        const role = localStorage.getItem('userRole');
        let url = '';

        if (role === 'admin') url = '/admin/dashboard_data';
        else if (role === 'institution') url = '/institution/dashboard_data';
        else return;

        try {
            const response = await fetchWithAuth(url);
            const data = await response.json();

            if (role === 'admin') {
                animateCountUp(adminTotalVerifications, data.total_verifications);
                animateCountUp(adminHighRiskAlerts, data.high_risk_alerts);
                animateCountUp(adminSupportTickets, data.support_tickets);
            } else if (role === 'institution') {
                instName.textContent = data.institution_name;
                animateCountUp(instVerificationsToday, data.verifications_today);
                animateCountUp(instTotalRecords, data.total_records_in_db);
            }
        } catch(error) {
            showErrorModal("Could not load dashboard data.");
        }
    };

    const animateCountUp = (element, finalValue, duration = 1000) => {
        const startValue = 0;
        const increment = finalValue / (duration / 50);
        let currentValue = startValue;

        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= finalValue) {
                element.textContent = finalValue;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(currentValue);
            }
        }, 50);

        element.classList.add('animate-fade-in-up');
    };

    // --- UI, RENDER & DISPLAY WITH ENHANCED ANIMATIONS ---
    const updateFileDisplay = () => {
        if (file) {
            dropZone.className = 'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300 border-green-500 bg-green-50 dark:bg-green-900/20 drop-zone-enhanced animate-glow';
            dropZoneContent.innerHTML = `
                <svg class="w-16 h-16 text-green-500 mx-auto mb-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="text-xl text-green-600 dark:text-green-400 mb-2 font-medium">${file.name}</p>
                <p class="text-green-500 dark:text-green-300 mb-4">Ready to analyze</p>
                <p class="text-sm text-green-400">Size: ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
            `;
        } else {
            dropZone.className = 'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-gray-700 drop-zone-enhanced';
            dropZoneContent.innerHTML = `
                <svg class="w-16 h-16 text-gray-400 mx-auto mb-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <p class="text-xl text-gray-500 dark:text-gray-400 mb-2 font-medium">Drag & Drop document</p>
                <p class="text-gray-400 dark:text-gray-500 mb-4">or click to browse</p>
                <p class="text-sm text-gray-400 dark:text-gray-500">Supports PDF, PNG, JPG files</p>
            `;
        }
        updateVerifyButtonState();
    };

    const updateUploadPageUI = () => {
        updateFileDisplay();
        viewResultBtn.classList.toggle('hidden', !lastResult);
    };

    const updateVerifyButtonState = () => {
        const hasFile = file !== null;
        verifyBtn.disabled = loading || !hasFile;

        if (!hasFile || loading) {
            verifyBtn.className = 'flex-1 py-4 rounded-xl text-white font-semibold transition-all duration-300 bg-gray-400 cursor-not-allowed';
            verifyBtnText.textContent = hasFile ? 'Processing...' : 'Select a file to verify';
        } else {
            verifyBtn.className = 'flex-1 py-4 rounded-xl text-white font-semibold transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 btn-hover-lift ripple animate-glow';
            verifyBtnText.textContent = 'Verify Document';
        }
    };

    const handleFileSelect = (selectedFile) => {
        if (selectedFile) {
            file = selectedFile;
            updateFileDisplay();
            // Add success animation
            dropZone.classList.add('animate-bounce-in');
            setTimeout(() => dropZone.classList.remove('animate-bounce-in'), 1000);
        }
    };

    const renderResults = (data) => {
        lastResult = data;

        // Cache indicator animation
        cacheIndicator.classList.toggle('hidden', !data.retrieved_from_cache);
        if (!cacheIndicator.classList.contains('hidden')) {
            cacheIndicator.classList.add('animate-fade-in');
        }

        // QR Code section
        if (data.qr_code_data) {
            qrCodeSection.classList.remove('hidden');
            qrCodeSection.classList.add('animate-fade-in-up', 'animate-delay-200');
            qrCodeResult.textContent = data.qr_code_data;
        } else {
            qrCodeSection.classList.add('hidden');
        }

        // Status with animation
        const status = data.verification_status;
        resultStatusText.textContent = status;
        resultStatusText.className = status.includes('Verified') 
            ? 'text-3xl font-bold text-green-600 dark:text-green-400 status-badge animate-bounce-in' 
            : 'text-3xl font-bold text-red-600 dark:text-red-400 status-badge animate-shake';

        // Tamper score with progress animation
        const score = data.tamper_analysis.tamper_score;
        resultTamperScore.textContent = `${score} / 100`;
        resultAnalysisSummary.textContent = data.tamper_analysis.analysis_summary;

        // Animate progress bar
        const progressBar = document.querySelector('.progress-animated');
        if (progressBar) {
            progressBar.style.width = `${100 - score}%`;
            progressBar.classList.add('progress-animated');
        }

        // Color code tamper score
        if (score > 50) {
            resultTamperScore.className = 'font-bold text-2xl text-red-600 dark:text-red-400 animate-pulse';
        } else if (score > 20) {
            resultTamperScore.className = 'font-bold text-2xl text-yellow-600 dark:text-yellow-400';
        } else {
            resultTamperScore.className = 'font-bold text-2xl text-green-600 dark:text-green-400';
        }

        // Render details with staggered animation
        const details = data.extracted_details;
        dynamicDetailsContainer.innerHTML = '';

        if (details && Object.keys(details).length > 0) {
            const detailElements = [];
            for (const key in details) {
                const value = details[key];
                const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                const detailElement = document.createElement('div');
                const spanClass = String(value).length > 40 ? 'md:col-span-2' : '';
                detailElement.className = `${spanClass} bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border dark:border-gray-600 card-hover opacity-0`;
                detailElement.innerHTML = `
                    <dt class="font-semibold text-gray-800 dark:text-gray-200 mb-2">${formattedKey}</dt>
                    <dd class="text-gray-600 dark:text-gray-300 font-mono text-sm break-words">${value}</dd>
                `;
                dynamicDetailsContainer.appendChild(detailElement);
                detailElements.push(detailElement);
            }

            // Staggered animation for detail elements
            setTimeout(() => {
                staggerAnimation(detailElements, 'animate-fade-in-up', 100);
            }, 500);
        } else {
            dynamicDetailsContainer.innerHTML = `
                <div class="md:col-span-2 text-center py-8 text-gray-500 dark:text-gray-400 animate-fade-in">
                    <svg class="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    No structured details could be extracted.
                </div>
            `;
        }

        // Update history
        if (!verificationHistory.some(item => item.file_hash === data.file_hash)) {
            verificationHistory.unshift(data);
        }
    };

    const renderHistory = () => {
        const searchTerm = historySearch.value.toLowerCase();
        const filterStatus = historyFilter.value;

        const filteredHistory = verificationHistory.filter(item => {
            const details = item.extracted_details;
            const matchesSearch = !searchTerm || 
                (details.name && details.name.toLowerCase().includes(searchTerm)) ||
                (details.document_number && details.document_number.toLowerCase().includes(searchTerm)) ||
                (details.roll_no && details.roll_no.toLowerCase().includes(searchTerm));

            const matchesFilter = filterStatus === 'all' || item.verification_status === filterStatus;
            return matchesSearch && matchesFilter;
        });

        historyList.innerHTML = '';

        if (filteredHistory.length === 0) {
            noHistoryMsg.classList.remove('hidden');
        } else {
            noHistoryMsg.classList.add('hidden');

            filteredHistory.forEach((item, index) => {
                const li = document.createElement('div');
                li.className = 'bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700 shadow-lg card-hover timeline-item opacity-0';

                const details = item.extracted_details;
                const status = item.verification_status;
                let statusClass = status.includes('Verified') 
                    ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200' 
                    : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200';

                li.innerHTML = `
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-white">${details.name || 'Unknown Document'}</h3>
                        <span class="px-3 py-1 rounded-full text-xs font-medium ${statusClass} status-badge">${status}</span>
                    </div>
                    <div class="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span class="text-gray-500 dark:text-gray-400">Document No:</span>
                            <span class="text-gray-800 dark:text-white font-mono ml-2">${details.document_number || details.roll_no || 'N/A'}</span>
                        </div>
                        <div>
                            <span class="text-gray-500 dark:text-gray-400">Verified:</span>
                            <span class="text-gray-800 dark:text-white ml-2">${new Date(item.processing_timestamp).toLocaleString()}</span>
                        </div>
                        <div>
                            <span class="text-gray-500 dark:text-gray-400">Tamper Score:</span>
                            <span class="text-gray-800 dark:text-white font-bold ml-2">${item.tamper_analysis.tamper_score}/100</span>
                        </div>
                        <div class="md:col-span-1">
                            <button class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors interactive">
                                View Details
                            </button>
                        </div>
                    </div>
                `;

                historyList.appendChild(li);

                // Animate with delay
                setTimeout(() => {
                    li.classList.add('animate-fade-in-up');
                }, index * 100);
            });
        }
    };

    // --- THEME HANDLING ---
    const toggleTheme = () => {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        // Update theme toggle text
        const themeIcon = document.getElementById('theme-icon');
        const themeText = document.getElementById('theme-text');
        if (themeIcon && themeText) {
            if (isDark) {
                themeIcon.textContent = '☀️';
                themeText.textContent = 'Light Mode';
            } else {
                themeIcon.textContent = '🌙';
                themeText.textContent = 'Dark Mode';
            }
        }
    };

    // Initialize theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        const themeIcon = document.getElementById('theme-icon');
        const themeText = document.getElementById('theme-text');
        if (themeIcon && themeText) {
            themeIcon.textContent = '☀️';
            themeText.textContent = 'Light Mode';
        }
    }

    // --- EVENT LISTENERS WITH ENHANCED INTERACTIONS ---

    // Login form
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Navigation buttons
    if (backBtn) {
        backBtn.addEventListener('click', handleBack);
    }

    if (uploadCertBtn) {
        uploadCertBtn.addEventListener('click', () => navigateTo('upload'));
    }

    // Menu interactions
    if (menuBtn) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            menuDropdown.classList.toggle('hidden');
            if (!menuDropdown.classList.contains('hidden')) {
                menuDropdown.classList.add('animate-slide-up');
            }
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', () => {
        if (!menuDropdown.classList.contains('hidden')) {
            menuDropdown.classList.add('hidden');
        }
    });

    if (menuDropdown) {
        menuDropdown.addEventListener('click', (e) => e.stopPropagation());
    }

    // Menu items
    if (menuThemeToggle) {
        menuThemeToggle.addEventListener('click', toggleTheme);
    }

    if (menuHistoryBtn) {
        menuHistoryBtn.addEventListener('click', () => {
            navigateTo('history');
            menuDropdown.classList.add('hidden');
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    if (menuDashboardLink) {
        menuDashboardLink.addEventListener('click', () => {
            const page = menuDashboardLink.dataset.page;
            if (page) {
                navigateTo(page);
                menuDropdown.classList.add('hidden');
            }
        });
    }

    // File upload interactions
    if (dropZone) {
        dropZone.addEventListener('click', () => fileInput.click());

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('bg-blue-100', 'dark:bg-blue-900/30', 'border-blue-400');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('bg-blue-100', 'dark:bg-blue-900/30', 'border-blue-400');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('bg-blue-100', 'dark:bg-blue-900/30', 'border-blue-400');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelect(files[0]);
            }
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
            }
        });
    }

    // Action buttons with ripple effects
    const addRippleToButtons = () => {
        const buttons = document.querySelectorAll('.ripple');
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                addRippleEffect(this, e);
            });
        });
    };

    if (verifyBtn) {
        verifyBtn.addEventListener('click', handleVerification);
    }

    if (viewResultBtn) {
        viewResultBtn.addEventListener('click', () => navigateTo('results'));
    }

    if (verifyAnotherBtn) {
        verifyAnotherBtn.addEventListener('click', () => {
            file = null;
            navigateTo('upload');
        });
    }

    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', () => {
            // PDF download logic would go here
            alert('PDF download functionality would be implemented here');
        });
    }

    // History page interactions
    if (historySearch) {
        historySearch.addEventListener('input', renderHistory);
    }

    if (historyFilter) {
        historyFilter.addEventListener('change', renderHistory);
    }

    // Modal interactions
    if (closeErrorModal) {
        closeErrorModal.addEventListener('click', hideErrorModal);
    }

    if (errorModal) {
        errorModal.addEventListener('click', (e) => {
            if (e.target === errorModal) hideErrorModal();
        });
    }

    // Contact modal
    if (contactFab) {
        contactFab.addEventListener('click', () => {
            contactModal.classList.remove('hidden');
        });
    }

    if (closeContactModal) {
        closeContactModal.addEventListener('click', () => {
            contactModal.classList.add('hidden');
        });
    }

    if (contactModal) {
        contactModal.addEventListener('click', (e) => {
            if (e.target === contactModal) {
                contactModal.classList.add('hidden');
            }
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Simulate sending message
            contactForm.style.display = 'none';
            contactSuccessMsg.classList.remove('hidden');
            contactSuccessMsg.classList.add('animate-bounce-in');

            setTimeout(() => {
                contactModal.classList.add('hidden');
                contactForm.style.display = 'block';
                contactSuccessMsg.classList.add('hidden');
                contactTextarea.value = '';
            }, 2000);
        });
    }

    // Enhanced keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close any open modals or menus
            if (!errorModal.classList.contains('hidden')) {
                hideErrorModal();
            }
            if (!contactModal.classList.contains('hidden')) {
                contactModal.classList.add('hidden');
            }
            if (!menuDropdown.classList.contains('hidden')) {
                menuDropdown.classList.add('hidden');
            }
        }
    });

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Initialize ripple effects
    setTimeout(addRippleToButtons, 100);

    // Initialize the application
    checkExistingToken();

    // Add window resize listener for responsive animations
    window.addEventListener('resize', () => {
        // Re-initialize animations if needed
        addRippleToButtons();
    });

    // Performance optimization: Preload next page animations
    const preloadAnimations = () => {
        const style = document.createElement('style');
        style.textContent = `
            .will-animate {
                will-change: transform, opacity;
            }
        `;
        document.head.appendChild(style);
    };

    setTimeout(preloadAnimations, 1000);
});