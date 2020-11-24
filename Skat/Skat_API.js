const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const axios = require("axios");
const { createDecipheriv } = require("crypto");
const HOSTNAME = "localhost";
const PORT = 5006;
let app = express();
app.use(express.json());

// Here we connect to the database
let db = new sqlite3.Database("Skat.sqlite", (err) => {
    if(err) {
        return console.log(err.message);
    }
    console.log("Connected to Database");
});

// Here we create a Skat User
app.post("/api/skat-user", (req, res) => {
    let UserId = req.body.userId;
    let createdAt = new Date().toISOString();
    let isActive = req.body.IsActive;
    let sql = `INSERT INTO SkatUser(UserId, CreatedAt, IsActive) Values(?,?,?)`;
    db.run(sql, [UserId, createdAt, isActive], (err) => {
        if (err) {
            // this message is to show that there was a problem creating the user
            res.status(400).json({
                message: "Problem in creating a user!",
                error: err.message
            });
            console.log(err.message);
        }else{
            // this message is to show that the user has been created
            console.log("A new row has been created");
            res.status(201).json({
                message: "A skat user created"
            });
        }
    });
});

// Here we are able to Read Skat user
app.get("/api/skat-user", (req, res) => {
    let sql = `SELECT * FROM SkatUser`;
    db.all(sql, [], (err, skatUsers) => {
        if (err){
            res.status(400).json({
                // this message is to show that there is a problem showing the skat users
                message: "Problem!! Can't show skat users",
                error: err
            });
        } else{
            // this will show the skat users
            res.status(200).json({
                skatUsers
            });
        }
    });
});

// Here we will be able to read Skat User by ID
app.get("/api/skat-user/:id", (req, res) => {
    console.log("req.params.id: ", req.params.id);
    let sql = `SELECT * FROM SkatUser WHERE Id = ?`;

    db.all(sql, [req.params.id], (err, skatUser) => {
        if (err){
            res.status(400).json({
                error: err
            });
            console.log(err);
        }else{
            if (skatUser.length){
                // this message is to show that the the user with this id has been found
                res.status(200).json({
                    skatUser
                });
            }else{
                res.status(404).json({
                    // this message is to show that the user cannot be found with this id
                    message: "No skat user was found with this ID"
                });
            }
        }
    });
});

// here we wil be able to update the skat User
app.put("/api/skat-user/:id", (req, res) => {
    console.log("req.params.id: ", req.params.id);
    let userId = req.body.UserId;
    let sqlGet = `SELECT * FROM SkatUser WHERE ID = ?`;
    let sqlUpdate = `UPDATE SkatUser SET UserId = ?, CreatedAt = ?, IsActive = ? WHERE ID = ?`;
    let createdAt = new Date().toISOString();
    let isActive = req.body.IsActive;
    db.all(sqlGet, [req.params.id], (err, User) => {
        if (err) {
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if(!User.length) {
                res.status(404).json({
                    // this message is to show that the user cannot be found with this id
                    message: "No Skat user was found with this ID"
                });
            } else {
                db.run(sqlUpdate, [userId, createdAt, isActive, req.params.id], (err) => {
                    if (err) {
                        res.status(400).json({
                            // this message is to show that it was not possible to update this user
                            message: "This skat user could not be updated",
                            error: err.message
                        });
                        console.log(err.message);
                    } else {
                        res.status(201).json({
                            // this message is to show that the user was successfully updated
                            message: "Skat User updated"
                        });
                    }
                });
            }
        }
    });
});

