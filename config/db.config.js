'user strict';

const mysql = require('mysql');
const util = require('util');

//local mysql db connection
const dbConn = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'passworD!123',
  database : 'expense',
  dateStrings : true,
  insecureAuth : true,
  ssl  : {
    rejectUnauthorized: false
  }
});
dbConn.connect(function(err) {
  if (err) throw err;
  console.log("Database Connected!");
  return 1;
});

module.exports = {con: dbConn, query: util.promisify(dbConn.query).bind(dbConn) };
