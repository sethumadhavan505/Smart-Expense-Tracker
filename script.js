document.addEventListener('DOMContentLoaded', function() {
    
    // --- Local Storage Initialization ---
    let transactions = JSON.parse(localStorage.getItem('smartTrackerData')) || [];
    let expenseChartInstance = null;

    // --- DOM Elements ---
    const modal = document.getElementById('transactionModal');
    const openBtn = document.getElementById('openModalBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    const form = document.getElementById('transactionForm');
    const transactionListEl = document.querySelector('.transaction-list');
    
    const totalIncomeEl = document.querySelectorAll('.summary-card h3')[0];
    const totalExpenseEl = document.querySelectorAll('.summary-card h3')[1];
    const balanceEl = document.querySelectorAll('.summary-card h3')[2];
    
    // Budget DOM Elements
    const budgetAmountText = document.getElementById('budgetAmountText');
    const budgetProgressFill = document.getElementById('budgetProgressFill');
    const budgetProgressText = document.getElementById('budgetProgressText');

    const txCountEl = document.querySelectorAll('.summary-card h3')[3];
    const chartTotalExpenseEl = document.querySelector('.total-expenses-footer strong');
    
    const darkModeToggle = document.getElementById('darkModeCheckbox');
    const clearDataBtn = document.getElementById('clearDataBtn');

    // NEW DOM Elements for View Switching
    const dashboardView = document.getElementById('dashboardView');
    const transactionsView = document.getElementById('transactionsView');
    const categoriesView = document.getElementById('categoriesView');
    const analyticsView = document.getElementById('analyticsView');
    const settingsView = document.getElementById('settingsView');
    
    const navDashboard = document.getElementById('navDashboard');
    const navTransactions = document.getElementById('navTransactions');
    const navCategories = document.getElementById('navCategories');
    const navAnalytics = document.getElementById('navAnalytics');
    const navSettings = document.getElementById('navSettings');
    
    const viewAllBtn = document.getElementById('viewAllBtn');
    const allTransactionsListEl = document.getElementById('allTransactionsList');
    const categoryBreakdownListEl = document.getElementById('categoryBreakdownList');
    const headerTitle = document.querySelector('.header-titles h2');
    const headerSubtitle = document.querySelector('.header-titles p');

    // Mobile Menu DOM Elements
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    // --- Dark Mode Logic ---
    if (localStorage.getItem('smartTrackerTheme') === 'dark') {
        document.body.classList.add('dark-theme');
        if(darkModeToggle) darkModeToggle.checked = true;
    }

    if(darkModeToggle) {
        darkModeToggle.addEventListener('change', () => {
            if (darkModeToggle.checked) {
                document.body.classList.add('dark-theme');
                localStorage.setItem('smartTrackerTheme', 'dark');
            } else {
                document.body.classList.remove('dark-theme');
                localStorage.setItem('smartTrackerTheme', 'light');
            }
        });
    }

    // --- View Switching Logic ---
    function switchView(view) {
        // Hide all views
        const allViews = [dashboardView, transactionsView, categoriesView, analyticsView, settingsView];
        allViews.forEach(v => { if(v) v.style.display = 'none'; });

        // Remove active class
        const allNavs = [navDashboard, navTransactions, navCategories, navAnalytics, navSettings];
        allNavs.forEach(n => { if(n) n.classList.remove('active'); });

        if (view === 'dashboard') {
            dashboardView.style.display = 'flex';
            navDashboard.classList.add('active');
            headerTitle.innerText = 'Dashboard';
            headerSubtitle.innerText = 'Overview of your finances';
        } else if (view === 'transactions') {
            transactionsView.style.display = 'flex';
            navTransactions.classList.add('active');
            headerTitle.innerText = 'All Transactions';
            headerSubtitle.innerText = 'Complete history of your income and expenses';
            renderAllTransactions();
        } else if (view === 'categories') {
            categoriesView.style.display = 'flex';
            navCategories.classList.add('active');
            headerTitle.innerText = 'Categories';
            headerSubtitle.innerText = 'See exactly where your money goes';
            renderCategoryView(); 
        } else if (view === 'analytics') {
            analyticsView.style.display = 'flex';
            navAnalytics.classList.add('active');
            headerTitle.innerText = 'Analytics';
            headerSubtitle.innerText = 'Deep dive into your financial habits';
        } else if (view === 'settings') {
            settingsView.style.display = 'flex';
            navSettings.classList.add('active');
            headerTitle.innerText = 'Settings';
            headerSubtitle.innerText = 'Manage your application preferences';
        }
    }

    if(navDashboard) navDashboard.addEventListener('click', (e) => { e.preventDefault(); switchView('dashboard'); });
    if(navTransactions) navTransactions.addEventListener('click', (e) => { e.preventDefault(); switchView('transactions'); });
    if(navCategories) navCategories.addEventListener('click', (e) => { e.preventDefault(); switchView('categories'); });
    if(navAnalytics) navAnalytics.addEventListener('click', (e) => { e.preventDefault(); switchView('analytics'); });
    if(navSettings) navSettings.addEventListener('click', (e) => { e.preventDefault(); switchView('settings'); });
    if(viewAllBtn) viewAllBtn.addEventListener('click', (e) => { e.preventDefault(); switchView('transactions'); });

    // --- Clear Data Logic ---
    if(clearDataBtn) {
        clearDataBtn.addEventListener('click', () => {
            const confirmDelete = confirm("Are you sure you want to clear all data? This cannot be undone.");
            if (confirmDelete) {
                transactions = []; 
                localStorage.removeItem('smartTrackerData'); 
                updateDashboard(); 
                renderCategoryView(); // Refresh the categories page if open
            }
        });
    }

    // --- Initialization ---
    initDashboard();

    // --- Event Listeners ---
    if(openBtn) openBtn.addEventListener('click', () => modal.style.display = 'flex');
    if(closeBtn) closeBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    // --- Mobile Menu Logic ---
    if(menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('open');
            sidebarOverlay.classList.add('show');
        });
    }

    function closeMobileMenu() {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('show');
    }

    if(sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeMobileMenu);
    }

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                closeMobileMenu();
            }
        });
    });

    // Handle Form Submit
    if(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('titleInput').value;
            const amount = parseFloat(document.getElementById('amountInput').value);
            const type = document.getElementById('typeInput').value;
            const category = document.getElementById('categoryInput').value;
            
            const dateOptions = { day: '2-digit', month: 'short', year: 'numeric' };
            const formattedDate = new Date().toLocaleDateString('en-GB', dateOptions);

            const newTx = { id: Date.now(), title, category, amount, type, date: formattedDate };

            transactions.unshift(newTx); 
            
            localStorage.setItem('smartTrackerData', JSON.stringify(transactions));

            updateDashboard();
            renderCategoryView(); // Update progress bars if category page is open
            form.reset();
            modal.style.display = 'none';
        });
    }

    // --- Core Functions ---
    function initDashboard() {
        renderChart();
        updateDashboard();
    }

    function updateDashboard() {
        calculateSummaries();
        renderTransactionList();
        renderAllTransactions(); 
        updateChartData();
    }

    function calculateSummaries() {
        let income = 0; let expense = 0;

        transactions.forEach(tx => {
            if (tx.type === 'income') income += tx.amount;
            if (tx.type === 'expense') expense += tx.amount;
        });

        const balance = income - expense;

        totalIncomeEl.innerText = `₹${income.toLocaleString('en-IN')}`;
        totalExpenseEl.innerText = `₹${expense.toLocaleString('en-IN')}`;
        balanceEl.innerText = `₹${balance.toLocaleString('en-IN')}`;
        txCountEl.innerText = transactions.length;
        chartTotalExpenseEl.innerText = `₹${expense.toLocaleString('en-IN')}`;

        const monthlyBudget = 30000; 
        let spentPercentage = (expense / monthlyBudget) * 100;
        
        if (spentPercentage > 100) spentPercentage = 100;
        
        if(budgetAmountText) {
            budgetAmountText.innerText = `₹${expense.toLocaleString('en-IN')} / ₹${monthlyBudget.toLocaleString('en-IN')}`;
        }
        if(budgetProgressFill) {
            budgetProgressFill.style.width = `${Math.round(spentPercentage)}%`;
        }
        if(budgetProgressText) {
            budgetProgressText.innerText = `${Math.round(spentPercentage)}%`;
        }
    }

    function renderTransactionList() {
        if(!transactionListEl) return;
        transactionListEl.innerHTML = ''; 
        const recentTx = transactions.slice(0, 5); 

        recentTx.forEach(tx => {
            const isIncome = tx.type === 'income';
            const sign = isIncome ? '+' : '-';
            const colorClass = isIncome ? 'text-green' : 'text-red';
            
            let iconClass = 'fa-solid fa-receipt'; let bgClass = 'bg-yellow-light'; let iconColor = 'text-yellow';

            if(tx.category === 'Food') { iconClass = 'fa-solid fa-utensils'; bgClass = 'bg-green-light'; iconColor = 'text-green'; }
            if(tx.category === 'Transport') { iconClass = 'fa-solid fa-bus'; bgClass = 'bg-blue-light'; iconColor = 'text-blue'; }
            if(tx.category === 'Income') { iconClass = 'fa-solid fa-briefcase'; bgClass = 'bg-green-light'; iconColor = 'text-green'; }
            if(tx.category === 'Shopping') { iconClass = 'fa-solid fa-bag-shopping'; bgClass = 'bg-yellow-light'; iconColor = 'text-yellow'; }
            if(tx.category === 'Entertainment') { iconClass = 'fa-solid fa-film'; bgClass = 'bg-red-light'; iconColor = 'text-red'; }

            const txHTML = `
                <div class="transaction-item">
                    <div class="t-left">
                        <div class="t-icon ${bgClass}"><i class="${iconClass} ${iconColor}"></i></div>
                        <div>
                            <h4>${tx.title}</h4>
                            <p>${tx.category}</p>
                        </div>
                    </div>
                    <div class="t-right ${colorClass}">
                        <h4>${sign} ₹${tx.amount.toLocaleString('en-IN')}</h4>
                        <p>${tx.date}</p>
                    </div>
                </div>
            `;
            transactionListEl.insertAdjacentHTML('beforeend', txHTML);
        });
    }

    function renderAllTransactions() {
        if(!allTransactionsListEl) return;
        allTransactionsListEl.innerHTML = ''; 

        if(transactions.length === 0) {
            allTransactionsListEl.innerHTML = '<p style="text-align:center; padding:20px; color:#64748b;">No transactions recorded yet.</p>';
            return;
        }

        transactions.forEach(tx => {
            const isIncome = tx.type === 'income';
            const sign = isIncome ? '+' : '-';
            const colorClass = isIncome ? 'text-green' : 'text-red';
            
            let iconClass = 'fa-solid fa-receipt'; let bgClass = 'bg-yellow-light'; let iconColor = 'text-yellow';

            if(tx.category === 'Food') { iconClass = 'fa-solid fa-utensils'; bgClass = 'bg-green-light'; iconColor = 'text-green'; }
            if(tx.category === 'Transport') { iconClass = 'fa-solid fa-bus'; bgClass = 'bg-blue-light'; iconColor = 'text-blue'; }
            if(tx.category === 'Income') { iconClass = 'fa-solid fa-briefcase'; bgClass = 'bg-green-light'; iconColor = 'text-green'; }
            if(tx.category === 'Shopping') { iconClass = 'fa-solid fa-bag-shopping'; bgClass = 'bg-yellow-light'; iconColor = 'text-yellow'; }
            if(tx.category === 'Entertainment') { iconClass = 'fa-solid fa-film'; bgClass = 'bg-red-light'; iconColor = 'text-red'; }

            const txHTML = `
                <div class="transaction-item">
                    <div class="t-left">
                        <div class="t-icon ${bgClass}"><i class="${iconClass} ${iconColor}"></i></div>
                        <div>
                            <h4>${tx.title}</h4>
                            <p>${tx.category}</p>
                        </div>
                    </div>
                    <div class="t-right ${colorClass}">
                        <h4>${sign} ₹${tx.amount.toLocaleString('en-IN')}</h4>
                        <p>${tx.date}</p>
                    </div>
                </div>
            `;
            allTransactionsListEl.insertAdjacentHTML('beforeend', txHTML);
        });
    }

    // --- NEW: Render Categories Progress Bars ---
    function renderCategoryView() {
        if(!categoryBreakdownListEl) return;
        categoryBreakdownListEl.innerHTML = '';

        const totals = getCategoryTotals();
        let totalExpense = 0;
        
        // Find out total expenses
        Object.values(totals).forEach(val => totalExpense += val);

        if(totalExpense === 0) {
            categoryBreakdownListEl.innerHTML = '<p style="text-align:center; color:var(--text-muted);">No expenses to show yet.</p>';
            return;
        }

        // Loop through each category and build a progress bar
        for (const [category, amount] of Object.entries(totals)) {
            if(amount > 0) {
                const percent = Math.round((amount / totalExpense) * 100);
                
                // Assign a color based on category
                let barColor = '#a855f7'; // default purple
                if(category === 'Food') barColor = '#22c55e';
                if(category === 'Transport') barColor = '#3b82f6';
                if(category === 'Shopping') barColor = '#eab308';
                if(category === 'Entertainment') barColor = '#ef4444';

                const html = `
                    <div style="margin-bottom: 24px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                            <strong style="color: var(--text-main);">${category}</strong>
                            <span style="color: var(--text-muted); font-weight: 500;">₹${amount.toLocaleString('en-IN')} (${percent}%)</span>
                        </div>
                        <div style="background:#e2e8f0; border-radius:10px; height:12px; width:100%; overflow: hidden;">
                            <div style="background:${barColor}; height:100%; width:${percent}%; transition: width 0.5s ease;"></div>
                        </div>
                    </div>
                `;
                categoryBreakdownListEl.insertAdjacentHTML('beforeend', html);
            }
        }
    }

    function getCategoryTotals() {
        let totals = { Food: 0, Transport: 0, Shopping: 0, Entertainment: 0, Others: 0 };
        transactions.forEach(tx => {
            if(tx.type === 'expense') {
                if(totals[tx.category] !== undefined) {
                    totals[tx.category] += tx.amount;
                } else {
                    totals.Others += tx.amount;
                }
            }
        });
        return totals;
    }

    function renderChart() {
        const ctx = document.getElementById('expenseChart').getContext('2d');
        const config = {
            type: 'doughnut',
            data: getChartData(),
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%', 
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { usePointStyle: true, padding: 25, font: { family: "'Inter', sans-serif", size: 14, weight: '500' } }
                    }
                }
            }
        };
        expenseChartInstance = new Chart(ctx, config);
    }

    function updateChartData() {
        if(expenseChartInstance) {
            expenseChartInstance.data = getChartData();
            expenseChartInstance.update();
        }
    }

    function getChartData() {
        const totals = getCategoryTotals();
        return {
            labels: Object.keys(totals),
            datasets: [{
                data: Object.values(totals),
                backgroundColor: ['#22c55e', '#3b82f6', '#eab308', '#ef4444', '#a855f7'],
                borderWidth: 0
            }]
        };
    }
});
