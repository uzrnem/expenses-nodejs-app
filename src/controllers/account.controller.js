'use strict';

const Account = require('../models/account.model');

exports.findAll = function(req, res) {
  var allAccounts = req.query.all_accounts ? true : false;
  console.log('Account Controller: List call, all_accounts:', allAccounts);
  Account.findAll(allAccounts, function(err, account) {
    if (err) {
      res.send(err);
    } else {
      res.json(account);
    }
  });
};

exports.frequent = function(req, res) {
  console.log('Account Controller: frequent call');
  Account.frequent( function(err, account) {
    if (err) {
      res.send(err);
    } else {
      res.json(account);
    }
  });
};

exports.create = function(req, res) {
  console.log('Account Controller: Add call')
  const new_account = new Account(req.body);

  //handles null error
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(400).send({
      error: true,
      message: 'Please provide all required field'
    });
  } else {
    Account.create(new_account, function(err, account) {
      if (err) {
        res.send(err);
      } else {
        res.json({
          error: false,
          message: "Account added successfully!",
          data: account
        });
      }
    });
  }
};

exports.findById = function(req, res) {
  console.log('Account Controller: Get call')
  Account.findById(req.params.id, function(err, account) {
    if (err) {
      res.send(err);
    } else {
      res.json(account);
    }
  });
};

exports.findByType = function(req, res) {
  console.log('Account Controller: Get By Type call')
  Account.findByType(req.params.account_type, function(err, account) {
    if (err) {
      res.send(err);
    } else {
      res.json(account);
    }
  });
};

exports.update = function(req, res) {
  console.log('Account Controller: Update call')
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(400).send({
      error: true,
      message: 'Please provide all required field'
    });
  } else {
    Account.update(req.params.id, new Account(req.body), function(err, account) {
      if (err) {
        res.send(err);
      } else {
        res.json({
          error: false,
          message: 'Account successfully updated'
        });
      }
    });
  }
};

exports.delete = function(req, res) {
  console.log('Account Controller: Delete call')
  Account.delete(req.params.id, function(err, account) {
    if (err) {
      res.send(err);
    } else {
      res.json({
        error: false,
        message: 'Account successfully deleted'
      });
    }
  });
};

exports.share = function(req, res) {
  console.log('Account Controller: chart.share call');
  Account.share( function(err, account) {
    if (err) {
      res.send(err);
    } else {
      res.json(account);
    }
  });
};

exports.expenses = function(req, res) {
  console.log('Account Controller: chart.expenses call');
  Account.expenses(req.params.year, req.params.month, function(err, account) {
    if (err) {
      res.send(err);
    } else {
      res.json(account);
    }
  });
};
