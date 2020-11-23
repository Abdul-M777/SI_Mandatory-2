const sqlite3 = require("sqlite3").verbose();
const axios = require("axios");
const express = require("express");
const HOSTNAME = "localhost";
const PORT = 8001;
let app = express();
app.use(express.json());

// Connect to the database.
let db = new sqlite3.Database("Bank.sqlite", (err) => {
    if(err) {
        return console.log(err.message);
    }
    console.log("Connected to Database");
});

// Create a Bank User
app.post("/api/bank", (req, res) => {
    let bankUserId = req.body.userId;
    let sql = `INSERT INTO BankUser(UserId, CreatedAt) Values(?,?)`;
    let creationDate = new Date().toISOString();
    db.run(sql, [bankUserId, creationDate], (err) => {
        if (err) {
            res.status(400).json({
                message: "Problem in creating a user!",
                error: err.message
            });
            console.log(err.message);
        }else{
            console.log("A new row has been created");
            res.status(201).json({
                message: "A bank user created"
            });
        }
    });
});

// Read Bank User
app.get("/api/bank", (req, res) => {
    let sql = `SELECT * FROM BankUser`;
    db.all(sql, [], (err, bankUsers) => {
        if (err){
            res.status(400).json({
                message: "Problem!! Can't show bank users",
                error: err
            });
        } else{
            res.status(200).json({
                bankUsers
            });
        }
    });
});

// Read Bank User by ID
app.get("/bank/:id", (req, res) => {
    console.log("req.params.id: ", req.params.id);
    let sql = `SELECT * FROM BankUser WHERE Id = ?`;

    db.all(sql, [req.params.id], (err, bankUser) => {
        if (err){
            res.status(400).json({
                error: err
            });
            console.log(err);
        }else{
            if (bankUser.length){
                res.status(200).json({
                    bankUser
                });
            }else{
                res.status(404).json({
                    message: "No bank user was found with this ID"
                });
            }
        }
    });
});

// Update Bank User
app.put("/api/bank/:id", (req, res) => {
    console.log("req.params.id: ", req.params.id);
    let bankUserId = req.body.userId;
    let sqlGet = `SELECT * FROM BankUser WHERE Id = ?`;
    let sqlUpdate = `UPDATE BankUser SET UserId = ?, ModifiedAt = ? WHERE Id = ?`;
    let modifiedAt = new Date().toISOString();
    db.all(sqlGet, [req.params.id], (err, bankUser) => {
        if (err) {
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if(!bankUser.length) {
                res.status(404).json({
                    message: "No bank user was found with this ID"
                });
            } else {
                db.run(sqlUpdate, [bankUserId, modifiedAt, req.params.id], (err) => {
                    if (err) {
                        res.status(400).json({
                            message: "This bank user could not be updated",
                            error: err.message
                        });
                        console.log(err.message);
                    } else {
                        res.status(201).json({
                            message: "Bank User updated"
                        });
                    }
                });
            }
        }
    });
});

// Delete Bank User
app.delete("/api/bank/:id", (req, res) => {
    console.log("req.param.id: ", req.params.id);
    let sqlGet = `SELECT * FROM BankUser WHERE Id = ?`;
    let sqlDelete = `DELETE FROM BankUser WHERE Id = ?`;
    db.all(sqlGet, [req.params.id], (err, bankUser) => {
        if (err){
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if (!bankUser.length) {
                res.status(404).json({
                    message: "No bank user was found with this ID"
                });
            } else {
                db.run(sqlDelete, req.params.id, (err) => {
                    if (err) {
                        res.status(400).json({
                            message: "This bank user can not be deleted",
                            error: err.message
                        });
                        console.log(err.message);
                    } else {
                        res.status(201).json({
                            message: "Bank User Deleted"
                        });
                    }
                });
            }
        }
    });
});