// here we will be able to Delete Skat User
app.delete("/api/skat-user/:id", (req, res) => {
    console.log("req.param.id: ", req.params.id);
    let sqlGet = `SELECT * FROM SkatUser WHERE Id = ?`;
    let sqlDelete = `DELETE FROM SkatUser WHERE Id = ?`;
    db.all(sqlGet, [req.params.id], (err, skatUser) => {
        if (err){
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if (!skatUser.length) {
                res.status(404).json({
                    // this message is to show that the user cannot be found with this id
                    message: "No skat user was found with this ID"
                });
            } else {
                db.run(sqlDelete, req.params.id, (err) => {
                    if (err) {
                        res.status(400).json({
                            // this message is to show that the user cannot be deleted
                            message: "This skat user can not be deleted",
                            error: err.message
                        });
                        console.log(err.message);
                    } else {
                        res.status(201).json({
                            // this message is to show that the use has been successfully deleted
                            message: "Skat User Deleted"
                        });
                    }
                });
            }
        }
    });
});

//  here we will be able to Create a SkatYear
app.post("/api/skat-year", (req, res) => {
    let sql = `INSERT INTO SkatYear(Label, CreatedAt, ModifiedAt, StartDate, EndDate) Values(?,?,?,?,?)`;
    let getThisSkatId = 0;
    let label = req.body.Label;
    let createdAt = new Date().toISOString();
    let modifiedAt = new Date().toISOString();
    let startDate = req.body.StartDate;
    let endDate = req.body.EndDate;

    
    db.run(sql, [label, createdAt,modifiedAt, startDate, endDate], function (err)  {
        if (err) {
            res.status(400).json({
                // this message is to show that there was a problem in creating the skatyear
                message: "Problem in creating skatYear!",
                error: err.message
            });
            console.log(err.message);
        } else {
            getThisSkatId = this.lastID;
            db.all(`SELECT * FROM SkatUser`, [], (err, skatUser) => {
                if (err) {
                    res.status(400).json({
                        // this message is to show that the user cannot be found with that id
                        message: "Problem! Can't show skat users",
                        error: err
                    });
                } else {            
                    skatUser.forEach((row) => {
                        createSkatUserYear(row.Id, getThisSkatId, row.UserId, 0, 0);
                      });
                      // this message is to show that the skatUserYear and SkatYear has been created successfully
                      console.log("SkatUserYear, rows are created")
                      res.status(201).json({
                        message: "SkatYear has been created with skatUserYear"
                    });
                }
            });
            console.log(`A new row of SkatYear has been created.`);            
        }
    });
    
    
    function createSkatUserYear (skatUserId, skatYearId, userId, isPaid, amount) {
        let sqlSkatUserYear = `INSERT INTO SkatUserYear(SkatUserId, SkatYearId, UserId, IsPaid, Amount) Values(?,?,?,?,?)`;
        db.run(sqlSkatUserYear, [skatUserId, skatYearId, userId, isPaid, amount], (err, row) => {
            if (err) {
                res.status(400).json({
                    // this message is to show that there is a problem with creating the skatUserYear
                    message: "Problem in creating skatUserYear!",
                    error: err.message
                });
                console.log(err.message);
            }else{
                // this message is to show that the skatuseryear has been created
                console.log("A new row of SkatUserYear has been created");                
            }
        });
    }
});

// Here we will be able to Read SkatYear
app.get("/api/skat-year", (req, res) => {
    let sql = `SELECT * FROM SkatYear`;
    db.all(sql, [], (err, skatYear) => {
        if (err){
            res.status(400).json({
                // this message is to show that the skatyear cannot be found
                message: "Problem!! Can't show skatYear",
                error: err
            });
        } else{
            res.status(200).json({
                skatYear
            });
        }
    });
});

// here we will be able to Read SkatYear by ID
app.get("/api/skat-year/:id", (req, res) => {
    console.log("req.params.id: ", req.params.id);
    let sql = `SELECT * FROM SkatYear WHERE Id = ?`;

    db.all(sql, [req.params.id], (err, skatYear) => {
        if (err){
            res.status(400).json({
                error: err
            });
            console.log(err);
        }else{
            if (skatYear.length){
                // this message is to show that the skatyear was found with this id
                res.status(200).json({
                    skatYear
                });
            }else{
                res.status(404).json({
                    // this message is to show that the skatyear cannot be found with this id
                    message: "There was no SkatYear found with this ID"
                });
            }
        }
    });
});

