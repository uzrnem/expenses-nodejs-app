const express = require('express')
const router = express.Router()
const transactionTypeController = require('../controllers/transaction_type.controller');

// Retrieve all employees
router.get('/', transactionTypeController.findAll);

// Create a new employee
router.post('/', transactionTypeController.create);

// Retrieve a single employee with id
router.get('/:id', transactionTypeController.findById);

// Update a employee with id
router.put('/:id', transactionTypeController.update);

// Delete a employee with id
router.delete('/:id', transactionTypeController.delete);

module.exports = router
