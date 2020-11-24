const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const axio = require("axios");
const HOSTNAME = "localhost";
const PORT = 5004;
let app = express();
app.use(express.json());

// connect to the database.
let db = new sqlite3.Database("borger.sqlite", (err) => {
    if (err) {
        return console.log(err.message);
    }
    console.log("Connected to Database");
});

// Create or Insert a Borger User
app.post("/api/borger", (req, res) => {
    let borgerUserId = req.body.UserId;
    let creationDate = new Date().toISOString();
    let sql = `INSERT INTO BorgerUser(UserId, CreatedAt) Values(?, ?)`;
    db.run(sql, [borgerUserId, creationDate], (err) => {
        if (err) {
            res.status(400).json({
                message: "Problem in creating a user!",
                error: err.message
            });
            console.log(err.message);
        } else {
            console.log("A new row has been created");
            res.status(201).json({
                message: "A borger user is created."
            });
        }
    });
   
});

// Read Borger all Users
app.get("/api/borger", (req, res) => {
    let sql = `SELECT * FROM BorgerUser`;
    db.all(sql, [], (err, borgerUser) => {
        if (err) {
            res.status(400).json({
                message: "Problem! Cann't show borger users",
                error: err
            });
        } else {
            res.status(200).json({
                borgerUser
            });
            borgerUser.forEach((row) => {
                console.log(row.UserId);
              });
        }
    });
    
});


// Read Borger user by ID
app.get("/api/borger/:id", (req, res) => {
    console.log("req.params.id: ", req.params.id);
    let sql = `SELECT * FROM BorgerUser WHERE ID = ?`;

    db.all(sql, [req.params.id], (err, borgerUser) => {
        if (err) {
            res.status(400).json({
                erroe: err
            });
            console.log(err);
        } else {
            if (borgerUser.length) {
                res.status(200).json({
                    borgerUser
                });
            } else {
                res.status(404).json({
                    message: "Nn Borger user was found with this ID."
                });
            }
        }
    });
    
});


// Update Borger User
app.put("/api/borger/:id", (req, res) => {
    console.log("req.params.id: ", req.params.id);
    let borgerUserId = req.body.UserId;
    let sqlGet = `SELECT * FROM BorgerUser WHERE ID = ?`;
    let sqlUpdate = `UPDATE BorgerUser SET UserId = ?, CreatedAt = ? WHERE ID = ?`;
    let createdAt = new Date().toISOString();
    db.all(sqlGet, [req.params.id], (err, borgerUser) => {
        if (err) {
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if(!borgerUser.length) {
                res.status(404).json({
                    message: "No Borger user was found with this ID"
                });
            } else {
                db.run(sqlUpdate, [borgerUserId, createdAt, req.params.id], (err) => {
                    if (err) {
                        res.status(400).json({
                            message: "This borger user could not be updated",
                            error: err.message
                        });
                        console.log(err.message);
                    } else {
                        res.status(201).json({
                            message: "Borger User updated"
                        });
                    }
                });
            }
        }
    });
    
});


// Delete Borger User
app.delete("/api/borger/:id", (req, res) => {
    console.log("req.param.id: ", req.params.id);
    let sqlGet = `SELECT * FROM BorgerUser WHERE ID = ?`;
    let sqlDelete = `DELETE FROM BorgerUser WHERE ID = ?`;
    let sqlDeleteAddressAll = `DELETE FROM Address WHERE BorgerUserId = ? `;
    db.all(sqlGet, [req.params.id], (err, borgerUser) => {
        if (err){
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if (!borgerUser.length) {
                res.status(404).json({
                    message: "No borger user was found with this ID"
                });
            } else {
                deleteAllAdress(req.params.id);
                db.run(sqlDelete, req.params.id, (err) => {
                    if (err) {
                        res.status(400).json({
                            message: "This borger user can not be deleted",
                            error: err.message
                        });
                        console.log(err.message);
                    } else {
                        res.status(201).json({
                            message: "Borger User Deleted"
                        });
                    }
                });
            }
        }
    });

    // Delete all address with that USER ID
    function deleteAllAdress (id) {
        db.all(sqlDeleteAddressAll, [id], (err, row) => {
            if (err) {
                err.status(400).json({
                    erroe: err
                });
                console.log(err);
            } else {
                if (row.length) {
                    console.log("Adress Deleted!")
                }
            }
        });
    }
    
});

