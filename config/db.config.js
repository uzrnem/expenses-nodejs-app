'user strict';

const { DATABASE, USER, PASSWORD } = require('../env');
const mysql = require('mysql');
const util = require('util');

//local mysql db connection
const dbConn = mysql.createConnection({
  host     : 'localhost',
  user     : USER,
  password : PASSWORD,
  database : DATABASE,
  port: 3306,
  dateStrings : true
});
dbConn.connect(function(err) {
  if (err) throw err;
  console.log("Database Connected!");
  return 1;
});

module.exports = {con: dbConn, query: util.promisify(dbConn.query).bind(dbConn) };
