const express = require('express')
const router = express.Router()
const accountController = require('../controllers/account.controller');

// Retrieve all employees
router.get('/', accountController.findAll);

// Create a new employee
router.post('/', accountController.create);

// Retrieve a single employee with id
router.get('/:id', accountController.findById);

// Update a employee with id
router.put('/:id', accountController.update);

// Delete a employee with id
router.delete('/:id', accountController.delete);

router.get('/frequent/list', accountController.frequent);

router.get('/chart/share', accountController.share);

router.get('/chart/expenses/:year/:month', accountController.expenses);

module.exports = router
