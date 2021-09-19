'user strict';
var config = require('./../../config/db.config');

var Activity = function(activity) {
  this.from_account_id = activity.from_account_id;
  this.to_account_id = activity.to_account_id;
  this.tag_id = activity.tag_id;
  this.amount = activity.amount;
  this.sub_tag_id = activity.sub_tag_id;
  this.event_date = activity.event_date;
  this.remarks = activity.remarks;
  this.transaction_type_id = activity.transaction_type_id;
  this.created_at = new Date();
  this.updated_at = new Date();
};

Activity.create = function(newActivity, result) {
  newActivity.transaction_type_id = 1 //Transfer
  if (newActivity.from_account_id == 0 || newActivity.from_account_id == "0") {
    newActivity.transaction_type_id = 3 //Income credit
    delete newActivity.from_account_id
  } else if (newActivity.to_account_id == 0 || newActivity.to_account_id == "0") {
    newActivity.transaction_type_id = 2 //Expense debit
    delete newActivity.to_account_id
  }
  if (newActivity.sub_tag_id == 0 || newActivity.sub_tag_id == "0") {
    delete newActivity.sub_tag_id
  }
  config.con.query("INSERT INTO activities set ?", newActivity, function(err, res) {
    if (err) {
      console.error("error: ", err);
      result(err, null);
    } else {
      result(null, res.insertId);
    }
  });
};
Activity.findById = function(id, result) {
  config.con.query("Select * from activities where id = ? ", id, function(err, res) {
    if (err) {
      console.error("error: ", err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};
Activity.findAll = function(result) {
  config.con.query(
    " SELECT act.id, act.amount, act.event_date, act.remarks, act.created_at, act.updated_at, " +
    "  fa.name as from_account, ta.name as to_account, tg.name as tag, s_tg.name as sub_tag, " +
    "  transaction_types.name as transaction_type " +
    " FROM `activities` as act " +
    " LEFT JOIN `tags` tg ON `tg`.`id` = `act`.`tag_id` " +
    " LEFT JOIN `tags` s_tg ON `s_tg`.`id` = `act`.`sub_tag_id` " +
    " LEFT JOIN `transaction_types` ON `transaction_types`.`id` = `act`.`transaction_type_id` " +
    " LEFT JOIN accounts as fa ON fa.id = act.from_account_id " +
    " LEFT JOIN accounts as ta ON ta.id = act.to_account_id " +
    " ORDER BY `act`.`created_at` DESC, `act`.`event_date` DESC, `act`.`id` DESC LIMIT 5 -- OFFSET 0", function(err, res) {
    if (err) {
      console.error("error: ", err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};
/*
Activity.update = function(id, activity, result) {
  config.con.query("UPDATE accounts SET from_account_id=?,to_account_id=?,tag_id=?,amount=? " +
    ",sub_tag_id=?,event_date=?,remarks=?,transaction_type_id=? WHERE id = ?",
    [activity.from_account_id, activity.to_account_id, activity.tag_id, activity.amount, activity.sub_tag_id
      , activity.event_date, activity.remarks, activity.transaction_type_id, id],
    (res, err) => {
      if (err) {
        console.error("error: ", err);
        result(null, err);
      } else {
        result(null, res);
      }
  });
};
*/
Activity.delete = function(id, result) {
  config.con.query("DELETE FROM activities WHERE id = ?", [id], function(err, res) {
    if (err) {
      console.error("error: ", err);
      result(null, err);
    } else {
      result(null, res);
    }
  });
};

Activity.log = function(data, result) {
  (async () => {
    try {

      var condTag = data.tag_id ? '( act.tag_id = ' + data.tag_id + ' or act.sub_tag_id = ' + data.tag_id + ')' : null;

      var condAccount = null
      if ( data.account_id && data.account_key ) {
        condAccount = '( ( act.from_account_id = ' + data.account_id + ' and act.to_account_id = ' + data.account_key + ') or' +
          '( act.from_account_id = ' + data.account_key + ' and act.to_account_id = ' + data.account_id + ') )'
      } else if ( data.account_id ) {
        condAccount = '( act.from_account_id = ' + data.account_id + ' or act.to_account_id = ' + data.account_id + ')'
      }
      var condTransType = data.transaction_type_id ? ' act.transaction_type_id = ' + data.transaction_type_id : null;

      var condStartDate = data.start_date ? "act.event_date >= '" + data.start_date + "'" : null;
      var condEndDate = data.end_date ? "act.event_date <= '" + data.end_date + "'" : null;

      var condition = ''
      var andCond = ''
      if (condTag != null) {
        condition = condTag
        andCond = ' AND '
      }
      if (condAccount != null) {
        condition = condition + andCond + condAccount
        andCond = ' AND '
      }
      if (condTransType != null) {
        condition = condition + andCond + condTransType
        andCond = ' AND '
      }
      if (condStartDate != null) {
        condition = condition + andCond + condStartDate
        andCond = ' AND '
      }
      if (condEndDate != null) {
        condition = condition + andCond + condEndDate
      }
      if (condition != '') {
        condition = ' WHERE ' + condition
      }

      var limit = data.page_size
      var offset = (data.page_index - 1 ) * limit

      var sql = "SELECT act.id, act.amount, act.event_date, act.remarks, act.created_at, act.updated_at, " +
      "  fa.name as from_account, ta.name as to_account, tg.name as tag, s_tg.name as sub_tag, " +
      "  transaction_types.name as transaction_type, fp.previous_balance as fp_previous_balance, " +
      "  fp.balance as fp_balance, tp.previous_balance as tp_previous_balance, tp.balance as tp_balance " +
      " FROM `activities` as act " +
      " LEFT JOIN `tags` tg ON `tg`.`id` = `act`.`tag_id` " +
      " LEFT JOIN `tags` s_tg ON `s_tg`.`id` = `act`.`sub_tag_id` " +
      " LEFT JOIN `transaction_types` ON `transaction_types`.`id` = `act`.`transaction_type_id` " +
      " LEFT JOIN `passbooks`as fp ON `fp`.`activity_id` = `act`.`id` and act.from_account_id = fp.account_id " +
      " LEFT JOIN `passbooks`as tp ON `tp`.`activity_id` = `act`.`id` and act.to_account_id = tp.account_id " +
      " LEFT JOIN accounts as fa ON fa.id = act.from_account_id " +
      " LEFT JOIN accounts as ta ON ta.id = act.to_account_id " + condition +
      " ORDER BY `act`.`event_date` DESC, `act`.`id` DESC LIMIT " + limit+ " offset " + offset;

      var count = "SELECT count(act.id) as count FROM `activities` as act " + condition;
      var sum = "SELECT SUM(act.amount) as sum FROM `activities` as act " + condition;

      var _sql = await config.query ( sql );
      var _count = await config.query ( count );
      var _sum = await config.query ( sum );
      result (null, { list: _sql, total: _count[0]['count'], sum: _sum[0]['sum'] });
    } finally {
      return
    }
  })()
};

module.exports = Activity;
