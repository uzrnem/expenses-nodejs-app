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

Statement.passbook = function(duration, result) {
  //WHERE event_date > DATE_SUB(NOW(), INTERVAL 1 YEAR)
  var date_condition = ""
  if (duration > 0) {
    date_condition = " WHERE event_date > DATE_SUB(now(), INTERVAL "+duration+" YEAR) "
  }

  var sql = "SELECT concat(mon, ' ', year) AS datetime, " + 
  "  SUM(CASE WHEN type = 'Saving' THEN amount ELSE 0 END) 'Saving', " + 
  "  SUM(CASE WHEN type = 'Credit' THEN amount ELSE 0 END) 'Credit', " + 
  "  SUM(CASE WHEN type = 'Wallet' THEN amount ELSE 0 END) 'Wallet', " + 
  "  SUM(CASE WHEN type = 'Mutual Funds' THEN amount ELSE 0 END) 'Mutual Funds', " + 
  "  SUM(CASE WHEN type = 'Stocks Equity' THEN amount ELSE 0 END) 'Stocks Equity', " + 
  "  SUM(CASE WHEN type = 'Deposit' THEN amount ELSE 0 END) 'Deposit', " + 
  "  SUM(CASE WHEN 1 THEN amount ELSE 0 END) 'Total' " + 
  "FROM ( " + 
  "  SELECT c.id, c.account_name, c.type, t.year, t.mon, ( " + 
  "          SELECT p.balance " + 
  "          FROM passbooks p " + 
  "          LEFT JOIN activities a ON a.id = p.activity_id " + 
  "          WHERE p.account_id = c.id and EXTRACT(YEAR_MONTH FROM a.event_date) <= t.yrmon " + 
  "          ORDER BY a.event_date DESC " + 
  "          LIMIT 1 " + 
  "      ) as amount, t.yrmon " + 
  "  FROM ( " + 
  "      SELECT YEAR(event_date) AS year, MONTHNAME(event_date) AS mon, " + 
  "          EXTRACT(YEAR_MONTH FROM event_date) AS yrmon " + 
  "      FROM activities " + date_condition + 
  //"      WHERE event_date > DATE_SUB(NOW(), INTERVAL 1 YEAR) " + 
  "      GROUP BY EXTRACT(YEAR_MONTH FROM event_date), YEAR(event_date), MONTHNAME(event_date) " + 
  "  ) t " + 
  "  LEFT JOIN ( " + 
  "      SELECT " + 
  "          a.id, a.name AS account_name, t.name AS type " + 
  "      FROM accounts a " + 
  "      LEFT JOIN account_types t ON a.account_type_id = t.id " + 
  "      WHERE NOT a.is_closed AND NOT a.is_snapshot_disable " + 
  "  ) c ON 1 " + 
  ") AS passbook " + 
  "GROUP BY year,mon, yrmon;"

  config.con.query(sql, function(err, res) {
    if (err) {
      console.error("error: ", err);
      result(null, err);
    } else {
      result(null, res);
    }
  });
};

Statement.bills = function(duration, result) {
  //WHERE event_date > DATE_SUB(NOW(), INTERVAL 1 YEAR)
  var date_condition = ""
  if (duration > 0) {
    date_condition = " AND event_date > DATE_SUB(now(), INTERVAL "+duration+" YEAR) "
  }

  var sql = "SELECT concat(mon, ' ', year) AS datetime, " +
  "     SUM(CASE WHEN name = 'TOTAL' THEN amount ELSE 0 END) 'TOTAL', " +
  "     SUM(CASE WHEN name = 'HDFC CC' THEN amount ELSE 0 END) 'HDFC', " +
  "     SUM(CASE WHEN name = 'Yes Bank CC' THEN amount ELSE 0 END) 'YES', " +
  "     SUM(CASE WHEN name = 'SBI CC' THEN amount ELSE 0 END) 'SBI', " +
  "     SUM(CASE WHEN name = 'ICICI Amazon Pay CC' THEN amount ELSE 0 END) 'ICICI' " +
  " FROM ( " +
  "     SELECT " +
  "         IFNULL(ac.name, 'TOTAL') AS name, sum(a.amount) AS amount, " +
  "         EXTRACT(YEAR_MONTH FROM a.event_date) AS yrmon, YEAR(a.event_date) AS year, MONTHNAME(a.event_date) AS mon " +
  "     FROM `activities` a " +
  "     LEFT JOIN accounts ac ON a.to_account_id = ac.id " +
  "     WHERE ( (SELECT id FROM `tags` WHERE name = 'Credit Card Bill') IN (a.tag_id, a.sub_tag_id) OR " +
  "       a.transaction_type_id in (SELECT id FROM `transaction_types` WHERE name = 'Expense') ) " +
  date_condition + 
  "     GROUP BY a.to_account_id, EXTRACT(YEAR_MONTH FROM a.event_date), YEAR(a.event_date), MONTHNAME(a.event_date) " +
  " ) AS passbook " +
  " GROUP BY year,mon, yrmon;";

  console.log (date_condition, sql)

  config.con.query(sql, function(err, res) {
    if (err) {
      console.error("error: ", err);
      result(null, err);
    } else {
      result(null, res);
    }
  });
};

module.exports = Statement;
