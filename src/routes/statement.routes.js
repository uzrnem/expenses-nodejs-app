const express = require('express')
const router = express.Router()
const statementController = require('../controllers/statement.controller');

// Retrieve all statements
router.get('/', statementController.findAll);
router.get('/monthly/:duration', statementController.monthly);
router.get('/passbook/:duration', statementController.passbook);
router.get('/bills/:duration', statementController.bills);

// Create a new statement
router.post('/', statementController.create);

// Retrieve a single statement with id
router.get('/:id', statementController.findById);

// Update a statement with id
router.put('/:id', statementController.update);

// Delete a statement with id
router.delete('/:id', statementController.delete);

module.exports = router
