'user strict';
var config = require('./../../config/db.config');

var Tag = function(tag) {
  this.name = tag.name;
  this.slug = tag.slug;
  this.tag_id = tag.tag_id;
  this.transaction_type_id = tag.transaction_type_id;
  this.created_at = new Date();
  this.updated_at = new Date();
};

Tag.create = function(newTag, result) {
  config.con.query("INSERT INTO tags set ?", newTag, function(err, res) {
    if (err) {
      console.error("error: ", err);
      result(err, null);
    } else {
      result(null, res.insertId);
    }
  });
};
Tag.findById = function(id, result) {
  config.con.query("Select * from tags where id = ? ", id, function(err, res) {
    if (err) {
      console.error("error: ", err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};
Tag.findAll = function(result) {
  config.con.query("Select * from tags order by name ASC", function(err, res) {
    if (err) {
      console.error("error: ", err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};
Tag.update = function(id, tag, result) {
  config.con.query("UPDATE tags SET name=?,slug=?,tag_id=?,transaction_type_id=? WHERE id = ?",
    [tag.name, tag.slug, tag.tag_id, tag.transaction_type_id, id],
    function(err, res) {
      if (err) {
        console.error("error: ", err);
        result(null, err);
      } else {
        result(null, res);
      }
    });
};
Tag.delete = function(id, result) {
  config.con.query("DELETE FROM tags WHERE id = ?", [id], function(err, res) {
    if (err) {
      console.error("error: ", err);
      result(null, err);
    } else {
      result(null, res);
    }
  });
};
Tag.transactionTypes = function(from, to, result) {
  var id = 1
  if (!from || from == 0 || from == '0') {
    id = 3 //income
  } else if (!to || to == 0 || to == '0') {
    id = 2 //debit
  }
  console.log(from, to, id)
  config.con.query("Select * from tags where transaction_type_id = ? AND tag_id IS NULL ", id, function(err, res) {
    if (err) {
      console.error("error: ", err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};
Tag.getByParentTagId = function(tagId, result) {
  config.con.query("Select * from tags where tag_id = ? ", tagId, function(err, res) {
    if (err) {
      console.error("error: ", err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

module.exports = Tag;
