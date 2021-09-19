'user strict';
var config = require('./../../config/db.config');

var Account = function(account) {
  this.name = account.name;
  this.slug = account.slug;
  this.account_type_id = account.account_type_id;
  this.amount = account.amount;
  this.is_frequent = account.is_frequent ? account.is_frequent : false;
  this.is_snapshot_disable = account.is_snapshot_disable ? account.is_snapshot_disable : false;
  this.is_closed = account.is_closed ? account.is_closed : false;
  this.created_at = new Date();
  this.updated_at = new Date();
};

Account.create = function(newAccount, result) {
  config.con.query("INSERT INTO accounts set ?", newAccount, function(err, res) {
    if (err) {
      console.error("error: ", err);
      result(err, null);
    } else {
      result(null, res.insertId);
    }
  });
};
Account.findById = function(id, result) {
  config.con.query("Select * from accounts where id = ? ", id, function(err, res) {
    if (err) {
      console.error("error: ", err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};
Account.findAll = function(allAccounts, result) {
  var condition = "";
  if ( allAccounts ) {
    condition = " ORDER BY amount = 0 ASC, name ASC";
  } else {
    condition = " WHERE is_closed = 0 ORDER BY name ASC";
  }
  config.con.query("Select * from accounts " + condition, function(err, res) {
    if (err) {
      console.error("error: ", err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};
Account.frequent = function(result) {
  config.con.query("Select * from accounts WHERE is_closed = 0 AND is_frequent = 1 ORDER BY name ASC", function(err, res) {
    if (err) {
      console.error("error: ", err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};
Account.update = function(id, account, result) {
  config.con.query("UPDATE accounts SET name=?,slug=?,account_type_id=?,amount=?,is_frequent=?,is_snapshot_disable=?,is_closed=? WHERE id = ?",
    [account.name, account.slug, account.account_type_id, account.amount
      , account.is_frequent, account.is_snapshot_disable, account.is_closed, id],
    function(err, res) {
      if (err) {
        console.error("error: ", err);
        result(null, err);
      } else {
        result(null, res);
      }
    });
};
Account.delete = function(id, result) {
  config.con.query("DELETE FROM accounts WHERE id = ?", [id], function(err, res) {
    if (err) {
      console.error("error: ", err);
      result(null, err);
    } else {
      result(null, res);
    }
  });
};
Account.share = function(result) {
  (async () => {
    try {
      const holding_balance = await config.query ("select " +
      "  t.name as 'Account', SUM(a.amount) as 'Amount per Account' " +
      " from accounts a " +
      " left join account_types t on a.account_type_id = t.id " +
      " where a.amount !=0 and a.is_snapshot_disable = 0 and a.is_closed != 1 " +
      " group by a.account_type_id order by t.name='Saving' desc, t.name='Credit' desc, t.name='Wallet' desc, " +
      " t.name='Stocks Equity' desc, t.name='Loan' desc, t.name='Mutual Funds' desc, t.name='Deposit' desc;");

      const account_balance = await config.query(
        " select a.name as account, t.name as type, a.amount as balance " +
        " from accounts a " +
        " left join account_types t on a.account_type_id = t.id " +
        " where a.amount !=0 and a.is_snapshot_disable = 0 and a.is_closed != 1 " +
        " order by t.name='Saving' desc, t.name='Credit' desc, t.name='Wallet' desc, " +
        " t.name='Deposit' desc, t.name='Loan' desc, t.name='Stocks Equity', a.name;");

      var ccBills = {'Balance' : 0}
      var total = 0.0
      var ccBill = 0
      var loan = 0.0
      console.log(holding_balance)
      holding_array = [['Account', 'Amount per Account']]
      holding_balance.forEach((item, i) => {
        if (item['Account'] == 'Credit') {
          ccBill = 0 - item['Amount per Account']
          //holding_array.push([item['Account'], ccBill])
        } else {
          holding_array.push([item['Account'], item['Amount per Account']])
        }
        if (item['Account'] == 'Deposit' || item['Account'] == 'Stocks Equity' || item['Account'] == 'Mutual Funds') {

        } else if (item['Account'] == 'Loan') {
          loan = item['Amount per Account']
        } else {
          total = total + item['Amount per Account']
        }
      });
      delete ccBills['CC Bill']
      console.log('total: ', total, 'Loan: ', loan, 'cc bill: ', ccBill)
      cc_array = [['Account', 'Amount per Account']]
      cc_array.push(['Loan', loan])
      cc_array.push(['CC Bill', ccBill])
      cc_array.push(['Balance', total])
      result(null, { holding: holding_array, balance: account_balance, totalBalance: cc_array });
    } finally {
    }
  })()
};

Account.expenses = function(year, month, result) {
  (async () => {
    try {
      var condition = " AND year(event_date) = " + year + " AND month(event_date) = " + month
      if ( year == 0 || year == "0" ) {
        condition = ""
      }
      const holding_balance = await config.query (
        "SELECT COALESCE(sub.name, tag.name) as tag, SUM(act.amount) as amount " +
        " FROM `activities` as act " +
        " LEFT JOIN `tags` tag ON `tag`.`id` = `act`.`tag_id` " +
        " LEFT JOIN `tags` sub ON `sub`.`id` = `act`.`sub_tag_id` " +
        " WHERE `act`.`transaction_type_id` = 2 " + condition +
        " GROUP BY tag.name, sub.name ORDER BY SUM(act.amount) ASC"
      );

      const months = await config.query(
        "SELECT DISTINCT year(event_date) as year, month(event_date) as month, " +
        " MONTHNAME(event_date) as mon FROM activities " +
          " WHERE transaction_type_id = 2 ORDER BY year(event_date) DESC, month(event_date) DESC");

      var total = 0.0
      holding_array = [['Tag', 'Amount']]
      holding_balance.forEach((item, i) => {
        holding_array.push([item['tag'], item['amount']])
        total = total + item['amount'];
      });
      result(null, { holding: holding_array, expenses: total, months: months });
      return;
    } finally {
    }
  })()
};

module.exports = Account;
