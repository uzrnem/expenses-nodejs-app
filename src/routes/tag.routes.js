const express = require('express')
const router = express.Router()
const tagController = require('../controllers/tag.controller');

// Retrieve all tags
router.get('/', tagController.findAll);

// Create a new tag
router.post('/', tagController.create);

// Retrieve a single tag with id
router.get('/:id', tagController.findById);

// Update a tag with id
router.put('/:id', tagController.update);

// Delete a tag with id
router.delete('/:id', tagController.delete);

router.get('/transactions/hits', tagController.transactionTypes);

module.exports = router
