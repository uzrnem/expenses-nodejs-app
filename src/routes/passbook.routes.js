const express = require('express')
const router = express.Router()
const passbookController = require('../controllers/passbook.controller');

// Retrieve all employees
router.get('/', passbookController.findAll);

// Create a new employee
router.post('/', passbookController.create);

// Retrieve a single employee with id
router.get('/:id', passbookController.findById);

// Update a employee with id
router.put('/:id', passbookController.update);

// Delete a employee with id
router.delete('/:id', passbookController.delete);

router.get('/accounts/:account_id', passbookController.accounts);

module.exports = router
