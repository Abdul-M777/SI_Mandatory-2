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
//POST
app.post("/api/bank", (req, res) => {
    // Here we have the request body for userid.
    let bankUserId = req.body.userId;
    // We Insert it into the BankUser table with the date of the creation.
    let sql = `INSERT INTO BankUser(UserId, CreatedAt) Values(?,?)`;
    // We change the date to a string.
    let creationDate = new Date().toISOString();
    // We run the sql statement
    db.run(sql, [bankUserId, creationDate], (err) => {
        // If there is an error in creating a user we send a 404 message.
        if (err) {
            // status code 400 stand for Bad Request.
            res.status(400).json({
                message: "Can not created a user!",
                error: err.message
            });
        }else{
            // If the Bank user is created we send a status code 201 which stand for Created.
            res.status(201).json({
                message: "A bank user created"
            });
        }
    });
});

// Read Bank User
// GET
app.get("/api/bank", (req, res) => {
    // We select all the rows in the BankUser table.
    let sql = `SELECT * FROM BankUser`;
    // We run the sql statement
    db.all(sql, [], (err, bankUsers) => {
        // If there is an error than we show the 400 status code Bad Request.
        if (err){
            res.status(400).json({
                message: "Can not show bank users",
                error: err
            });
            console.log(err);
        } else{
            // If we can show the bank users we have the status code 200 OK.
            res.status(200).json({
                bankUsers
            });
        }
        console.log(bankUsers);
    });
});

// Read Bank User by their ID
// GET
app.get("/bank/:id", (req, res) => {
    // The sql statement to get a Bank user by their id.
    let sql = `SELECT * FROM BankUser WHERE Id = ?`;

    // We run the sql statement here to get bank user by id.
    db.all(sql, [req.params.id], (err, bankUser) => {
        // if there is an error we will have status code 400 Bad Request.
        if (err){
            res.status(400).json({
                error: err
            });
            console.log(err);
        }else{
            // We check if we have a bank user by that id.
            // If we have a bank user by that specific ID we get status code 200 OK.
            if (bankUser.length){
                res.status(200).json({
                    bankUser
                });
                console.log(bankUser);
            }else{
                // If we can not find that specific ID than we return status code 404 NOT FOUND.
                res.status(404).json({
                    message: "Can not find this bank user ID"
                });
            }
        }
    });
});

// Update our Bank User
// UPDATE
app.put("/api/bank/:id", (req, res) => {
    // The request body will contain a new userId.
    let bankUserId = req.body.userId;
    // This sql statement for gettting the bank user by their ID.
    let sql = "SELECT * FROM BankUser WHERE Id = ?";
    // This sql statment is for updating the BankUser table, we update the UserId and ModifiedAt columns where the specific ID is.
    let sqlUpdate = "UPDATE BankUser SET UserId = ?, ModifiedAt = ? WHERE Id = ?";
    // This variable contains the date of today in a string form.
    let modifiedAt = new Date().toISOString();
    // We run the sql statement to get bank user by the id.
    db.all(sql, [req.params.id], (err, bankUser) => {
        // If there is an error we get status code 400 Bad Request.
        if (err) {
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            // Check if we have that bank user with that user id.
            if(!bankUser.length) {
                // If there is no bank user by that id we send the status code 404 NOT FOUND.
                res.status(404).json({
                    message: "Can not find this bank user ID"
                });
            } else {
                // Here we run the Update sql statement to update our userid and modifiedat.
                db.run(sqlUpdate, [bankUserId, modifiedAt, req.params.id], (err) => {
                    if (err) {
                        // If there is an error we get status code 400 Bad Request.
                        res.status(400).json({
                            message: "Problem!!! Can not Update",
                            error: err.message
                        });
                        console.log(err.message);
                    } else {
                        // If we can Update then we have status code 201 Created.
                        res.status(201).json({
                            message: "Bank User updated"
                        });
                    }
                });
            }
        }
    });
});

