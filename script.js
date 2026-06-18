document.addEventListener('DOMContentLoaded', function() {
    
    // --- Local Storage Initialization ---
    const defaultData = [
        { id: 1, title: 'Lunch', category: 'Food', amount: 250, type: 'expense', date: '24 May, 2024' },
        { id: 2, title: 'Bus Ticket', category: 'Transport', amount: 80, type: 'expense', date: '24 May, 2024' },
        { id: 3, title: 'Salary', category: 'Income', amount: 45000, type: 'income', date: '01 May, 2024' },
        { id: 4, title: 'Shopping', category: 'Shopping', amount: 1250, type: 'expense', date: '22 May, 2024' }
    ];

    // Load from LocalStorage or use default
    let transactions = JSON.parse(localStorage.getItem('smartTrackerData')) || defaultData;
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
    const txCountEl = document.querySelectorAll('.summary-card h3')[3];
    const chartTotalExpenseEl = document.querySelector('.total-expenses-footer strong');

    // --- Initialization ---
    initDashboard();

    // --- Event Listeners ---
    if(openBtn) openBtn.addEventListener('click', () => modal.style.display = 'flex');
    if(closeBtn) closeBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

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

            transactions.unshift(newTx); // Add to top
            
            // Save to Local Storage
            localStorage.setItem('smartTrackerData', JSON.stringify(transactions));

            updateDashboard();
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
    }

    function renderTransactionList() {
        transactionListEl.innerHTML = ''; 
        const recentTx = transactions.slice(0, 5); // Show top 5

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
