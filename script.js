"use strict";


const account1 = {
    owner: "Jonas Schmedtmann",
    movements: [200, 450, -400, 3000, -130, 70, 1300],
    interestRate: 1.2,
    pin: 1111,
};

const account2 = {
    owner: "Jessica Devis",
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,
};

const account3 = {
    owner: "Steven Thomas Williams",
    movements: [200, -200, 340, -300, -20, 50, 400],
    interestRate: 0.7,
    pin: 3333,
};

const account4 = {
    owner: "Sarah Smith",
    movements: [430, 1000, 700, 50, 90],
    interestRate: 1,
    pin: 4444,
};

const account5 = {
    owner: "Ibrohim Ahmadjonov",
    movements: [3000, -100],
    interestRate: 1,
    pin: 5555,
};


const accounts = [account1, account2, account3, account4, account5];


// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');
const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// Buiding usernames for each account
const createUserName = function(name) {
    return name.split(" ").map(word => word[0].toLowerCase()).join("");
};
accounts.forEach((acc) => { acc.username = createUserName(acc.owner); });


// Visualizing money transfers
const displayMovements = function(movements = [], sort = false) {
    const movementsCopy = movements?.slice();
    sort && movementsCopy.sort((a, b) => a - b);
    // Clearing trash not original transfers of money
    containerMovements.innerHTML = "";

    movementsCopy.forEach((item, ind) => {
        const type = (item < 0 ? "withdrawal" : "deposit");
        const newInd = ind + 1;
        const newChild = `
        <div class="movements__row">
            <div class="movements__type movements__type--${type}">${ newInd + " " + type }</div>
            <div class="movements__value">${ Math.abs(item) }€</div>
        </div>
        `;        
        containerMovements.insertAdjacentHTML('afterbegin', newChild);
    }); 
};


// Total Balance
const calcDisplayBalance = function(movements = []) {
    const balance = movements.reduce((accumulator, item) => accumulator + item, 0);
    labelBalance.textContent = `${balance}€`;
};


// Balance summary
const calcDisplaySummary = function(acc) {
    let movements = acc?.movements || [];
    let incomes = 0, out = 0, interest = 0;
    movements.forEach((item) => {
        if (item >= 0) {
            incomes += item;
            interest += item * acc.interestRate / 100 >= 1 ? item * acc.interestRate / 100 : 0;
        } else out += item;
    });
    labelSumIn.textContent = `${acc ? incomes : 0}€`;
    labelSumOut.textContent = `${acc ? -out : 0}€`;
    labelSumInterest.textContent = `${acc ? interest : 0}€`;
};

const updateUI = function(acc) {
    // Display UI and message about logging in 
    if (acc === undefined) {
        containerApp.style.opacity = 0;     
        labelWelcome.textContent = "Log in to get started";
    } else {
        containerApp.style.opacity = 100; 
        labelWelcome.textContent = `Welcome, ${account.owner}`;
    }
    // Movements
    displayMovements(acc?.movements);
    // Total Balance
    calcDisplayBalance(acc?.movements);
    // Balance summary
    calcDisplaySummary(acc);
};


// login account object
let account;
btnLogin.addEventListener("click", function(event) {
    event.preventDefault();
    const username = inputLoginUsername.value;
    const pin = +inputLoginPin.value;
    account = accounts.find((acc) => acc.username === username && acc.pin === pin);
    if (account) {
        // Clearing form after successfull logging in
        inputLoginUsername.value = inputLoginPin.value = "";
        inputLoginUsername.blur();
        inputLoginPin.blur();
        // Updating account
        updateUI(account);
    }
});


// Transferring money to another account when form submitted(button clicked)
btnTransfer.addEventListener("click", function(e) {
    e.preventDefault();
    const username = inputTransferTo.value;
    const transferAmount = +inputTransferAmount.value;
    const transferAccount = accounts.find(item => item.username === username);
    
    const currentBalance = +labelBalance.textContent.slice(0, -1);

    inputTransferTo.value = inputTransferAmount.value = "";
    inputTransferTo.blur(); inputTransferAmount.blur();

    if (transferAccount && transferAccount.username !== account.username && currentBalance >= transferAmount && transferAmount > 0) {
        account.movements.push(-transferAmount);
        transferAccount.movements.push(transferAmount);

        // Update UI
        updateUI(account);
    }    
});


// Request loan
btnLoan.addEventListener("click", function(e) {
    e.preventDefault();
    const loanAmount = +inputLoanAmount.value;
    inputLoanAmount.value = "";
    inputLoanAmount.blur();
    if (loanAmount > 0 && account.movements.some(mon => mon >= loanAmount * 0.1)) {
        account.movements.push(loanAmount);
        updateUI(account);
    }
});


// Closing account
btnClose.addEventListener("click", function(e) {
    e.preventDefault();
    let username = inputCloseUsername.value;
    let pin = +inputClosePin.value;
    inputCloseUsername.value = inputClosePin.value = "";
    inputClosePin.blur();
    if (username === account.username && pin === account.pin) {
        let ind = accounts.findIndex(acc => acc.username === account.username && acc.pin === account.pin);
        accounts.splice(ind, 1);
        updateUI();
    }
});


let isSorted = false;
btnSort.addEventListener("click", function(e) {
    e.preventDefault();
    isSorted = !isSorted;
    displayMovements(account?.movements, isSorted);
});




