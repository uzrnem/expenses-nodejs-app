const express = require('express')
const router = express.Router()
const tagController = require('../controllers/tag.controller');

// Retrieve all employees
router.get('/', tagController.findAll);

// Create a new employee
router.post('/', tagController.create);

// Retrieve a single employee with id
router.get('/:id', tagController.findById);

// Update a employee with id
router.put('/:id', tagController.update);

// Delete a employee with id
router.delete('/:id', tagController.delete);

router.get('/transactions/:from/:to', tagController.transactionTypes);

module.exports = router
