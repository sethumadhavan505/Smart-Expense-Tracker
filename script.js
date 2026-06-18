document.addEventListener('DOMContentLoaded', function() {
    
    // --- State: Starting Data (Matches your mockup) ---
    let transactions = [
        { id: 1, title: 'Lunch', category: 'Food', amount: 250, type: 'expense', date: '24 May, 2024' },
        { id: 2, title: 'Bus Ticket', category: 'Transport', amount: 80, type: 'expense', date: '24 May, 2024' },
        { id: 3, title: 'Salary', category: 'Income', amount: 45000, type: 'income', date: '01 May, 2024' },
        { id: 4, title: 'Shopping', category: 'Shopping', amount: 1250, type: 'expense', date: '22 May, 2024' }
    ];

    let categoryTotals = { Food: 6562, Transport: 4688, Shopping: 3750, Entertainment: 2250, Others: 1500 };
    
    // Chart Instance
    let expenseChartInstance = null;

    // --- DOM Elements ---
    const modal = document.getElementById('transactionModal');
    const openBtn = document.getElementById('openModalBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    const form = document.getElementById('transactionForm');
    const transactionListEl = document.querySelector('.transaction-list');
    
    // Summary DOM Elements
    const totalIncomeEl = document.querySelectorAll('.summary-card h3')[0];
    const totalExpenseEl = document.querySelectorAll('.summary-card h3')[1];
    const balanceEl = document.querySelectorAll('.summary-card h3')[2];
    const txCountEl = document.querySelectorAll('.summary-card h3')[3];
    const chartTotalExpenseEl = document.querySelector('.total-expenses-footer strong');

    // --- Initialization ---
    initDashboard();

    // --- Event Listeners ---
    openBtn.addEventListener('click', () => modal.style.display = 'flex');
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    
    // Close modal if clicked outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // Handle Form Submit
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get input values
        const title = document.getElementById('titleInput').value;
        const amount = parseFloat(document.getElementById('amountInput').value);
        const type = document.getElementById('typeInput').value;
        const category = document.getElementById('categoryInput').value;
        
        // Get today's date formatted
        const dateOptions = { day: '2-digit', month: 'short', year: 'numeric' };
        const formattedDate = new Date().toLocaleDateString('en-GB', dateOptions);

        // Create new transaction object
        const newTx = {
            id: Date.now(), // unique ID
            title: title,
            category: category,
            amount: amount,
            type: type,
            date: formattedDate
        };

        // Update State
        transactions.unshift(newTx); // Add to beginning of array
        
        if(type === 'expense') {
            // Add to existing category total, or create it if missing
            categoryTotals[category] = (categoryTotals[category] || 0) + amount;
        }

        // Re-render UI
        updateDashboard();
        
        // Reset form and close modal
        form.reset();
        modal.style.display = 'none';
    });


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
        let income = 0;
        let expense = 0;

        transactions.forEach(tx => {
            if (tx.type === 'income') income += tx.amount;
            if (tx.type === 'expense') expense += tx.amount;
        });

        const balance = income - expense;

        // Update DOM (formatting as Indian Rupees)
        totalIncomeEl.innerText = `₹${income.toLocaleString('en-IN')}`;
        totalExpenseEl.innerText = `₹${expense.toLocaleString('en-IN')}`;
        balanceEl.innerText = `₹${balance.toLocaleString('en-IN')}`;
        txCountEl.innerText = transactions.length;
        chartTotalExpenseEl.innerText = `₹${expense.toLocaleString('en-IN')}`;
    }

    function renderTransactionList() {
        transactionListEl.innerHTML = ''; // Clear current list

        // Only show latest 5 to keep dashboard clean
        const recentTx = transactions.slice(0, 5); 

        recentTx.forEach(tx => {
            // Determine styles based on type
            const isIncome = tx.type === 'income';
            const sign = isIncome ? '+' : '-';
            const colorClass = isIncome ? 'text-green' : 'text-red';
            
            // Map categories to FontAwesome icons
            let iconClass = 'fa-solid fa-receipt'; // Default
            let bgClass = 'bg-yellow-light';
            let iconColor = 'text-yellow';

            if(tx.category === 'Food') { iconClass = 'fa-solid fa-utensils'; bgClass = 'bg-green-light'; iconColor = 'text-green'; }
            if(tx.category === 'Transport') { iconClass = 'fa-solid fa-bus'; bgClass = 'bg-blue-light'; iconColor = 'text-blue'; }
            if(tx.category === 'Income') { iconClass = 'fa-solid fa-briefcase'; bgClass = 'bg-green-light'; iconColor = 'text-green'; }
            if(tx.category === 'Shopping') { iconClass = 'fa-solid fa-bag-shopping'; bgClass = 'bg-yellow-light'; iconColor = 'text-yellow'; }

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

    function renderChart() {
        const ctx = document.getElementById('expenseChart').getContext('2d');
        
        const config = {
            type: 'doughnut',
            data: getChartData(),
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { usePointStyle: true, padding: 20, font: { family: "'Inter', sans-serif", size: 13 } }
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
        // Extract data dynamically from categoryTotals object
        return {
            labels: Object.keys(categoryTotals),
            datasets: [{
                data: Object.values(categoryTotals),
                backgroundColor: [
                    '#22c55e', // Green (Food)
                    '#3b82f6', // Blue (Transport)
                    '#eab308', // Yellow (Shopping)
                    '#ef4444', // Red (Entertainment)
                    '#a855f7', // Purple (Others)
                    '#fb923c'  // Orange (Fallback)
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        };
    }
});
