'use strict';

const Tag = require('../models/tag.model');

exports.findAll = function(req, res) {
  console.log('Tag Controller: List call')
  Tag.findAll(function(err, tag) {
    if (err) {
      res.send(err);
    } else {
      res.json(tag);
    }
  });
};

exports.create = function(req, res) {
  console.log('Tag Controller: Add call')
  const new_tag = new Tag(req.body);

  //handles null error
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(400).send({
      error: true,
      message: 'Please provide all required field'
    });
  } else {
    Tag.create(new_tag, function(err, tag) {
      if (err) {
        res.send(err);
      } else {
        res.json({
          error: false,
          message: "Tag added successfully!",
          data: tag
        });
      }
    });
  }
};

exports.findById = function(req, res) {
  console.log('Tag Controller: Get call')
  Tag.findById(req.params.id, function(err, tag) {
    if (err) {
      res.send(err);
    } else {
      res.json(tag);
    }
  });
};

exports.update = function(req, res) {
  console.log('Tag Controller: Update call')
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(400).send({
      error: true,
      message: 'Please provide all required field'
    });
  } else {
    Tag.update(req.params.id, new Tag(req.body), function(err, tag) {
      if (err) {
        res.send(err);
      } else {
        res.json({
          error: false,
          message: 'Tag successfully updated'
        });
      }
    });
  }
};

exports.delete = function(req, res) {
  console.log('Tag Controller: Delete call')
  Tag.delete(req.params.id, function(err, tag) {
    if (err) {
      res.send(err);
    } else {
      res.json({
        error: false,
        message: 'Tag successfully deleted'
      });
    }
  });
};

exports.transactionTypes = function(req, res) {
  console.log('Tag Controller: Transaction Types call')
  var tag_id = req.query.tag_id ? req.query.tag_id : null;
  if (tag_id) {
    Tag.getByParentTagId(tag_id, function(err, tag) {
      if (err) {
        res.send(err);
      } else {
        res.json(tag);
      }
    });
  } else {
    Tag.transactionTypes(req.params.from, req.params.to, function(err, tag) {
      if (err) {
        res.send(err);
      } else {
        res.json(tag);
      }
    });
  }
};
