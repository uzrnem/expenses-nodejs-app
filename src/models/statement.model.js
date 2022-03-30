'user strict';
var config = require('./../db.config');

var Statement = function(statement) {
    this.account_id = statement.account_id;
    this.event_date = statement.event_date;
    this.amount = statement.amount;
    this.remarks = statement.remarks;
    this.created_at = new Date();
    this.updated_at = new Date();
};

Statement.create = function(newStatement, result) {
  config.con.query("INSERT INTO statements set ?", newStatement, function(err, res) {
    if (err) {
      console.error("error: ", err);
      result(err, null);
    } else {
      result(null, res.insertId);
    }
  });
};

Statement.findById = function(id, result) {
  config.con.query("Select * from statements where id = ? ", id, function(err, res) {
    if (err) {
      console.error("error: ", err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

Statement.findAll = function(result) {
  config.con.query(" SELECT * FROM statements ORDER BY event_date DESC  ", function(err, res) {
    if (err) {
      console.error("error: ", err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

Statement.update = function(id, statement, result) {
  config.con.query("UPDATE statements SET account_id=?, event_date=?, amount=?, remarks=? WHERE id = ?", [statement.account_id, statement.event_date, statement.amount, statement.remarks, id],

  function(err, res) {
    if (err) {
      console.error("error: ", err);
      result(null, err);
    } else {
      result(null, res);
    }
  });
};

Statement.delete = function(id, result) {
  config.con.query("DELETE FROM statements WHERE id = ?", [id], function(err, res) {
    if (err) {
      console.error("error: ", err);
      result(null, err);
    } else {
      result(null, res);
    }
  });
};

async function getTransactionDone(sql, income_query, bill_query, expense_query, result) {
  var res = {
    result: [],
    expense: 0,
    salary: 0,
    bills: []
  }
  try {
    res.result = await config.query (sql);
    res.expense = await config.query (expense_query);
    res.salary = await config.query (income_query);
    res.bills = await config.query (bill_query);
    result(null, res);
  } catch (error) {
    result(error, null);
  }
}

Statement.monthly = function(duration, result) {
  var date_condition = " event_date > DATE_SUB(now(), INTERVAL "+duration+" YEAR) "
  var and_date_condition = ""
  var where_date_condition = ""
  if (duration > 0) {
    and_date_condition = " and"+date_condition
    where_date_condition = " where"+date_condition
  }
  var sql = "SELECT c.year, c.mon, SUM(a.amount) AS salary, COUNT(a.amount) AS count, SUM(e.amount) AS expense, GROUP_CONCAT(t.cc) as credit, SUM(t.bill) as bill " +
  "FROM ( " +
  "    SELECT DISTINCT YEAR(event_date) AS year, MONTHNAME(event_date) AS mon, " +
  "        EXTRACT(YEAR_MONTH From event_date) AS yearmonth " +
  "    FROM activities " + where_date_condition +
  "    GROUP BY EXTRACT(YEAR_MONTH FROM event_date), YEAR(event_date), MONTHNAME(event_date) " +
  ") c " +
  "LEFT JOIN ( " +
  "    SELECT SUM(amount) AS amount, EXTRACT(YEAR_MONTH FROM event_date) AS event_date " +
  "    FROM activities WHERE sub_tag_id IN (SELECT id FROM tags WHERE name = 'Salary') " + and_date_condition + 
  "    GROUP BY EXTRACT(YEAR_MONTH FROM event_date) " +
  ") a ON a.event_date = c.yearmonth " +
  "LEFT JOIN ( " +
  "    SELECT GROUP_CONCAT(CONCAT(a.name, ':', s.amount, ':', IFNULL(s.remarks, ''))) AS cc, " +
  "    	EXTRACT(YEAR_MONTH FROM s.event_date) AS event_date, SUM(s.amount) as bill " +
  "    FROM statements s LEFT JOIN accounts a ON s.account_id = a.id " + where_date_condition +
  "    GROUP BY EXTRACT(YEAR_MONTH FROM s.event_date) " +
  ") t ON t.event_date = c.yearmonth " +
  "LEFT JOIN ( " +
  "    SELECT SUM(amount) AS amount, EXTRACT(YEAR_MONTH FROM event_date) AS event_date " +
  "    FROM activities WHERE transaction_type_id IN ( " + 
  "        SELECT id FROM transaction_types WHERE name = 'Expense') " + and_date_condition +
  "    GROUP BY EXTRACT(YEAR_MONTH FROM event_date) " +
  ") e ON e.event_date = c.yearmonth " +
  "GROUP BY c.yearmonth, c.year, c.mon ORDER BY c.yearmonth DESC"

  var income_query = "SELECT SUM(amount) AS amount FROM activities WHERE sub_tag_id IN ( SELECT id FROM tags WHERE name = 'Salary' ) " + and_date_condition
  var bill_query = "SELECT a.name, SUM(s.amount) as bill FROM statements s LEFT JOIN accounts a ON s.account_id = a.id " + where_date_condition + " group by a.name"
  var expense_query = "SELECT SUM(amount) AS amount FROM activities WHERE transaction_type_id IN ( SELECT id FROM transaction_types WHERE name = 'Expense' ) " + and_date_condition
  getTransactionDone(sql, income_query, bill_query, expense_query, result)

};

module.exports = Statement;
