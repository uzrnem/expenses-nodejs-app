'use strict';

const TransactionType = require('../models/transaction_type.model');

exports.findAll = function(req, res) {
  console.log('TransactionType Controller: List call')
  TransactionType.findAll(function(err, transactionType) {
    if (err) {
      res.send(err);
    } else {
      res.send(transactionType);
    }
  });
};

exports.create = function(req, res) {
  console.log('TransactionType Controller: Add call')
  const new_transactionType = new TransactionType(req.body);

  //handles null error
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(400).send({
      error: true,
      message: 'Please provide all required field'
    });
  } else {
    TransactionType.create(new_transactionType, function(err, transactionType) {
      if (err) {
        res.send(err);
      } else {
        res.json({
          error: false,
          message: "TransactionType added successfully!",
          data: transactionType
        });
      }
    });
  }
};

exports.findById = function(req, res) {
  console.log('TransactionType Controller: Get call')
  TransactionType.findById(req.params.id, function(err, transactionType) {
    if (err) {
      res.send(err);
    } else {
      res.json(transactionType);
    }
  });
};

exports.update = function(req, res) {
  console.log('TransactionType Controller: Update call')
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(400).send({
      error: true,
      message: 'Please provide all required field'
    });
  } else {
    TransactionType.update(req.params.id, new TransactionType(req.body), function(err, transactionType) {
      if (err) {
        res.send(err);
      } else {
        res.json({
          error: false,
          message: 'TransactionType successfully updated',
          data: transactionType
        });
      }
    });
  }
};

exports.delete = function(req, res) {
  console.log('TransactionType Controller: Delete call')
  TransactionType.delete(req.params.id, function(err, transactionType) {
    if (err) {
      res.send(err);
    } else {
      res.json({
        error: false,
        message: 'TransactionType successfully deleted',
        data: transactionType
      });
    }
  });
};