// Create an Account
app.post("/api/account", (req, res) => {
    let bankUserId = req.body.bankUserId;
    let accountNo = req.body.accountNo;
    let isStudent = req.body.isStudent;
    let amount = req.body.amount;
    let creationDate = new Date().toISOString();
    let sqlGetBankUser = `SELECT * FROM BankUser WHERE Id = ?`;
    let sqlGetAccount = `SELECT * FROM Account WHERE BankUserId = ?`;
    let sqlAccount = `INSERT INTO Account(BankUserId, AccountNo, IsStudent, CreatedAt, Amount) VALUES(?,?,?,?,?)`;

// Check if the bankUserID exist in the BankUser Table
db.all(sqlGetBankUser, [bankUserId], (err, bankUser) => {
    if (err) {
        res.status(400).json({
            error: err
        });
        console.log(err);
    } else {
        if (!bankUser.length) {
            res.status(404).json({
                message: "No Bank User found with this ID"
            });
        } else {
            // Check if the bankUserId already has a user
            db.all(sqlGetAccount, [bankUserId], (err, account) => {
                if (err) {
                    res.status(400).json({
                        error: err
                    });
                    console.log(err);
                } else {
                    if (account.length) {
                        res.status(404).json({
                            message: "This BankUserId already has an account"
                        });
                        // Create an account
                    } else {
                        db.run(sqlAccount, [bankUserId, accountNo, isStudent, creationDate, amount], (err) => {
                            if (err) {
                                res.status(400).json({
                                    message: "Could not create an account",
                                    error: err.message
                                });
                                console.log(err.message);
                            } else {
                                console.log("A new row as been created");
                                res.status(201).json({
                                    message: "An account has been created."
                                });
                            }
                        });
                    }
                }
            });
        }
    }
});
});

// Read Accounts
app.get("/api/account", (req, res) => {
    let sql = "SELECT * FROM Account";
    db.all(sql, [], (err, accounts) => {
        if (err) {
            res.status(400).json({
                message: "Sorry can not show the accounts!!! Please try again later",
                error: err
            });
            console.log(err);
        } else {
            res.status(200).json({
                accounts
            });
        }
    });
});

// Read Account by ID
app.get("/api/account/:id", (req, res) => {
    console.log("req.params.id: ", req.params.id);
    let sql = "SELECT * FROM Account WHERE Id = ?";

    db.all(sql, [req.params.id], (err, account) => {
        if (err) {
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if (account.length) {
                res.status(200).json({
                    account
                });
            } else {
                res.status(404).json({
                    message: "No account was found with this ID"
                });
            }
        }
    });
});

// Update Account
app.put("/api/account/:id", (req, res) => {
    console.log("req.params.id: ", req.params.id);
    let bankUserId = req.body.bankUserId;
    let accountNo = req.body.accountNo;
    let isStudent = req.body.isStudent;
    let amount = req.body.amount;
    let Modified = new Date().toISOString();
    let sqlGet = "SELECT * FROM Account WHERE Id = ?";
    let sqlUpdate = "UPDATE Account SET BankUserId = ?, AccountNo = ?, IsStudent = ?, Modified = ?, Amount = ? WHERE Id = ?";

    // Check if the bankUserId exists  in the BankUser table
    db.all(sqlGet, [req.params.id], (err, account) => {
        if (err) {
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if (!account.length) {
                res.status(404).json({
                    message: "No account was found with this ID"
                });
            } else {
                db.run(sqlUpdate, [bankUserId, accountNo, isStudent, Modified, amount, req.params.id], (err) => {
                    if (err) {
                        res.status(400).json({
                            message: "This account could not updated",
                            error: err.message
                        });
                        console.log(err.message);
                    } else {
                        res.status(201).json({
                            message: "Account updated"
                        });
                    }
                });
            }
        }
    });
});

// Delete Account
app.delete("/api/account/:id", (req, res) => {
    console.log("req.params.id: ", req.params.id);
    let sqlGet = "SELECT * FROM Account WHERE Id = ?";
    let sqlDelete = "DELETE FROM Account WHERE Id = ?";

    db.all(sqlGet, [req.params.id], (err, account) => {
        if (err) {
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if (!account.length) {
                res.status(404).json({
                    message: "No Account was found with this ID"
                });
            } else {
                db.run(sqlDelete, req.params.id, (err) => {
                    if (err) {
                        res.status(400).json({
                            message: "This Account could not be deleted",
                            error: err.message
                        });
                        console.log(err.message);
                    } else {
                        res.status(200).json({
                            message: "Account Deleted"
                        });
                    }
                });
            }
        }
    });
});

