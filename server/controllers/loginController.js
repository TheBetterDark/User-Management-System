const mysql = require("mysql");

// Connection Pool
const pool = mysql.createPool({
  connectionLimit: 100,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Login Page
exports.loginPage = (req, res) => {
  res.render("login");
};

// Authorisation
exports.auth = (req, res) => {
  pool.getConnection((err, connection) => {
    var username = req.body.username;
    var password = req.body.password;

    if (username && password) {
      connection.query("SELECT * FROM accounts WHERE permissions_id = 1 AND username = ? AND password = ? AND status = 'active'",
        [username, password], function (error, results, fields) {
          connection.release();

          if (results.length > 0) {
            req.session.loggedin = true;
            req.session.user = results;
            res.redirect("/redirect");
          } else {
            connection.query("SELECT * FROM accounts WHERE username = ? AND password = ?",
              [username, password], function (error, results, fields) {
                if (results.length > 0) {
                  res.render("login", {
                    alert: "You do not have permissions to access this.",
                  });
                } else {
                  res.render("login", {
                    alert: "Incorrect Username and/or Password!",
                  });
                }
              }
            );
          }
        }
      );
    } else {
      res.render("login", { alert: "Please enter Username and Password!" });
    }
  });
};

// Login
exports.login = (req, res) => {
  if (req.session.loggedin) {
    res.redirect("/users");
  } else {
    res.redirect("/login");
  }
  res.end();
};

// Logout
exports.logout = (req, res) => {
  req.session.loggedin = false;
  req.session.user = null;
  res.redirect("/login");
  res.end();
};
