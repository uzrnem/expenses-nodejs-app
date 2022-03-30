const express = require('express')
const router = express.Router()
const accountController = require('../controllers/account.controller');

// Retrieve all accounts
router.get('/', accountController.findAll);

// Create a new account
router.post('/', accountController.create);

// Retrieve a single account with id
router.get('/:id', accountController.findById);
router.get('/type/:account_type', accountController.findByType);

// Update a account with id
router.put('/:id', accountController.update);

// Delete a account with id
router.delete('/:id', accountController.delete);

router.get('/frequent/list', accountController.frequent);

router.get('/chart/share', accountController.share);

router.get('/chart/expenses/:year/:month', accountController.expenses);

module.exports = router
