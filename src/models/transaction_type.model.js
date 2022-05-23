'user strict';
var config = require('./../db.config');

var TransactionType = function(transactionType) {
  this.name = transactionType.name;
};

TransactionType.create = function(newTransactionType, result) {
  config.con.query("INSERT INTO transaction_types set ?", newTransactionType, function(err, res) {
    if (err) {
      console.error("error: ", err);
      result({error: err.sqlMessage}, null);
    } else {
      result(null, res.insertId);
    }
  });
};
TransactionType.findById = function(id, result) {
  config.con.query("Select * from transaction_types where id = ? ", id, function(err, res) {
    if (err) {
      console.error("error: ", err);
      result({error: err.sqlMessage}, null);
    } else {
      result(null, res);
    }
  });
};
TransactionType.findAll = function(result) {
  config.con.query("Select * from transaction_types", function(err, res) {
    if (err) {
      console.error("error: ", err);
      result({error: err.sqlMessage}, null);
    } else {
      result(null, res);
    }
  });
};
TransactionType.update = function(id, transactionType, result) {
  config.con.query("UPDATE transaction_types SET name=? WHERE id = ?", [transactionType.name, id],
    function(err, res) {
      if (err) {
        console.error("error: ", err);
        result({error: err.sqlMessage}, null);
      } else {
        result(null, res);
      }
    });
};
TransactionType.delete = function(id, result) {
  config.con.query("DELETE FROM transaction_types WHERE id = ?", [id], function(err, res) {
    if (err) {
      console.error("error: ", err);
      result({error: err.sqlMessage}, null);
    } else {
      result(null, res);
    }
  });
};

module.exports = TransactionType;
