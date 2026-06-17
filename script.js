const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const balanceEl = document.getElementById("balance");
const countEl = document.getElementById("count");
const transactionList = document.getElementById("transactionList");

let transactions =
JSON.parse(localStorage.getItem("transactions")) || [];

let chart;

// Add Transaction Button

document.getElementById("addBtn").addEventListener("click", () => {

    const type = prompt("Enter Type (income/expense)");

    if(!type) return;

    const description = prompt("Description");

    if(!description) return;

    const amount = Number(prompt("Amount"));

    if(!amount) return;

    transactions.push({
        id: Date.now(),
        type,
        description,
        amount
    });

    saveData();

    updateUI();

});

// Save Local Storage

function saveData(){

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

}

// Update UI

function updateUI(){

    let income = 0;
    let expense = 0;

    transactionList.innerHTML = "";

    transactions.forEach(item => {

        if(item.type.toLowerCase() === "income"){
            income += item.amount;
        }
        else{
            expense += item.amount;
        }

        const li = document.createElement("li");

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

            <span class="${
                item.type === "income"
                ? "amount-income"
                : "amount-expense"
            }">

            ${
                item.type === "income"
                ? "+"
                : "-"
            }₹${item.amount}

            </span>
        `;

        transactionList.appendChild(li);

    });

    incomeEl.textContent = `₹${income}`;
    expenseEl.textContent = `₹${expense}`;
    balanceEl.textContent = `₹${income-expense}`;
    countEl.textContent = transactions.length;

    createChart(income, expense);

}

// Chart

function createChart(income, expense){

    const ctx =
    document.getElementById("expenseChart");

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
                ]

            }]

        }

    });

}

updateUI();
