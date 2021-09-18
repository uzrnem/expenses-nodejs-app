const express = require('express')
const router = express.Router()
const accountTypeController = require('../controllers/account_type.controller');

// Retrieve all accountTypes
router.get('/', accountTypeController.findAll);

// Create a new accountType
router.post('/', accountTypeController.create);

// Retrieve a single accountType with id
router.get('/:id', accountTypeController.findById);

// Update a accountType with id
router.put('/:id', accountTypeController.update);

// Delete a accountType with id
router.delete('/:id', accountTypeController.delete);

module.exports = router
