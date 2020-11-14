CREATE TABLE IF NOT EXISTS BankUser(
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    UserId INT(10),
    CreatedAt Text NOT NULL,
    ModifiedAt Text
);

CREATE TABLE IF NOT EXISTS Loan(
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    BankUserId INT(10),
    CreatedAt TEXT NOT NULL,
    ModifiedAt TEXT,
    Amount INTEGER
);

CREATE TABLE IF NOT EXISTS Account(
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    BankUserId INT(10),
    AccountNo INT(10),
    IsStudent BOOLEAN CHECK (IsStudent IN (0,1)),
    CreatedAt TEXT NOT NULL,
    Modified TEXT,
    Amount INTEGER
);

CREATE TABLE IF NOT EXISTS Deposit(
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    BankUserId INT(10),
    CreatedAt TEXT NOT NULL,
    Amount INTEGER
);

