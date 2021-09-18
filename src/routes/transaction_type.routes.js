const express = require('express')
const router = express.Router()
const transactionTypeController = require('../controllers/transaction_type.controller');

// Retrieve all transactionTypes
router.get('/', transactionTypeController.findAll);

// Create a new transactionType
router.post('/', transactionTypeController.create);

// Retrieve a single transactionType with id
router.get('/:id', transactionTypeController.findById);

// Update a transactionType with id
router.put('/:id', transactionTypeController.update);

// Delete a transactionType with id
router.delete('/:id', transactionTypeController.delete);

module.exports = router
