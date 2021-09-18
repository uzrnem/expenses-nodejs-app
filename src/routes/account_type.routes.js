const express = require('express')
const router = express.Router()
const accountTypeController = require('../controllers/account_type.controller');

// Retrieve all employees
router.get('/', accountTypeController.findAll);

// Create a new employee
router.post('/', accountTypeController.create);

// Retrieve a single employee with id
router.get('/:id', accountTypeController.findById);

// Update a employee with id
router.put('/:id', accountTypeController.update);

// Delete a employee with id
router.delete('/:id', accountTypeController.delete);

module.exports = router
