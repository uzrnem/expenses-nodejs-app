'use strict';

const Statement = require('../models/statement.model');

exports.findAll = function(req, res) {
  console.log('Statement Controller: List call')
  Statement.findAll(function(err, result) {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
};

exports.monthly = function(req, res) {
  console.log('Statement Controller: Monthly call')
  Statement.monthly(req.params.duration, function(err, result) {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
};

exports.passbook = function(req, res) {
  console.log('Statement Controller: Passbook call')
  Statement.passbook(req.params.duration, function(err, result) {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
};

exports.create = function(req, res) {
  console.log('Statement Controller: Add call')
  const new_statement = new Statement(req.body);

  //handles null error
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(400).send({
      error: true,
      message: 'Please provide all required field'
    });
  } else {
    Statement.create(new_statement, function(err, statement) {
      if (err) {
        res.send(err);
      } else {
        res.json({
          error: false,
          message: "Statement added successfully!",
          data: statement
        });
      }
    });
  }
};

exports.findById = function(req, res) {
  console.log('Statement Controller: Get call')
  Statement.findById(req.params.id, function(err, statement) {
    if (err) {
      res.send(err);
    } else {
      res.json(statement);
    }
  });
};

exports.update = function(req, res) {
  console.log('Statement Controller: Update call')
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(400).send({
      error: true,
      message: 'Please provide all required field'
    });
  } else {
    Statement.update(req.params.id, new Statement(req.body), function(err, statement) {
      if (err) {
        res.send(err);
      } else {
        res.json({
          error: false,
          message: 'Statement successfully updated'
        });
      }
    });
  }
};

exports.delete = function(req, res) {
  console.log('Statement Controller: Delete call')
  Statement.delete(req.params.id, function(err, statement) {
    if (err) {
      res.send(err);
    } else {
      res.json({
        error: false,
        message: 'Statement successfully deleted'
      });
    }
  });
};