// Add Deposit
app.post("/api/add-deposit", (req, res) => {
    let amount = req.body.amount;
    let bankUserId = req.body.bankUserId;
    let createdAt = new Date().toISOString();
    let sqlGetBankUser = "SELECT * FROM BankUser WHERE Id = ?";
    let sqlAddDeposit = "INSERT INTO Deposit(BankUserId, CreatedAt ,Amount) VALUES(?,?,?)";
    let sqlUpdateAccount = "UPDATE Account SET Amount = ? ,Modified = ?  Where BankUserId = ?";
    db.all(sqlGetBankUser, [bankUserId], (err, bankUser) =>{
        if (err) {
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if(!bankUser.length) {
                res.status(404).json({
                    message: "No bank user found with this ID"
                });
            } else {
                if (amount <= 0 || amount === null) {
                    res.status(404).json({
                        message: "The amount has to be a positive number",
                    });
                } else {
                   axios.post("http://localhost:7071/api/Interest_Rate", {depositAmount: amount}).then(response => {
                       let result = response.data;
                       console.log(response.data);
                       let modified = new Date().toISOString();

                       db.run(sqlUpdateAccount, [result, modified, bankUserId], (err) => {
                           if (err) {
                               res.status(400).json({
                                   message: "The account could not be updated",
                                   error: err.message
                               });
                               console.log(err.message);
                           }
                       });
                       db.run(sqlAddDeposit, [bankUserId, createdAt, result], (err) => {
                            if (err) {
                                res.status(400).json({
                                    message: "The deposit could not be created",
                                    error: err.message
                                });
                            } else {
                                res.status(201).json({
                                    message: "Deposit complete!!"
                                });
                            }
                       });
                   });                    
                }
            }
        }
    });
});

// List Deposit
app.get("/api/list-deposit/:bankUserId", (req, res) => {
    console.log("req.params.bankUserId: ", req.params.bankUserId);
    let sql = "SELECT * FROM Deposit WHERE BankUserId = ?";
    db.all(sql, [req.params.bankUserId], (err, deposits) => {
        if (err) {
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if (deposits.length) {
                res.status(200).json({
                    deposits
                });
            } else {
                res.status(404).json({
                    message: "No deposits found for this ID"
                });
            }
        }
    });
});

// Create Loan
app.post("/api/create-loan", (req, res) => {
    let bankUserId = req.body.bankUserId;
    let loanAmount = req.body.loanAmount;
    let createdAt = new Date().toISOString();
    let modified = new Date().toISOString();
    let sqlGetBankUser = `SELECT * FROM BankUser WHERE Id = ?`;
    let sqlLoan = `INSERT INTO Loan(BankUserId, CreatedAt ,Amount) VALUES(?, ?, ?)`;
    let sqlInsert = "UPDATE Account SET Amount = ?, Modified = ? WHERE BankUserId = ?";

    // Check if the bankUserId exists in the BankUser table
    db.all(sqlGetBankUser, [bankUserId], (err, bankUser) => {
        if (err) {
            res.status(400).json({
                error: err
            });
        } else {
            if(!bankUser.length) {
                res.status(404).json({
                    message: `No Bank User found with the id ${bankUserId}!`
                });
            } else {

                // Get the sum of all accounts from a certain User
                axios.get(`http://localhost:8001/api/account`).then(response => {
                    let accounts = response.data.accounts;
                    let amount = 0;
                    
                    console.log("accounts: " + accounts);
                    for (let i = 0; i < accounts.length; i++) {
                        if (bankUserId === accounts[i].BankUserId) {
                            amount = accounts[i].Amount;
                        }
                    }
                    console.log(amount);

                    // Check if the Loan is Valid
                    axios.post(`http://localhost:7071/api/Loan_Algorithm`, {
                        "loan": loanAmount,
                        "totalAccountAmount": amount
                    }).then((response) => {
                        console.log(loanAmount+ amount);
                        let total = loanAmount + amount;
                        db.run(sqlLoan, [bankUserId, createdAt,loanAmount], (err) => {
                            if (err) {
                                res.status(400).json({
                                    message: 'The Loan could not be created!',
                                    error: err.message
                                });
                            } else {
                                res.status(201).json({
                                    message: 'Loan successfully created!',
                                });
                            }
                        });
                        db.run(sqlInsert, [total, modified, bankUserId], (err) => {
                            if (err) {
                                res.status(400).json({
                                    message: "Could not update account",
                                    error: err.message
                                });
                            } else {
                                res.status(201).json({
                                    message: "Account updated"
                                });
                            }
                        });
                        
                    }, (error) => {
                        res.status(403).json({
                            message: 'The Loan could not be created! Loan amount is too big!',
                        });
                    });
                }).catch(err =>{
                    if(err){
                        res.status(400).json({
                            message: 'Could not get the total Account Amount for this User Id!'
                        });
                    }
                });
            }
        }
    });
    
});

