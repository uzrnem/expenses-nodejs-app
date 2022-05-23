'user strict';
var config = require('./../db.config');

var Passbook = function(passbook) {
  this.name = passbook.name;
  this.passbook_type_id = passbook.passbook_type_id;
  this.amount = passbook.amount;
  this.is_frequent = passbook.is_frequent ? passbook.is_frequent : false;
  this.is_snapshot_disable = passbook.is_snapshot_disable ? passbook.is_snapshot_disable : false;
  this.is_closed = passbook.is_closed ? passbook.is_closed : false;
  this.created_at = new Date();
  this.updated_at = new Date();
};

Passbook.create = function(newPassbook, result) {
  config.con.query("INSERT INTO passbooks set ?", newPassbook, function(err, res) {
    if (err) {
      console.error("error: ", err);
      result({error: err.sqlMessage}, null);
    } else {
      result(null, res.insertId);
    }
  });
};
Passbook.findById = function(id, result) {
  config.con.query("Select * from passbooks where id = ? ", id, function(err, res) {
    if (err) {
      console.error("error: ", err);
      result({error: err.sqlMessage}, null);
    } else {
      result(null, res);
    }
  });
};
Passbook.findAll = function(result) {
  config.con.query("Select * from passbooks", function(err, res) {
    if (err) {
      console.error("error: ", err);
      result({error: err.sqlMessage}, null);
    } else {
      result(null, res);
    }
  });
};
Passbook.update = function(id, passbook, result) {
  config.con.query("UPDATE passbooks SET name=?,passbook_type_id=?,amount=?,is_frequent=?,is_snapshot_disable=?,is_closed=? WHERE id = ?",
    [passbook.name, passbook.passbook_type_id, passbook.amount
      , passbook.is_frequent, passbook.is_snapshot_disable, passbook.is_closed, id],
    function(err, res) {
      if (err) {
        console.error("error: ", err);
        result({error: err.sqlMessage}, null);
      } else {
        result(null, res);
      }
    });
};
Passbook.delete = function(id, result) {
  config.con.query("DELETE FROM passbooks WHERE id = ?", [id], function(err, res) {
    if (err) {
      console.error("error: ", err);
      result({error: err.sqlMessage}, null);
    } else {
      result(null, res);
    }
  });
};
Passbook.accounts = function(id, result) {
  var sql = "select " +
  " ct.name as current_account, p.previous_balance, p.balance, tt.name as transaction_type, " +
  " CASE " +
  "  WHEN ot.name is null THEN tg.name " +
  "  WHEN tt.name = 'Credit' THEN CONCAT(tg.name, ' from ', ot.name) " +
  "  ELSE CONCAT(tg.name, ' to ', ot.name) " +
  " END as comment, tg.name as tag_name, t.amount, t.event_date, ot.name as opposite_account, t.remarks " +
  " from passbooks p " +
  " left join transaction_types tt on p.transaction_type_id = tt.id " +
  " left join activities t on p.activity_id = t.id " +
  " left join tags tg on t.tag_id = tg.id " +
  " left join accounts ct on p.account_id = ct.id " +
  " left join accounts ot on (tt.name = 'Credit' and t.from_account_id = ot.id) or (tt.name = 'Debit' and t.to_account_id = ot.id) " +
  " where p.account_id = "
  config.con.query( sql + id + ' ORDER BY `t`.`event_date` DESC, `p`.`id` DESC LIMIT 15', function(err, res) {
    if (err) {
      console.error("error: ", err);
      result({error: err.sqlMessage}, null);
    } else {
      result(null, res);
    }
  });
};

module.exports = Passbook;
