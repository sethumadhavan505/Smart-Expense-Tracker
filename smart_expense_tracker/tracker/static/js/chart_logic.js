/**
 * Smart Expense Tracker - Chart Logic
 * Handles the rendering of expense distribution charts with fixed color mapping.
 */

// Function to get fixed color based on Category Name
function getCategoryColor(category) {
    const colors = {
        'Food': '#1cc88a',         // Success Green
        'Travel': '#4e73df',       // Primary Blue
        'Bills': '#36b9cc',        // Info Cyan
        'Shopping': '#f6c23e',     // Warning Yellow
        'Entertainment': '#6f42c1',// Purple
        'Others': '#e74a3b'        // Neutral Gray for Others
    };
    // Default to a distinct red if a new category is added that isn't in the list
    return colors[category] || '#858796'; 
}

function renderExpenseChart(labels, values) {
    const canvas = document.getElementById('expenseChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Map each label to its fixed color to ensure consistency
    const backgroundColors = labels.map(label => getCategoryColor(label));

    // Destroy existing chart instance to prevent hover/render bugs
    if (window.myExpenseChart) {
        window.myExpenseChart.destroy();
    }

    window.myExpenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Expenses by Category',
                data: values,
                backgroundColor: backgroundColors,
                hoverBorderColor: "rgba(234, 236, 244, 1)",
                borderWidth: 2
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: { family: "'Inter', sans-serif", size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: "rgb(255,255,255)",
                    bodyColor: "#858796",
                    titleColor: '#6e707e',
                    borderColor: '#dddfeb',
                    borderWidth: 1,
                    displayColors: true,
                    callbacks: {
                        label: function(tooltipItem) {
                            return ` ${tooltipItem.label}: ₹${tooltipItem.raw}`;
                        }
                    }
                }
            },
            cutout: '70%', 
        }
    });
}

// Monthly Trend Chart logic
function renderTrendChart(labels, values) {
    const canvas = document.getElementById('trendChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (window.myTrendChart) {
        window.myTrendChart.destroy();
    }

    window.myTrendChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Monthly Spending',
                data: values,
                backgroundColor: '#4e73df',
                hoverBackgroundColor: '#2e59d9',
                borderRadius: 5
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) { return '₹' + value; }
                    }
                }
            },
            plugins: {
                legend: { display: false } // Hide legend for single dataset bars
            }
        }
    });
}