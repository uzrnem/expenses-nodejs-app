'use strict';

const AccountType = require('../models/account_type.model');

exports.findAll = function(req, res) {
  console.log('AccountType Controller: List call')
  AccountType.findAll(function(err, accountType) {
    if (err) {
      res.send(err);
    } else {
      res.json(accountType);
    }
  });
};

exports.create = function(req, res) {
  console.log('AccountType Controller: Add call')
  const new_accountType = new AccountType(req.body);

  //handles null error
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(400).send({
      error: true,
      message: 'Please provide all required field'
    });
  } else {
    AccountType.create(new_accountType, function(err, accountType) {
      if (err) {
        res.send(err);
      } else {
        res.json({
          error: false,
          message: "AccountType added successfully!",
          data: accountType
        });
      }
    });
  }
};

exports.findById = function(req, res) {
  console.log('AccountType Controller: Get call')
  AccountType.findById(req.params.id, function(err, accountType) {
    if (err) {
      res.send(err);
    } else {
      res.json(accountType);
    }
  });
};

exports.update = function(req, res) {
  console.log('AccountType Controller: Update call')
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(400).send({
      error: true,
      message: 'Please provide all required field'
    });
  } else {
    AccountType.update(req.params.id, new AccountType(req.body), function(err, accountType) {
      if (err) {
        res.send(err);
      } else {
        res.json({
          error: false,
          message: 'AccountType successfully updated',
          data: accountType
        });
      }
    });
  }
};

exports.delete = function(req, res) {
  console.log('AccountType Controller: Delete call')
  AccountType.delete(req.params.id, function(err, accountType) {
    if (err) {
      res.send(err);
    } else {
      res.json({
        error: false,
        message: 'AccountType successfully deleted',
        data: accountType
      });
    }
  });
};
