const express = require('express')
const router = express.Router()
const passbookController = require('../controllers/passbook.controller');

// Retrieve all passbooks
router.get('/', passbookController.findAll);

// Create a new passbook
router.post('/', passbookController.create);

// Retrieve a single passbook with id
router.get('/:id', passbookController.findById);

// Update a passbook with id
router.put('/:id', passbookController.update);

// Delete a passbook with id
router.delete('/:id', passbookController.delete);

router.get('/accounts/:account_id', passbookController.accounts);

module.exports = router
