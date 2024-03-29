"use strict";


const account1 = {
    owner: "Jonas Schmedtmann",
    movements: [200, 450, -400, 3000, -130, 70, 1300],
    interestRate: 1.2,
    pin: 1111,

    movementsDates: [
        '2019-11-18T21:31:17.178Z',
        '2019-12-23T07:42:02.383Z',
        '2020-01-28T09:15:04.904Z',
        '2020-04-01T10:17:24.185Z',
        '2020-05-08T14:11:59.604Z',
        '2020-05-27T17:01:17.194Z',
        '2020-07-11T23:36:17.929Z',
    ],
    currency: 'EUR',
    locale: 'pt-PT', // de-DE
};

const account2 = {
    owner: "Jessica Devis",
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500],
    interestRate: 1.5,
    pin: 2222,

    movementsDates: [
        '2019-11-01T13:15:33.035Z',
        '2019-11-30T09:48:16.867Z',
        '2019-12-25T06:04:23.907Z',
        '2020-01-25T14:18:46.235Z',
        '2020-02-05T16:33:06.386Z',
        '2020-04-10T14:43:26.374Z',
        '2020-06-25T18:49:59.371Z',
    ],
    currency: 'USD',
    locale: 'en-US',    
};

// const account3 = {
//     owner: "Steven Thomas Williams",
//     movements: [200, -200, 340, -300, -20, 50, 400],
//     interestRate: 0.7,
//     pin: 3333,
// };

// const account4 = {
//     owner: "Sarah Smith",
//     movements: [430, 1000, 700, 50, 90],
//     interestRate: 1,
//     pin: 4444,
// };

// const account5 = {
//     owner: "Ibrohim Ahmadjonov",
//     movements: [3000, -100],
//     interestRate: 1,
//     pin: 5555,
// };

// const accounts = [account1, account2, account3, account4, account5]
const accounts = [account1, account2];


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
const displayMovements = function(acc, sort = false) {
    const movementsCopy = acc?.movements?.slice();

    sort && movementsCopy.sort((a, b) => a - b);

    // Clearing trash not original transfers of money
    containerMovements.innerHTML = "";

    movementsCopy.forEach((item, ind) => {
        const type = (item < 0 ? "withdrawal" : "deposit");
        const newInd = ind + 1;

        const now = new Date();
        const date = new Date(acc.movementsDates[ind]);
        let displayDate = new Intl.DateTimeFormat('en-US').format(date);
        
        const diff = Math.round(Math.abs(now - date) / 1000 / 60 / 60 / 24);
        if (!diff) displayDate = "Today";
        else if (diff == 1) displayDate = "Yesterday";
        else if (diff <= 7) displayDate = `${diff} days ago`;

        const formattedMov = new Intl.NumberFormat(acc.locale, {
            style: "currency",
            currency: acc.currency,
        }).format(item.toFixed(2));

        const newChild = `
        <div class="movements__row">
            <div class="movements__type movements__type--${type}">${ newInd + " " + type }</div>
            <div class="movements__date">${displayDate}</div>
            <div class="movements__value"> ${ formattedMov }</div>
            `;        
        containerMovements.insertAdjacentHTML('afterbegin', newChild);
    }); 
};


// Total Balance
const calcDisplayBalance = function(acc) {
    const movements = acc?.movements || [];
    const balance = movements.reduce((accumulator, item) => accumulator + item, 0);
    labelBalance.textContent = `${ new Intl.NumberFormat(acc.locale, {
        style: "currency",
        currency: acc.currency,
    }).format(balance.toFixed(2)) }`;
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
    labelSumIn.textContent = `${ new Intl.NumberFormat(acc.locale, { style: "currency", currency: acc.currency }).format(acc ? incomes.toFixed(2) : 0) }`;

    labelSumOut.textContent = `${ new Intl.NumberFormat(acc.locale, { style: "currency", currency: acc.currency}).format(acc ? (-out).toFixed(2) : 0) }`;
    
    labelSumInterest.textContent = `${ new Intl.NumberFormat(acc.locale, { style: "currency", currency: acc.currency }).format(acc ? interest.toFixed(2) : 0) }`;
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
    displayMovements(acc);
    // Total Balance
    calcDisplayBalance(acc);
    // Balance summary
    calcDisplaySummary(acc);
};


// Timer which remains 5 minutes after it closes account
const startLogOutTimer = function() {
    // Set time to 5 minutes
    let seconds = 300;

    // Callback function for setInterval
    const callback = function() {
        if (seconds) {
            const minutes = Math.trunc(seconds / 60);
            // In each call, print the remaining time to UI
            labelTimer.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
            seconds--;
        } else {
            clearInterval(logOutTimer);
            updateUI();   
        }
    };

    callback();
    // Call the timer every second
    const logOutTimer = setInterval(callback, 1000, seconds);

    return logOutTimer;
}


// login account object and timer object
let account, timer;

// Fake logged in account
account = account1;
updateUI(account);
timer = startLogOutTimer();


btnLogin.addEventListener("click", function(event) {
    event.preventDefault();
    const username = inputLoginUsername.value;
    const pin = +inputLoginPin.value;
    account = accounts.find((acc) => acc.username === username && acc.pin === pin);
    if (account) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getSeconds()).padStart(2, "0");

        // Clearing form after successfull logging in
        inputLoginUsername.value = inputLoginPin.value = "";
        inputLoginUsername.blur();
        inputLoginPin.blur();
        // Updating account
        updateUI(account);

        const options = {
            hour: "numeric",
            minute: "numeric",
            day: "numeric",
            month: "numeric",
            year: "numeric",
            weekday: "long",
        }
 
        labelDate.textContent = `${ new Intl.DateTimeFormat(account.locale, options).format(now) }`; 
        
        if (timer) clearInterval(timer);
        timer = startLogOutTimer();
    }
});


// Transferring money to another account when form submitted(button clicked)
btnTransfer.addEventListener("click", function(e) {
    e.preventDefault();
    const username = inputTransferTo.value;
    const transferAccount = accounts.find(item => item.username === username);
    
    const transferAmount = +inputTransferAmount.value;
    const currentBalance = account.movements.reduce((acc, item) => acc + item, 0);
    
    inputTransferTo.value = inputTransferAmount.value = "";
    inputTransferTo.blur(); inputTransferAmount.blur();
    
    if (transferAccount && transferAccount.username !== account.username && currentBalance >= transferAmount && transferAmount > 0) {
        setTimeout(() => {
            account.movements.push(-transferAmount);
            transferAccount.movements.push(transferAmount);
                    
            const now = new Date().toISOString();
            account.movementsDates.push(now);
            transferAccount.movementsDates.push(now);
    
            if (timer) clearInterval(timer);
            timer = startLogOutTimer();
    
            // Update UI
            updateUI(account);    
        }, 2500);
    }    
});


// Request loan
btnLoan.addEventListener("click", function(e) {
    e.preventDefault();
    const loanAmount = +inputLoanAmount.value;
    inputLoanAmount.value = "";
    inputLoanAmount.blur();

    if (loanAmount > 0 && account.movements.some(mon => mon >= loanAmount * 0.1)) {
        setTimeout(() => {
            account.movements.push(loanAmount);

            const now = new Date().toISOString();
            account.movementsDates.push(now);
    
            if (timer) clearInterval(timer);
            timer = startLogOutTimer();    

            updateUI(account);
        }, 2500);
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
    displayMovements(account, isSorted);
});

