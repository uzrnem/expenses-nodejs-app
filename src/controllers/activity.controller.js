'use strict';

const Activity = require('../models/activity.model');

exports.findAll = function(req, res) {
  console.log('Activity Controller: List call')
  Activity.findAll(function(err, activity) {
    if (err) {
      res.send(err);
    } else {
      res.json(activity);
    }
  });
};

exports.create = function(req, res) {
  console.log('Activity Controller: Add call')
  const new_activity = new Activity(req.body);

  //handles null error
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(400).send({
      error: true,
      message: 'Please provide all required field'
    });
  } else {
    Activity.create(new_activity, function(err, activity) {
      if (err) {
        res.send(err);
      } else {
        res.json({
          error: false,
          message: "Activity added successfully!",
          data: activity
        });
      }
    });
  }
};

exports.findById = function(req, res) {
  console.log('Activity Controller: Get call')
  Activity.findById(req.params.id, function(err, activity) {
    if (err) {
      res.send(err);
    } else {
      res.json(activity);
    }
  });
};

exports.update = function(req, res) {
  console.log('Activity Controller: Update call')
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(400).send({
      error: true,
      message: 'Please provide all required field'
    });
  } else {
    Activity.update(req.params.id, new Activity(req.body), function(err, activity) {
      if (err) {
        res.send(err);
      } else {
        res.json({
          error: false,
          message: 'Activity successfully updated',
          data: activity
        });
      }
    });
  }
};

exports.delete = function(req, res) {
  console.log('Activity Controller: Delete call')
  Activity.delete(req.params.id, function(err, activity) {
    if (err) {
      res.send(err);
    } else {
      res.json({
        error: false,
        message: 'Activity successfully deleted',
        data: activity
      });
    }
  });
};

exports.log = function(req, res) {
  console.log('Activity Controller: log call')
  Activity.log({
    tag_id: req.query.tag_id && req.query.tag_id > 0 ? req.query.tag_id : null,
    account_id: req.query.account_id && req.query.account_id > 0 ? req.query.account_id : null,
    account_key: req.query.account_key && req.query.account_key > 0 ? req.query.account_key : null,
    transaction_type_id: req.query.transaction_type_id && req.query.transaction_type_id > 0 ? req.query.transaction_type_id : null,
    start_date: req.query.start_date && req.query.start_date != '' ? req.query.start_date : null,
    end_date: req.query.end_date && req.query.end_date != '' ? req.query.end_date : null,
    page_index: req.query.page_index && req.query.page_index > 0 ? req.query.page_index : null,
    page_size: req.query.page_size && req.query.page_size > 0 ? req.query.page_size : null
  }, function(err, activity) {
    if (err) {
      res.send(err);
    } else {
      res.json({
        error: false,
        data: activity,
        message: 'Activity logs successfully returned',
        data: activity
      });
    }
  });
};
