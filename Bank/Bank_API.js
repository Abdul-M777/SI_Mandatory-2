const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const axios = require("axios");
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
app.post("/bank", (req, res) => {
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
app.get("/bank", (req, res) => {
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
app.put("/bank/:id", (req, res) => {
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
app.delete("/bank/:id", (req, res) => {
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
app.post("/account", (req, res) => {
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
app.get("/account", (req, res) => {
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
app.get("/account/:id", (req, res) => {
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
app.put("/account/:id", (req, res) => {
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
app.delete("/account/:id", (req, res) => {
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

app.listen(PORT, HOSTNAME, (err) => {
    if(err){
        console.log(err);
    }
    else{
        console.log(`Server running is running on Port: ${PORT}`);
    }
})