const mysql = require("mysql");

// Connection Pool
const pool = mysql.createPool({
  connectionLimit: 100,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Checks if user is logged in
function loginCheck(res, req) {
  if (req.session.loggedin) {
    return true;
  } else {
    res.redirect("/login");
    return false;
  }
}

// Grabs all users in database
function viewAllUsers(res, req, connection) {
  connection.query('SELECT * FROM accounts WHERE status = "active"', (err, rows) => {
      connection.release();

      if (!err) {
        let alert = req.query.removed;
        if (alert) {
          res.render("home", { rows, signedIn: true, search: true, alert });
        } else {
          res.render("home", { rows, signedIn: true, search: true });
        }
      } else {
        console.log(err);
      }
      // console.log('The data from user table \n', rows);
    }
  );
}

// Edits selected user in database
function editUser(res, req, connection, alertMessage) {
  connection.query("SELECT * FROM accounts WHERE accounts.account_id = ?", [req.params.id, req.params.id], (err, rows) => {
      connection.release();

      if (!err) {
        if (alertMessage) {
          res.render("edit-user", {
            rows,
            signedIn: true,
            alert: alertMessage,
          });
        } else {
          res.render("edit-user", { rows, signedIn: true });
        }
      } else {
        console.log(err);
      }
      // console.log('The data from user table \n', rows);
    }
  );
}

// View All Users
exports.viewAllUsers = (req, res) => {
  if (!loginCheck(res, req)) {
    return;
  }

  pool.getConnection((err, connection) => {
    // Connect to database
    if (err) throw err; // Not connected!
    console.log("Connected as ID " + connection.threadId);
    viewAllUsers(res, req, connection);
  });
};

// View Selected User
exports.viewSelectedUser = (req, res) => {
  if (!loginCheck(res, req)) {
    return;
  }

  pool.getConnection((err, connection) => {
    // Connect to database
    if (err) throw err; // Not connected!
    console.log("Connected as ID " + connection.threadId);

    connection.query("SELECT * FROM accounts WHERE accounts.account_id = ?", [req.params.id, req.params.id], (err, rows) => {
        connection.release();

        if (!err) {
          res.render("view-user", { rows, signedIn: true });
        } else {
          console.log(err);
        }
        // console.log('The data from user table \n', rows);
      }
    );
  });
};

// Find user by search
exports.findUser = (req, res) => {
  if (!loginCheck(res, req)) {
    return;
  }

  pool.getConnection((err, connection) => {
    // Connect to database
    if (err) throw err; // Not connected!
    console.log("Connected as ID " + connection.threadId);
    let searchTerm = req.body.search;

    if (searchTerm.replace(/\s+/g, "") != "") {
      connection.query('SELECT * FROM accounts WHERE status = "active" AND first_name LIKE ? OR last_name LIKE ?',
        ["%" + searchTerm + "%", "%" + searchTerm + "%"], (err, rows) => {
          connection.release();

          if (!err) {
            res.render("home", { rows, signedIn: true, search: true });
          } else {
            console.log(err);
          }
          // console.log('The data from user table \n', rows);
        }
      );
    } else {
      viewAllUsers(res, req, connection);
    }
  });
};

// Create User Form
exports.formCreateUser = (req, res) => {
  if (!loginCheck(res, req)) {
    return;
  }

  res.render("create-user", { signedIn: true });
};

// Add new user
exports.createUser = (req, res) => {
  if (!loginCheck(res, req)) {
    return;
  }
  const { permissions, username, password, first_name, last_name, email, phone,  comments } = req.body;

  pool.getConnection((err, connection) => {
    // Connect to database
    if (err) throw err; // Not connected!
    console.log("Connected as ID " + connection.threadId);

    connection.query("INSERT INTO accounts SET permissions_id = ?, username = ?, password = ?, first_name = ?, last_name = ?, email = ?, phone = ?, comments = ?",
    [permissions, username, password, first_name, last_name, email, phone,  comments], (err, rows) => {
        connection.release();

        if (!err) {
          res.render("create-user", { signedIn: true, alert: "User Created." });
        } else {
          console.log(err);
        }
        // console.log('The data from user table \n', rows);
      }
    );
  });
};

// Edit existing user
exports.editUser = (req, res) => {
  if (!loginCheck(res, req)) {
    return;
  }

  pool.getConnection((err, connection) => {
    // Connect to database
    if (err) throw err; // Not connected!
    console.log("Connected as ID " + connection.threadId);
    editUser(res, req, connection);
  });
};

// Update existing user
exports.updateUser = (req, res) => {
  if (!loginCheck(res, req)) {
    return;
  }
  const { permissions, username, password, first_name, last_name, email, phone,  comments } = req.body;

  pool.getConnection((err, connection) => {
    // Connect to database
    if (err) throw err; // Not connected!
    console.log("Connected as ID " + connection.threadId);

    connection.query("UPDATE accounts SET permissions_id = ?, username = ?, password = ?, first_name = ?, last_name = ?, email = ?, phone = ?, comments = ? WHERE account_id = ?",
    [permissions, username, password, first_name, last_name, email, phone,  comments],
      (err, rows) => {
        if (!err) {
          editUser(res, req, connection, "Updated User.");
        } else {
          console.log(err);
        }
        // console.log('The data from user table \n', rows);
      }
    );
  });
};

// Delete existing user
exports.deleteUser = (req, res) => {
  if (!loginCheck(res, req)) {
    return;
  }

  pool.getConnection((err, connection) => {
    // Connect to database
    if (err) throw err; // Not connected!
    console.log("Connected as ID " + connection.threadId);

    connection.query("UPDATE accounts SET status = ? WHERE account_id = ?", ["deleted", req.params.id], (err, rows) => {
        connection.release();

        if (!err) {
          let removedUser = encodeURIComponent("User successfully removed.");
          res.redirect("/users/?removed=" + removedUser);
        } else {
          console.log(err);
        }
        // console.log('The data from user table \n', rows);
      }
    );
  });
};
