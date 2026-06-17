const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const balanceEl = document.getElementById("balance");
const countEl = document.getElementById("count");
const transactionList = document.getElementById("transactionList");

const expenseTotalEl =
document.getElementById("expenseTotal");

const budgetSpentEl =
document.getElementById("budgetSpent");

const percentageEl =
document.getElementById("percentage");

const progressBar =
document.getElementById("progressBar");

const modal =
document.getElementById("transactionModal");

const addBtn =
document.getElementById("addBtn");

const closeModal =
document.getElementById("closeModal");

const transactionForm =
document.getElementById("transactionForm");

let transactions =
JSON.parse(
localStorage.getItem("transactions")
) || [];

let chart;

// Open Modal

addBtn.addEventListener("click", () => {

    modal.style.display = "flex";

});

// Close Modal

closeModal.addEventListener("click", () => {

    modal.style.display = "none";

});

// Close when clicked outside

window.addEventListener("click", (e) => {

    if(e.target === modal){

        modal.style.display = "none";

    }

});

// Add Transaction

transactionForm.addEventListener(
"submit",
function(e){

    e.preventDefault();

    const type =
    document.getElementById("type").value;

    const description =
    document.getElementById("description").value;

    const amount =
    Number(
        document.getElementById("amount").value
    );

    if(
        description === "" ||
        amount <= 0
    ){
        alert("Please enter valid data");
        return;
    }

    const transaction = {

        id: Date.now(),

        type,

        description,

        amount

    };

    transactions.push(transaction);

    saveData();

    updateUI();

    transactionForm.reset();

    modal.style.display = "none";

});

// Save Data

function saveData(){

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

}

// Delete Transaction

function deleteTransaction(id){

    transactions =
    transactions.filter(item =>
        item.id !== id
    );

    saveData();

    updateUI();

}

// Update Dashboard

function updateUI(){

    let income = 0;

    let expense = 0;

    transactionList.innerHTML = "";

    transactions.forEach(item => {

        if(item.type === "income"){

            income += item.amount;

        }else{

            expense += item.amount;

        }

        const li =
        document.createElement("li");

        li.innerHTML = `

            <div class="transaction-info">

                <span class="transaction-name">
                    ${item.description}
                </span>

                <span class="transaction-date">
                    ${new Date(item.id)
                    .toLocaleDateString()}
                </span>

            </div>

            <div>

                <span class="${
                    item.type === "income"
                    ? "amount-income"
                    : "amount-expense"
                }">

                    ${
                        item.type === "income"
                        ? "+"
                        : "-"
                    } ₹${item.amount}

                </span>

                <button
                onclick="deleteTransaction(${item.id})"
                class="delete-btn">

                    ✖

                </button>

            </div>

        `;

        transactionList.appendChild(li);

    });

    const balance =
    income - expense;

    incomeEl.textContent =
    `₹${income}`;

    expenseEl.textContent =
    `₹${expense}`;

    balanceEl.textContent =
    `₹${balance}`;

    countEl.textContent =
    transactions.length;

    expenseTotalEl.textContent =
    `₹${expense}`;

    budgetSpentEl.textContent =
    expense;

    updateBudget(expense);

    createChart(income, expense);

}

// Budget Progress

function updateBudget(expense){

    const budget = 30000;

    const percentage =
    Math.min(
        (expense / budget) * 100,
        100
    );

    progressBar.style.width =
    percentage + "%";

    percentageEl.textContent =
    percentage.toFixed(0) + "%";

}

// Chart

function createChart(
    income,
    expense
){

    const ctx =
    document.getElementById(
        "expenseChart"
    );

    if(chart){

        chart.destroy();

    }

    chart = new Chart(ctx, {

        type: "doughnut",

        data: {

            labels: [

                "Income",

                "Expense"

            ],

            datasets: [{

                data: [

                    income,

                    expense

                ],

                backgroundColor: [

                    "#2ecc71",

                    "#e74c3c"

                ],

                borderWidth: 0

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    position: "bottom"

                }

            }

        }

    });

}

// Initial Load

updateUI();
