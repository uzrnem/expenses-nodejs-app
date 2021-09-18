'use strict';

const Passbook = require('../models/passbook.model');

exports.findAll = function(req, res) {
  console.log('Passbook Controller: List call')
  Passbook.findAll(function(err, passbook) {
    if (err)
      res.send(err);
    res.send(passbook);
  });
};

exports.create = function(req, res) {
  console.log('Passbook Controller: Add call')
  const new_passbook = new Passbook(req.body);

  //handles null error
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(400).send({
      error: true,
      message: 'Please provide all required field'
    });
  } else {
    Passbook.create(new_passbook, function(err, passbook) {
      if (err)
        res.send(err);
      res.json({
        error: false,
        message: "Passbook added successfully!",
        data: passbook
      });
    });
  }
};

exports.findById = function(req, res) {
  console.log('Passbook Controller: Get call')
  Passbook.findById(req.params.id, function(err, passbook) {
    if (err)
      res.send(err);
    res.json(passbook);
  });
};

exports.update = function(req, res) {
  console.log('Passbook Controller: Update call')
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(400).send({
      error: true,
      message: 'Please provide all required field'
    });
  } else {
    Passbook.update(req.params.id, new Passbook(req.body), function(err, passbook) {
      if (err)
        res.send(err);
      res.json({
        error: false,
        message: 'Passbook successfully updated'
      });
    });
  }
};

exports.delete = function(req, res) {
  console.log('Passbook Controller: Delete call')
  Passbook.delete(req.params.id, function(err, passbook) {
    if (err)
      res.send(err);
    res.json({
      error: false,
      message: 'Passbook successfully deleted'
    });
  });
};

exports.accounts = function(req, res) {
  console.log('Passbook Controller: accounts call')
  Passbook.accounts(req.params.account_id, function(err, passbook) {
    if (err)
      res.send(err);
    res.json(passbook);
  });
};