// Create or Insert Address 
app.post("/api/borger/address", (req, res) => {
    let addressborgerUserId = req.body.BorgerUserId;
    let address = req.body.Address;
    let creationDate = new Date().toISOString();
    let getIsValid = req.body.Isvalid;
    let query = `SELECT Id FROM BorgerUser WHERE UserId = ?`;
    let uddateAddress = `UPDATE Address SET IsValid = 0 WHERE BorgerUserId = ? AND IsValid = ?`;
    let sql = `INSERT INTO Address(BorgerUserId, Address, CreatedAt, Isvalid) Values(?, ?, ?, ?)`;
    let retrivedId;



    // Create User address if user is exist...

    // Check USER exist or not
    db.all(query, [addressborgerUserId], (err, row) => {
        if (err) {
            res.status(400).json({
                error: err
            });
            console.log(err);
        }
        else {
            if (row.length) {
                retrivedId = row[0].ID;
                // Update other old adresses false
                UpdateAddress(retrivedId);
                // Now insert address
                InsertAddress(retrivedId, address, creationDate, getIsValid); 
                
            } else {
                res.status(404).json({
                    message: "No Borger user was found with this ID."
                });
                }
            }
          
      }); 

      
      function UpdateAddress (id){
        db.all(uddateAddress, [id, 1], (err, row) => {
            if (err) {
                res.status(400).json({
                    message: "This address could not be updated",
                    error: err.message
                });
                console.log(err.message);
            } else {
                if (row.length){
                res.json({
                    message: "Address updated"
                });
                } else {}
            }
        });
        
      }


      function InsertAddress (userId, address, createdAt, isValid) {
        db.run(sql, [userId, address, createdAt, isValid], (err) => {
            if (err) {
                res.status(400).json({
                    message: "Problem in creating an address!",
                    error: err.message
                });
                console.log(err.message);
            } else {
                console.log("A new row has been created");
                res.status(201).json({
                    message: "An Address is created."
                });
            }
        });

      }
});

// Read all Addresses
app.get("/api/borger/address", (req, res) => {
    let sql = `SELECT * FROM Address`;
    db.all(sql, [], (err, address) => {
        if (err) {
            res.status(400).json({
                message: "Problem! Cann't show address",
                error: err
            });
        } else {
            res.status(200).json({
                address
            });
        }
    });
    
});


// Read Address by ID
app.get("/api/borger/address/:id", (req, res) => {
    console.log("req.params.id: ", req.params.id);
    let sql = `SELECT * FROM Address WHERE Id = ?`;

    db.all(sql, [req.params.id], (err, address) => {
        if (err) {
            res.status(400).json({
                erroe: err
            });
            console.log(err);
        } else {
            if (address.length) {
                res.status(200).json({
                    address
                });
            } else {
                res.status(404).json({
                    message: "No Address was found with this ID."
                });
            }
        }
    });
    
});


// Update Address
app.put("/api/borger/address/:id", (req, res) => {
    console.log("req.params.id: ", req.params.id);
    let addressBorgerUserId = req.body.BorgerUserId;
    let address = req.body.Address;
    let isValid = req.body.Isvalid;
    let sqlGet = `SELECT * FROM Address WHERE Id = ?`;
    let sqlUpdate = `UPDATE Address SET BorgerUserId = ?, Address = ?, CraetedAt = ?, Isvalid = ? WHERE Id = ?`;
    let createdAt = new Date().toISOString();
    db.all(sqlGet, [req.params.id], (err, addresses) => {
        if (err) {
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if(!addresses.length) {
                res.status(404).json({
                    message: "No Address was found with this ID"
                });
            } else {
                db.run(sqlUpdate, [addressBorgerUserId, address, createdAt, isValid, req.params.id], (err) => {
                    if (err) {
                        res.status(400).json({
                            message: "This address could not be updated",
                            error: err.message
                        });
                        console.log(err.message);
                    } else {
                        res.status(201).json({
                            message: "Address updated"
                        });
                    }
                });
            }
        }
    });
    
});


// Delete Address
app.delete("/api/borger/address/:id", (req, res) => {
    console.log("req.param.id: ", req.params.id);
    let sqlGet = `SELECT * FROM Address WHERE Id = ?`;
    let sqlDelete = `DELETE FROM Address WHERE Id = ?`;
    db.all(sqlGet, [req.params.id], (err, address) => {
        if (err){
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if (!address.length) {
                res.status(404).json({
                    message: "No address was found with this ID"
                });
            } else {
                db.run(sqlDelete, req.params.id, (err) => {
                    if (err) {
                        res.status(400).json({
                            message: "This address can not be deleted",
                            error: err.message
                        });
                        console.log(err.message);
                    } else {
                        res.status(201).json({
                            message: "Address Deleted"
                        });
                    }
                });
            }
        }
    });
    
});

// Listening from port 5004
app.listen(PORT, HOSTNAME, (err) => {
    if (err) {
        console.log(err);
    }
    else{
        console.log(`Server is running on Port: ${PORT}`);
    }
})