// Delete a Bank User
// DELETE
app.delete("/api/bank/:id", (req, res) => {
    // This sql statment is for deleting the bank user we want to delete.
    let sql = `DELETE FROM BankUser WHERE Id = ?`;
                // We run the sql statement to delete a bank user.
                db.run(sql, req.params.id, (err) => {
                    if (err) {
                        // If there is a problem we get the status code 400 Bad Request.
                        res.status(400).json({
                            message: "The Bank User can not be deleted",
                            error: err.message
                        });
                        console.log(err.message);
                    } else {
                        // If the bank user is deleted we get status code 201 Created.
                        res.status(201).json({
                            message: "Bank User Deleted"
                        });
                    }
                });
});

// Create an Account
// POST
app.post("/api/account", (req, res) => {
    // This request body will contain the bankuserId.
    let bankUserId = req.body.bankUserId;
    // This request body will contain account number.
    let accountNo = req.body.accountNo;
    // This request body will contain a number between 0 and 1, if the number is 0 than the user is not a student, if the number is 1 the user is a student.
    let isStudent = req.body.isStudent;
    // This request body will contain the amount of money in the bank account.
    let amount = req.body.amount;
    // This variable contains todays date in string form.
    let creationDate = new Date().toISOString();
    // This sql statement gets us all the data from the bankuser table for a specific ID.
    let sqlGetBankUser = `SELECT * FROM BankUser WHERE Id = ?`;
    // This sql statment gets us all the data from the Account table for a specific bankuserid.
    let sqlGetAccount = `SELECT * FROM Account WHERE BankUserId = ?`;
    // This sql statment lets us insert the different columns in the Account table.
    let sqlAccount = `INSERT INTO Account(BankUserId, AccountNo, IsStudent, CreatedAt, Amount) VALUES(?,?,?,?,?)`;

// Check if the bankUserID exist in the BankUser Table, because we don't allow bank users to have multiple accounts.
// We run the sqlGetBankUser statment to check if the id exist in the bankuser table.
db.all(sqlGetBankUser, [bankUserId], (err, bankUser) => {

        // We check if the bankuser exist in the table.
        if (!bankUser.length) {
            // If the bankuser does not exist we get a status code 404 NOT FOUND.
            res.status(404).json({
                message: "No Bank User found with this ID"
            });
        } else {
            // Here run the sqlGetAccount statement to check if the bank user already has an account.
            db.all(sqlGetAccount, [bankUserId], (err, account) => {
                // Here we check if the account exist in the table.
                    if (account.length) {
                        // If the account exist we get a status code 403 Forbidden.
                        res.status(403).json({
                            message: "This BankUserId already has an account"
                        });
                        // If the user does not have an account in the table.
                    } else {
                        // We run the sqlAccount statement to create an account for this bank user.
                        db.run(sqlAccount, [bankUserId, accountNo, isStudent, creationDate, amount], (err) => {
                            if (err) {
                                // if there is a problem in creating the account we get status code 400 Bad Request.
                                res.status(400).json({
                                    message: "Problem!!! Could not create the account",
                                    error: err.message
                                });
                                console.log(err.message);
                            } else {
                                // If we create the account we get status code 201 Created.
                                console.log("A new account has been created in the database.");
                                res.status(201).json({
                                    message: "An account has been created."
                                });
                            }
                        });
                    }
            });
        }
});
});

// Read Accounts
// GET
app.get("/api/account", (req, res) => {
    // This sql statement is to get all data for account table.
    let sql = "SELECT * FROM Account";
    // Here we run the sql statement.
    db.all(sql, [], (err, accounts) => {
        if (err) {
            // If there is a problem we get status code 400 Bad Request.
            res.status(400).json({
                message: "Sorry can not show the accounts!!! Please try again later",
                error: err
            });
            console.log(err);
        } else {
            // If we get the data, we get the status code 200 OK.
            res.status(200).json({
                accounts
            });
            console.log(accounts);
        }
    });
});