// Pay Loan - UPDATE Loan and Account
app.put("/api/pay-loan", (req, res) => {
    let bankUserId = req.body.bankUserId;
    let loanId = req.body.loanId;
    let accountAmount;
    let loanAmount;
    let sqlGetLoan = "SELECT * FROM Loan WHERE Id = ?";
    let sqlGetAccount = "SELECT * FROM Account WHERE BankUserId = ?";
    let sqlUpdateLoan = "UPDATE LOAN SET Amount = ?, ModifiedAt = ? WHERE Id = ?";
    let sqlUpdateAccount = "UPDATE Account SET Amount = ?, Modified = ? WHERE Id = ?";

    db.all(sqlGetAccount, [bankUserId], (err, account) => {
        if (err) {
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if (!account.length) {
                res.status(404).json({
                    message: "No account was found with this ID"
                });
            } else {
                let modified = new Date().toISOString();

                // Get the Loan Amount
                db.all(sqlGetLoan, [loanId], (err, loan) => {
                    if (err) {
                        res.status(400).json({
                            error: err
                        });
                    } else {
                        if (!loan.length) {
                            res.status(404).json({
                                message: "No Loan was found with this id"
                            });
                        } else {
                            loanAmount = loan[0].Amount;
                            accountAmount = account[0].Amount;

                            // obtain new Account Amount after loan substraction
                            let amount = accountAmount - loanAmount;
                            if (loanAmount > accountAmount) {
                                res.status(400).json({
                                    message: "Not enough money to pay"
                                });
                            } else {
                                // Substract Amount from Account
                                db.run(sqlUpdateAccount, [amount, modified, account[0].id], (err) => {
                                    if (err) {
                                        res.status(400).json({
                                            message: "The account could not be updated",
                                            error: err.message
                                        });
                                    } else {
                                        // Set Loan Amount to 0
                                        db.run(sqlUpdateLoan, [0, modified, loanId], (err) => {
                                            if (err) {
                                                res.status(400).json({
                                                    message: "The Loan could not be updated",
                                                    error: err.message
                                                });
                                            } else {
                                                res.status(201).json({
                                                    message: "Loan and Account Updated "
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    }
                });
            }
        }
    });
});

// Read list of Unpaid Loans
app.get("/api/list-loans/:bankUserId", (req, res) => {
    let bankUserId = req.params.bankUserId;
    let sql = "SELECT * FROM Loan WHERE BankUserId = ? AND Amount != 0";
    db.all(sql, [bankUserId], (err, loans) => {
        if (err) {
            res.status(400).json({
                message: "The Loans could not be showed",
                error: err
            });
        } else {
            if (!loans.length) {
                res.status(400).json({
                    message: "No Unpaid Loans for this user"
                });
            } else {
                res.status(200).json({
                    loans
                });
            }
        }
    });
});

// Withdraw money
app.post("/api/withdraw-money", (req, res) => {
    let amount = req.body.amount;
    let userId = req.body.userId;
    let sqlGetBankUser = "SELECT * FROM BankUser WHERE UserId = ?";
    let sqlGetAccount = "SELECT * FROM Account WHERE BankUserId = ?";
    let sqlUpdateAccount = "UPDATE Account SET Amount = ?, Modified = ? WHERE Id = ?";

    if (amount <= 0 || amount === null) {
        res.status(404).json({
            message: "The amount can not be null or negative"
        });
    } else {
        db.all(sqlGetBankUser, [userId], (err, bankUser) => {
            if (err) {
                res.status(400).json({
                    error: err
                });
                console.log(err);
            } else {
                if (bankUser.length) {
                    db.all(sqlGetAccount, [bankUser[0].Id], (err, account) => {
                        if (err) {
                            res.status(400).json({
                                error: err
                            });
                            console.log(err);
                        } else {
                            if (account.length) {
                                let withdraw = false;
                                let id = "";
                                let amountBeforeWithdraw;

                                if(account[0].Amount - amount >= 0) {
                                    withdraw = true;
                                    id = account[0].Id;
                                    amountBeforeWithdraw = account[0].Amount;
                                }

                                if (withdraw) {
                                    let modified = new Date().toISOString();
                                    let amountAfterWithdraw = amountBeforeWithdraw - amount;
                                    db.run(sqlUpdateAccount, [amountAfterWithdraw, modified, id], (err) => {
                                        if (err) {
                                            res.status(400).json({
                                                message: "The Account could not be updated",
                                                error: err.message
                                            });
                                            console.log(err.message);
                                        } else {
                                            res.status(201).json({
                                                message: "Withdraw done"
                                            });
                                        }
                                    });
                                } else {
                                    res.status(404).json({
                                        message: "You do not have enough money"
                                    });
                                }
                            } else {
                                res.status(404).json({
                                    message: "No account found with this ID"
                                });
                            }
                        }
                    });
                } else {
                    res.status(404).json({
                        message: "No bank user found with this ID"
                    });
                }
            }
        });
    }
});

app.listen(PORT, HOSTNAME, (err) => {
    if(err){
        console.log(err);
    }
    else{
        console.log(`Server is running on Port: ${PORT}`);
    }
})