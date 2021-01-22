"use strict";

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const wholeLoginEl = document.querySelector(".login");
const btnLogout = document.querySelector(".logout__btn");
const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

// Data
const account1 = {
  owner: "Noel Poo",
  movements: [0],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: "Lim Xin Yi",
  movements: [0],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: "central sperm bank",
  movements: [10000, 10000000, 100000],
  interestRate: 0.7,
  pin: 3333,
};

const accounts = [account1, account2, account3];

const computeUsernames = function (accounts) {
  accounts.forEach(function (account) {
    const names = account.owner.split(" ");
    const usernameArr = names.map(function (el) {
      return el[0].toLowerCase();
    });
    account.username = usernameArr.join("");
  });
};

const init = function () {
  computeUsernames(accounts);
  containerApp.style.opacity = 0;
  btnLogout.classList.add("hidden");
  currentAccount = null;
  labelWelcome.textContent = "Log in to get started";

  accounts.forEach(function (acc) {
    console.log(
      acc.username,
      acc.pin,
      acc.movements.reduce(function (cumm, val) {
        return cumm + val;
      })
    );
  });
};

//initialise app
let currentAccount = null;
init();

const login = function () {
  btnLogout.classList.remove("hidden");
  containerApp.style.opacity = 100;
  // wholeLoginEl.classList.add('hidden');
  labelWelcome.textContent = `Welcome back, ${
    currentAccount.owner.split(" ")[0]
  }!`;
};

const displayMovement = function (account) {
  containerMovements.innerHTML = "";

  account.movements.forEach(function (movement, index) {
    const type = movement > 0 ? "deposit" : "withdrawal";
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      index + 1
    }. ${type}</div>
        <div class="movements__value">${movement}Sperms</div>
      </div>
    `;
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

const calcDisplayBalance = function (account) {
  const balance = account.movements.reduce(function (cumm, ele) {
    return cumm + ele;
  });
  account.balance = balance;
  labelBalance.textContent = `${account.balance}Sperms`;
};

const calcDisplayInflow = function (account) {
  const inflows = account.movements
    .filter(function (movement) {
      return movement > 0;
    })
    .reduce(function (acc, inflow) {
      return acc + inflow;
    });
  labelSumIn.textContent = `${inflows}Sperms`;
};

const calcDisplayOutflow = function (account) {
  const outflows = account.movements.filter(function (mov) {
    return mov < 0;
  });
  let totalOutflow = null;
  if (outflows.length > 0) {
    totalOutflow = outflows.reduce(function (acc, out) {
      return acc + out;
    });
  } else {
    totalOutflow = 0;
  }

  labelSumOut.textContent = `${Math.abs(totalOutflow)}Sperms`;
};

const calcDisplayInterest = function (account) {
  const totalInterest = account.movements
    .filter(function (movement) {
      return movement > 0;
    })
    .reduce(function (acc, mov) {
      return Math.floor((account.interestRate / 100) * mov + acc);
    });
  labelSumInterest.textContent = `${totalInterest}Sperms`;
};

const displaySummary = function (account) {
  calcDisplayInflow(account);
  calcDisplayOutflow(account);
  calcDisplayInterest(account);
};

// Login module;
btnLogin.addEventListener("click", function (e) {
  e.preventDefault(); // form button will refresh page, this prevents the refresh
  validateUserPinLogin();
});

document.addEventListener("keydown", function (e) {
  if (!currentAccount) {
    if (e.key === "enter") {
      validateUserPinLogin();
    }
  }
});

const validatePin = function (pin, account) {
  if (pin) {
    return pin === String(account?.pin);
  } else {
    alert("please input pin!");
  }
};

const getAccountByUsername = function (username) {
  const target = accounts.find(function (account) {
    return account.username === username;
  });
  if (target) {
    return target;
  } else {
    alert("username does not exists");
    return null;
  }
};

const validateUserPinLogin = function () {
  const targetAcc = getAccountByUsername(inputLoginUsername.value);
  if (targetAcc) {
    if (validatePin(inputLoginPin.value, targetAcc)) {
      // change state of currentAccount
      currentAccount = targetAcc;
      // display UI and message
      login();
      console.log(
        "login success: ",
        validatePin(inputLoginPin.value, currentAccount)
      );
      // display balance
      calcDisplayBalance(currentAccount);
      // display all movements
      displayMovement(currentAccount);
      // display summary
      displaySummary(currentAccount);
    } else {
      alert("wrong pin!");
    }
  }
};

// Transfer Module
btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();

  const sender = currentAccount;
  const receiver = getAccountByUsername(inputTransferTo.value);
  const amt = Number(inputTransferAmount.value);

  if (amt && receiver) {
    if (amt > 0) {
      transfer(sender, receiver, amt);
      refreshCurrentAccountDetails();
      // console.log('sender: ', sender.movements);
      // console.log('receiver: ', receiver.movements);
    } else {
      alert("Please set amount to be more than 0");
    }
  } else {
    alert("something went wrong, please try again");
  }
});

const refreshCurrentAccountDetails = function () {
  calcDisplayBalance(currentAccount);
  displayMovement(currentAccount);
  displaySummary(currentAccount);
};

const transfer = function (src, dst, amt) {
  if (checkBalanceBeforeTransfer(src, amt)) {
    src.movements.push(-1 * amt);
    dst.movements.push(amt);
    alert("Transfer success!");
  } else {
    alert(`${src.owner}'s account does not have sufficient sperms`);
  }
};

const checkBalanceBeforeTransfer = function (src, amt) {
  return (
    amt <=
    src.movements.reduce(function (cumm, mov) {
      return cumm + mov;
    })
  );
};

// Deleting an account
btnClose.addEventListener("click", function (e) {
  e.preventDefault();

  const username = inputCloseUsername.value;
  const pin = inputClosePin.value;
  if (
    getAccountByUsername(username) === currentAccount &&
    Number(pin) === currentAccount.pin
  ) {
    const confirmation = prompt(
      `Are you sure you want to close ${
        currentAccount.owner.split(" ")[0]
      }'s account? (y/n)`
    );
    if (confirmation === "y") {
      const accIndexToDlt = accounts.findIndex(function (acc) {
        return acc.owner === currentAccount.owner;
      });
      accounts.splice(accIndexToDlt, 1);
      console.log(accounts);
      alert("Account is Deleted!");
      init();
    } else if (confirmation === "n") {
      return;
    } else {
      alert("huh?");
    }
  } else {
    alert("Please key in your Username and Pin to close your account");
  }
});

// Request loan
btnLoan.addEventListener("click", function (e) {
  e.preventDefault();
  alert(
    "You must have at least 1 credit movement that is more than 10% of loan amount"
  );
  const loanAmt = Number(inputLoanAmount.value);
  if (
    currentAccount.movements.find(function (mov) {
      return mov > 0.1 * loanAmt;
    })
  ) {
    console.log("loan approved");
    alert(`Loan amount of ${loanAmt} is approved`);
    currentAccount.movements.push(loanAmt);
    refreshCurrentAccountDetails();
  } else {
    alert(
      "Request denied: You do not have any credit movement thatis more than 10% of the loan amount"
    );
  }
});