// Read Account by ID
// GET
app.get("/api/account/:id", (req, res) => {
    // This sql statment is to get all data from the account table for a specific id.
    let sql = "SELECT * FROM Account WHERE Id = ?";

    // We run the sql statement
    db.all(sql, [req.params.id], (err, account) => {
        // We check if the user with that id exist.
            if (account.length) {
                // if they do than we have the status code 200 OK
                res.status(200).json({
                    account
                });
                console.log(account);
            } else {
                // if the account does not exist than we have the status code 404.
                res.status(404).json({
                    message: "No account was found with this ID"
                });
            }
    });
});

// Update Account
// UPDATE
app.put("/api/account/:id", (req, res) => {
    // This request body is for bankuserid.
    let bankUserId = req.body.bankUserId;
    // This request body is for the account number.
    let accountNo = req.body.accountNo;
    // This request body is for student or not student.
    let isStudent = req.body.isStudent;
    // This request body is for the amount of money in the bank account.
    let amount = req.body.amount;
    // This varialbe is for the date of today.
    let Modified = new Date().toISOString();
    // This sql statment is for getting all the data from the account table for a specific id.
    let sql = "SELECT * FROM Account WHERE Id = ?";
    // This sql statement is for updating the account table.
    let sqlUpdate = "UPDATE Account SET BankUserId = ?, AccountNo = ?, IsStudent = ?, Modified = ?, Amount = ? WHERE Id = ?";

    db.all(sql, [req.params.id], (err, account) => {
    // Check if the bankUserId exists in the BankUser table
            if (!account.length) {
                // If the id does not exist in the table we get status code 404 NOT FOUND.
                res.status(404).json({
                    message: "No account was found with this ID"
                });
            } else {
                // If the account exist than we run the update statement to update the account.
                db.run(sqlUpdate, [bankUserId, accountNo, isStudent, Modified, amount, req.params.id], (err) => {
                    if (err) {
                        // If there is problem in updating the account we get status code 400 Bad Request.
                        res.status(400).json({
                            message: "Problem!!! Could not be updated",
                            error: err.message
                        });
                        console.log(err.message);
                    } else {
                        // If we update the account then we get the code 201 CREATED.
                        res.status(201).json({
                            message: "Account updated"
                        });
                    }
                });
            }
    });
});