// here we will be able to Update SkatYear
app.put("/api/skat-year/:id", (req, res) => {
    console.log("req.params.id: ", req.params.id);
    let sqlGet = `SELECT * FROM SkatYear WHERE Id = ?`;
    let sqlUpdate = `UPDATE SkatYear SET Label = ?, ModifiedAt = ?, StartDate = ?, EndDate = ? WHERE Id = ?`;
    let modifiedAt = new Date().toISOString();
    let label = req.body.label;
    let startDate = req.body.startDate;
    let endDate = req.body.endDate;

    db.all(sqlGet, [req.params.id], (err, skatYear) => {
        if (err) {
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if(!skatYear.length) {
                res.status(404).json({
                    // this message is to show that the skatyear cannot be found with this id
                    message: "There was no SkatYear found with this ID"
                });
            } else {
                db.run(sqlUpdate, [label, modifiedAt, startDate, endDate, req.params.id], (err) => {
                    if (err) {
                        res.status(400).json({
                            // this message is to show that the skatyear was not able to be updated
                            message: "This SkatYear could not be updated",
                            error: err.message
                        });
                        console.log(err.message);
                    } else {
                        res.status(201).json({
                            // this message is to show that the skatyear was updated successfully
                            message: "SkatYear updated"
                        });
                    }
                });
            }
        }
    });
});

// here we was be able to Delete the skatyear
app.delete("/api/skat/Skatyear/:id", (req, res) => {
    let sqlGet = `SELECT * FROM SkatYear WHERE Id = ?`;
    let sqlDelete = `DELETE FROM SkatYear WHERE Id = ?`;
    db.all(sqlGet, [req.params.id], (err, skatYear) => {
        if (err){
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if (!skatYear.length) {
                res.status(404).json({
                    // this message is to show that the skatyear cannot be found with this id
                    message: "There was no SkatYear found with this ID"
                });
            } else {
                db.run(sqlDelete, req.params.id, (err) => {
                    if (err) {
                        res.status(400).json({
                            // this message is to show that is was not possible to delete the skatYear
                            message: "This SkatYear can not be deleted",
                            error: err.message
                        });
                        console.log(err.message);
                    } else {
                        res.status(201).json({
                            // this message is to show that the skatYear was deleted successfully
                            message: "SkatYear Deleted"
                        });
                    }
                });
            }
        }
    });
    db.all(`DELETE FROM SkatUserYear Where SkatYearId = ?`,[req.params.id], (err, skatUserYear) => {
        if (err) {
            console.log(err);
        } else {
            if (!skatUserYear.length){
                // this message is to show that the skatuseryear cannot be found with this id
                console.log("No row was found to delete from SkatUserYear with this id!!!")
            } else {
                // this message is to show that the skatuseryear was successfully deleted 
                console.log("A row is deleted from SkatUserYear")
            }
        }
    });
});

// Create a SkatYear
// app.post("/api/skatUserYear", (req, res) => {
//     let sql = `INSERT INTO SkatUserYear(SkatUserId, SkatYearId, UserId) Values(?,?,?) FROM SkatYear`;
//     let skatUser = req.body.skatUserId
//     let skatYear= req.body.skatYearId
//     let userId = req.body.userId
//     db.run(sql, [skatUser, skatYear, userId], (err) => {
//         if (err) {
//             res.status(400).json({
//                 message: "Problem in creating skatUserYear!",
//                 error: err.message
//             });
//             console.log(err.message);
//         }else{
//             console.log("A new row has been created");
//             res.status(201).json({
//                 message: "SkatUserYear has been created"
//             });
//         }
//     });
// });

