'user strict';
var config = require('./../db.config');

var AccountType = function(accountType) {
  this.name = accountType.name;
  this.created_at = new Date();
  this.updated_at = new Date();
};

AccountType.create = function(newAccountType, result) {
  config.con.query("INSERT INTO account_types set ?", newAccountType, function(err, res) {
    if (err) {
      console.error("error: ", err);
      result(err, null);
    } else {
      result(null, res.insertId);
    }
  });
};
AccountType.findById = function(id, result) {
  config.con.query("Select * from account_types where id = ? ", id, function(err, res) {
    if (err) {
      console.error("error: ", err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};
AccountType.findAll = function(result) {
  config.con.query("Select * from account_types", function(err, res) {
    if (err) {
      console.error("error: ", err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};
AccountType.update = function(id, accountType, result) {
  config.con.query("UPDATE account_types SET name=? WHERE id = ?", [accountType.name, id],
    function(err, res) {
      if (err) {
        console.error("error: ", err);
        result(null, err);
      } else {
        result(null, res);
      }
    });
};
AccountType.delete = function(id, result) {
  config.con.query("DELETE FROM account_types WHERE id = ?", [id], function(err, res) {
    if (err) {
      console.error("error: ", err);
      result(null, err);
    } else {
      result(null, res);
    }
  });
};

module.exports = AccountType;