// Delete Account
// DELETE.
app.delete("/api/account/:id", (req, res) => {
    // For Delete we do the same thing as we did for update.
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
// POST
app.post("/api/add-deposit", (req, res) => {
    // This request body for amount of money we deposit.
    let amount = req.body.amount;
    // This request body for the bank user id.
    let bankUserId = req.body.bankUserId;
    // This variable we save the date of today.
    let createdAt = new Date().toISOString();
    // In this sql statment we get all the data from the bank user where a specific id exist.
    let sqlGetBankUser = "SELECT * FROM BankUser WHERE Id = ?";
    // In this sql statement we insert data into the deposit table.
    let sqlAddDeposit = "INSERT INTO Deposit(BankUserId, CreatedAt ,Amount) VALUES(?,?,?)";
    // In this sql statement we update the Account table based on the deposit.
    let sqlUpdateAccount = "UPDATE Account SET Amount = ? ,Modified = ?  Where BankUserId = ?";
    // In this sql statement we get all the data from the account table where a specific Id is.
    let sqlAccount = "SELECT * FROM Account WHERE Id = ?";
    // Here we run the sql statement to get the bank user id.
    db.all(sqlGetBankUser, [bankUserId], (err, bankUser) =>{
        // Here we run the sql statement to get the amount of money the user already has in their bank account.
        db.all(sqlAccount, [bankUserId], (err, bankAmount) => {
              let moneyBank = bankAmount[0]["Amount"]
            // We check if the bank user id exists.
            if(!bankUser.length) {
                // If the bank user id is not found we get status code 404 NOT FOUND.
                res.status(404).json({
                    message: "No bank user found with this ID"
                });
            } else {
                // We check if the amount is null or below 0.
                if (amount <= 0 || amount === null) {
                    // if it is then we get the status code 404 NOT FOUND.
                    res.status(404).json({
                        message: "PROBLEM!!! The amount can not be negative.",
                    });
                } else {
                    // We call on the function Interest_Rate using axios.
                    // We get the deposit amount from the function.
                   axios.post("http://localhost:7071/api/Interest_Rate", {depositAmount: amount}).then(response => {
                       // This variable we get the data from the function.
                       let result = response.data;
                       console.log(response.data);
                       // This variable has the date of today in string form.
                       let modified = new Date().toISOString();
                        // Here we are adding the deposit money to the money already in the account.
                       let total = result + moneyBank;
                       console.log(total)
                        // Here we run the sql statment to update the account table.
                       db.run(sqlUpdateAccount, [total, modified, bankUserId], (err) => {
                           if (err) {
                               // If there is a problem we get the status code 400 Bad Request.
                               res.status(400).json({
                                   message: "The account could not be updated",
                                   error: err.message
                               });
                               console.log(err.message);
                           }
                       });
                       // Here we run the sql statment to add the deposit data into the deposit table.
                       db.run(sqlAddDeposit, [bankUserId, createdAt, result], (err) => {
                            if (err) {
                                res.status(400).json({
                                    // If there is a problem we get the status code 400 Bad Request.
                                    message: "The deposit could not be created",
                                    error: err.message
                                });
                            } else {
                                // If the deposit is complete we get the status code 201 Created.
                                res.status(201).json({
                                    message: "Deposit complete!!"
                                });
                            }
                       });
                   });                    
                }
            }
    });
});
});

// List Deposit
// GET
app.get("/api/list-deposit/:bankUserId", (req, res) => {
    // In this sql statement we get all the data from the deposit table where the BankuserId is.
    let sql = "SELECT * FROM Deposit WHERE BankUserId = ?";
    // Here we run the sql statement.
    db.all(sql, [req.params.bankUserId], (err, deposits) => {
        // Check if the deposit exists.
            if (deposits.length) {
                // If Yes then we get the status code 200.
                res.status(200).json({
                    deposits
                });
            } else {
                // If there is a problem and we can not read then we get the status code 404 NOT FOUND.
                res.status(404).json({
                    message: "No deposits found for this ID"
                });
            }
    });
});

// Create Loan and Update Account
// POST
app.post("/api/create-loan", (req, res) => {
    // This body request constains the bankuserid.
    let bankUserId = req.body.bankUserId;
    // This body request contains the loanAmount.
    let loanAmount = req.body.loanAmount;
    // This variable contains the date of today in string form.
    let createdAt = new Date().toISOString();
    // this variable contains the date of today in string form.
    let modified = new Date().toISOString();
    // this sql statement we get all the data from the bankuser table where a specific ID.
    let sqlGetBankUser = `SELECT * FROM BankUser WHERE Id = ?`;
    // this sql statement we insert data into the loan table.
    let sqlLoan = `INSERT INTO Loan(BankUserId, CreatedAt ,Amount) VALUES(?, ?, ?)`;
    // this sql statement we update the account table where we get the specific bankuserId.
    let sqlInsert = "UPDATE Account SET Amount = ?, Modified = ? WHERE BankUserId = ?";
    // In this sql statement we get all the data from the account table where a specific Id is.
    let sqlAccount = "SELECT * FROM Account WHERE Id = ?";

    // Check if the bankUserId exists in the BankUser table
    db.all(sqlGetBankUser, [bankUserId], (err, bankUser) => {
        // We run the sql statement to get the amount in the users account.
        db.all(sqlAccount, [bankUserId], (err, bankAmount) => {
            let amount = bankAmount[0]["Amount"]
            console.log(amount);
            // We check if the bank user exist in the table.
            if(!bankUser.length) {
                // If not then we get a status code 404 NOT FOUND.
                res.status(404).json({
                    message: `PROBLEM!!! Could not find the user with that ID`
                });
            } else {
                    // We send the the loanAmount and the amount we have in the account to the function.
                    axios.post(`http://localhost:7071/api/Loan_Algorithm`, {
                        "loan": loanAmount,
                        "totalAccountAmount": amount
                    }).then((response) => {
                        console.log(loanAmount+ amount);
                        // We add the amount we have in the bank to the loan.
                        let total = loanAmount + amount;
                        // Here we run the sql to insert data into the Loan table.
                        db.run(sqlLoan, [bankUserId, createdAt,loanAmount], (err) => {
                            if (err) {
                                // If we can not insert data than we get status code 400 Bad Resquest.
                                res.status(400).json({
                                    message: 'Problem!!! Loan can not be created',
                                    error: err.message
                                });
                            } else {
                                res.status(201).json({
                                    // If we can create the Loan then we get the status code 201.
                                    message: 'Loan created!',
                                });
                            }
                        });
                        // We run this sql statement to update our account table.
                        db.run(sqlInsert, [total, modified, bankUserId], (err) => {
                            if (err) {
                                // If we face a problem we get the status code 400 Bad Request.
                                res.status(400).json({
                                    message: "Problem!!! Could not update account",
                                    error: err.message
                                });
                            } else {
                                // If we can update our account then we get status code 201 Created.
                                res.status(201).json({
                                    message: "Account updated"
                                });
                            }
                        });
                        
                    }, (error) => {
                        // If the Loan amount is too big we get the status code 403 Forbidden.
                        res.status(403).json({
                            message: 'Problem!!!! The Loan could not be created! Loan amount is too big!',
                        });
                    });
            }
    });
});
    
});

// Pay Loan - UPDATE Loan and Account
// UPDATE
app.put("/api/pay-loan", (req, res) => {
    // This request body takes bank user id.
    let bankUserId = req.body.bankUserId;
    // This request body takes loanid.
    let loanId = req.body.loanId;
    // this variable will contain the money in our account.
    let accountMoney;
    // This will contain the loan amount from the loan table.
    let loanAmount;

    let sqlGetLoan = "SELECT * FROM Loan WHERE Id = ?";

    let sqlGetAccount = "SELECT * FROM Account WHERE BankUserId = ?";

    let sqlUpdateLoan = "UPDATE LOAN SET Amount = ?, ModifiedAt = ? WHERE Id = ?";

    let sqlUpdateAccount = "UPDATE Account SET Amount = ?, Modified = ? WHERE Id = ?";

    // We run the sql to get the amount from the account.
    db.all(sqlGetAccount, [bankUserId], (err, account) => {
        // We check if the account exist.
            if (!account.length) {
                // if not then we get status code 404 NOT FOUND.
                res.status(404).json({
                    message: "No account was found with this ID"
                });
            } else {
                let modified = new Date().toISOString();

                // Here we get the loan amount.
                db.all(sqlGetLoan, [loanId], (err, loan) => {
                    // We check if the loan exist in the table.
                        if (!loan.length) {
                            // If the loan does not exist we get the status code 404 NOT FOUND
                            res.status(404).json({
                                message: "No Loan was found with this id"
                            });
                        } else {
                            // here we get loan amount.
                            loanAmount = loan[0].Amount;
                            // here we get account amount.
                            accountMoney = account[0].Amount;

                            // obtain new Account Amount after loan substraction
                            let amount = accountMoney - loanAmount;
                            // We check if the loan amount is bigger than the amount in the account table.
                            if (loanAmount > accountMoney) {
                                // Then we get status code 403 Forbidden.
                                res.status(403).json({
                                    message: "Not enough money to pay"
                                });
                            } else {
                                // We run this sql statment to update the account table.
                                db.run(sqlUpdateAccount, [amount, modified, account[0].id], (err) => {
                                    if (err) {
                                        // If we face a problem we get the status code 400 Bad Request.
                                        res.status(400).json({
                                            message: "The account could not be updated",
                                            error: err.message
                                        });
                                    } else {
                                        // We run this sql statement to update the loan table and set the amount to 0.
                                        db.run(sqlUpdateLoan, [0, modified, loanId], (err) => {
                                            if (err) {
                                        // If we face a problem we get the status code 400 Bad Request.
                                                res.status(400).json({
                                                    message: "The Loan could not be updated",
                                                    error: err.message
                                                });
                                            } else {
                                                // If everything is ok we get the status code 201 Created.
                                                res.status(201).json({
                                                    message: "Loan and Account Updated "
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        }
                });
            }
    });
});

// Read list of Unpaid Loans
app.get("/api/list-loans/:bankUserId", (req, res) => {
    // This request body contains the bankuserid.
    let bankUserId = req.params.bankUserId;
    // This sql statement will give us the data from the Loan table where the ID is not 0.
    let sql = "SELECT * FROM Loan WHERE BankUserId = ? AND Amount != 0";
    db.all(sql, [bankUserId], (err, loans) => {
            // We check if there are unpaid loans.
            if (!loans.length) {
                // If there are none then we get the status code 400 Bad Request.
                res.status(400).json({
                    message: "No Unpaid Loans for this user"
                });
            } else {
                // If there are any we get status code 200 OK.
                res.status(200).json({
                    loans
                });
            }
    });
});

// Withdraw money
app.post("/api/withdraw-money", (req, res) => {
    // This request body contain the amount of money we want to withdraw.
    let amount = req.body.amount;
    // This request body contain the userid.
    let userId = req.body.userId;
    let sqlGetBankUser = "SELECT * FROM BankUser WHERE UserId = ?";
    let sqlGetAccount = "SELECT * FROM Account WHERE BankUserId = ?";
    let sqlUpdateAccount = "UPDATE Account SET Amount = ?, Modified = ? WHERE Id = ?";

    // check if the amount is valid.
    if (amount <= 0 || amount === null) {
        res.status(404).json({
            // IF the amount is invalid we get status code 404 NOT FOUND.
            message: "The amount can not be null or negative"
        });
    } else {
        // we run the sql statement to get bankuser from the userid.
        db.all(sqlGetBankUser, [userId], (err, bankUser) => {
                // We check if the bankuser exist.
                if (bankUser.length) {
                    // we run the sql statement to get the account based on the bankuserId.
                    db.all(sqlGetAccount, [bankUser[0].Id], (err, account) => {
                        // We check if the account exist.
                            if (account.length) {
                                // Here we set a variable to false so we can check if the user withdraw or not.
                                let gotmoney = false;
                                // this variable will contain the account id.
                                let id = "";
                                // This variable will contain the money we had before the withdraw.
                                let amountBeforeWithdraw;
                                // We check if we can withdraw without going negative.
                                if(account[0].Amount - amount >= 0) {
                                    // this vaiable will be true.
                                    gotmoney = true;
                                    // We get the id.
                                    id = account[0].Id;
                                    // We get the amount before the withdraw.
                                    amountBeforeWithdraw = account[0].Amount;
                                }

                                // We check if we withdrew money.
                                if (gotmoney) {
                                    // if true than we update our account.
                                    let modified = new Date().toISOString();
                                    let amountAfterWithdraw = amountBeforeWithdraw - amount;
                                    db.run(sqlUpdateAccount, [amountAfterWithdraw, modified, id], (err) => {
                                        if (err) {
                                            res.status(400).json({
                                                message: "ERROR!!! Account could not updated!!",
                                                error: err.message
                                            });
                                            console.log(err.message);
                                        } else {
                                            res.status(201).json({
                                                message: "Withdraw Done"
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
                    });
                } else {
                    res.status(404).json({
                        message: "No bank user found with this ID"
                    });
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