// Pay Taxes
app.post("/api/pay-taxes", (req, res) => {
    let userId = req.body.userId;
    let totalAmount = req.body.totalAmount;
    let sqlGet = "SELECT * FROM SkatUserYear WHERE UserId = ?";
    let sqlGetSkatYear = "SELECT * FROM SkatYear WHERE Id = ?";
    let sqlUpdate = "UPDATE SkatUserYear SET isPaid = ?, Amount = ? WHERE Id = ?";

    // Go through all the bank users.
    axios.get("http://localhost:8001/api/bank").then(response => {
        let bankUsers = response.data.bankUsers;
        let isFound = false;
        for (let i = 0; i < bankUsers.length; i++) {
            if (bankUsers[i].UserId === userId) {
                console.log(userId);
                isFound = true;
            }
        }
        if (!isFound) {
            res.status(404).json({
                // this message is to show that the user cannot be found with this id
                message: "No user was found with this ID"
            });
        } else {
            // Get all the Skat User Years based on UserId
            db.all(sqlGet, [userId], (err, skatUserYears) => {
                if (err) {
                    res.status(400).json({
                        error: err
                    });
                    console.log(err);
                } else {
                    if (skatUserYears.length) {
                        let unpaidTaxes = false;
                        for (let i = 0; i < skatUserYears.length; i++) {
                            // Check of the Taxes are paid
                            if (skatUserYears[i].IsPaid === 0 && skatUserYears[i].Amount > 0) {
                                // get all the skat years based on Id
                                db.all(sqlGetSkatYear, [skatUserYears[i].skatYearId], (err, skatYear) => {
                                    if (err) {
                                        res.status(400).json({
                                            error: err
                                        });
                                        console.log(err);
                                    } else {
                                        let date = new Date()
                                        let year = date.getFullYear();
                                        // Check if this is the current year.
                                        if (skatYear[0].startDate.substring(0, 4) <= year && year <= skatYear[0].EndDate.substring(0, 4)) {
                                            // Call Skat caculator function
                                            axios.post("http://localhost:7071/api/Skat_Tax_Calculator", {
                                                "money": totalAmount
                                            }).then((response) => {
                                                let taxAmount = response.data.tax_money;
                                                axios.post("http://localhost:8001/api/withdraw-money", {
                                                    "amount": taxAmount,
                                                    "userId": userId
                                                }).then((response) => {
                                                    // Update SkatUserYear by ID with the amount given by the Tax calculator
                                                    // and the boolean IsPaid is set to true.
                                                    db.run(sqlUpdate, [1, taxAmount, skatUserYears[i].Id], (err) => {
                                                        if (err) {
                                                            res.status(400).json({
                                                                message: "the skat user year can not be updated",
                                                                error: err.message
                                                            });
                                                        } else {
                                                            res.status(200).json({
                                                                message: "Taxes paid"
                                                            });
                                                        }
                                                    });
                                                }, (error) => {
                                                    if (error.response.status === 404) {
                                                        res.status(404).json({
                                                            message: error.response.data.message
                                                        });
                                                    }
                                                });
                                            }, (error) => {
                                                res.status(403).json({
                                                    message: error
                                                });
                                            });
                                        }

                                    }
                                });
                            } else {
                                unpaidTaxes = true;
                            }
                        }
                        if (unpaidTaxes) {
                            res.status(400).json({
                                // this message is to show that the taxes has been paid
                                message: "The taxes for this year already paid"
                            });
                        }
                    } else {
                        res.status(404).json({
                            // this message is to show that the skatuser cannot be found with this id
                            message: "No skat user years was found with this ID"
                        });
                    }
                }
            });
        }
    }).catch(err => {
        if (err){
            res.status(400).json({
                message: err
            });
            console.log(err);
        }
    });
});

// Listening from the port 5006
app.listen(PORT, HOSTNAME, (err) => {
    if (err) {
        console.log(err);
    }
    else{
        console.log(`Server is running on Port: ${PORT}`);
    }
})