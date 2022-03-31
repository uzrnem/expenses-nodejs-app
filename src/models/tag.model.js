'user strict';
var config = require('./../db.config');

var Tag = function(tag) {
  this.name = tag.name;
  this.tag_id = tag.tag_id;
  this.transaction_type_id = tag.transaction_type_id;
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

Tag.findAll = function(parentTag, result) {
  whereClouse = ""
  if (parentTag != "0" && parentTag != 0) {
    whereClouse = " WHERE " + parentTag + " IN (t.id, t.tag_id) ";
  }
  sqlQuery = "SELECT " +
  "t.id, t.name, t.tag_id, p.name AS parent, t.transaction_type_id, " +
  "tt.name AS type, COUNT(DISTINCT(m.id)) AS tag_count " +
  "FROM tags t " +
  "LEFT JOIN tags p ON t.tag_id = p.id " +
  "LEFT JOIN tags c ON t.id = c.tag_id " +
  "LEFT JOIN transaction_types tt ON t.transaction_type_id = tt.id " +
  "LEFT JOIN activities m ON t.id in (m.tag_id, m.sub_tag_id) " + whereClouse +
  "GROUP BY t.id, t.name, t.tag_id, p.name, t.transaction_type_id, tt.name " +
  "ORDER BY COUNT(DISTINCT(c.id)) DESC, t.name ASC"
  config.con.query(sqlQuery, function(err, res) {
    if (err) {
      console.error("error: ", err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

Tag.update = function(id, tag, result) {
  config.con.query("UPDATE tags SET name=?,tag_id=?,transaction_type_id=? WHERE id = ?",
    [tag.name, tag.tag_id, tag.transaction_type_id, id],
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

async function getTransactionDone(from, to, tag_id, transaction_id, result) {
  var res = {
    tags: [],
    sub_tags: [],
    tag_id: tag_id,
    sub_tag_id: 0,
    remarks: ''
  }
  if (from == 0 && to == 0 ) {
    res.tag_id = 0
    return result(null, res)
  }
  console.debug(83, {from, to, tag_id, transaction_id, res})
  try {
    remark_query = ' event_date > DATE_SUB(now(), INTERVAL 6 MONTH) '
    tags = [remark_query]
    subtags = [remark_query]

    //From Condition
    from_query = ""
    if (from > 0) {
      from_query = " from_account_id = "+ from
    } else {
      from_query = " from_account_id is null "
    }
    tags.push(from_query)
    subtags.push(from_query)

    //To Condition
    to_query = ""
    if (to > 0) {
      to_query = " to_account_id = "+ to
    } else {
      to_query = " to_account_id is null "
    }
    tags.push(to_query)
    subtags.push(to_query)

    //Transaction Id Condition
    transaction_query = " transaction_type_id = "+ transaction_id
    tags.push(transaction_query)
    subtags.push(transaction_query)

    console.debug(113, {tags, subtags, res})
    res.tags = await config.query ("Select * from tags " +
    " where " + transaction_query + " AND tag_id IS NULL ");
  
    if ((tag_id > 0) == false) {
      tag_condition = tags.join(' and ')
      console.debug(119, {tag_condition, res})
      var res_tag_id = await config.query("SELECT tag_id FROM activities where " + tag_condition + " group by tag_id, sub_tag_id order by count(id) desc limit 1");
      if (res_tag_id.length > 0 && res_tag_id[0].tag_id != null) {
        tag_id = res_tag_id[0].tag_id
      } else {
        tag_id = 0
      }
      console.debug(101, tag_id, res_tag_id)
      res.tag_id = tag_id
    }
    tag_query = ""
    console.debug(tag_id, res)
    if (tag_id > 0) {
      tag_query = "tag_id = "+ tag_id
      subtags.push(tag_query)

      sub_tag_condition = subtags.join(' and ')
      console.debug(132, {sub_tag_condition, res})
      var res_sub_tag_id = await config.query("SELECT sub_tag_id, GROUP_CONCAT(DISTINCT(remarks)) as remarks FROM activities where " + sub_tag_condition + " group by sub_tag_id order by count(id) desc limit 1");
      console.debug(134, {res_sub_tag_id, res})
      if (res_sub_tag_id.length > 0) {
        res.remarks = res_sub_tag_id[0].remarks
        if (res_sub_tag_id[0].sub_tag_id != null) {
          sub_tag_id = res_sub_tag_id[0].sub_tag_id
        } else {
          sub_tag_id = 0
        }
      } else {
        sub_tag_id = 0
      }
      res.sub_tags = await config.query("Select * from tags where " + tag_query);
      res.sub_tag_id = sub_tag_id
    }
    result(null, res);
  } catch (error) {
    result(error, null);
  }
}

Tag.transactionTypes = function(from, to, tag_id, result) {
  var id = 1
  if (!from || from == 0 || from == '0') {
    id = 3 //income
  } else if (!to || to == 0 || to == '0') {
    id = 2 //debit
  }
  
  getTransactionDone(from, to, tag_id, id, result)
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
