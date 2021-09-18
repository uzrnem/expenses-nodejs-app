const express = require('express')
const router = express.Router()
const activityController = require('../controllers/activity.controller');

// Retrieve all employees
router.get('/', activityController.findAll);

// Create a new employee
router.post('/', activityController.create);

// Retrieve a single employee with id
router.get('/:id', activityController.findById);

// Update a employee with id
router.put('/:id', activityController.update);

// Delete a employee with id
router.delete('/:id', activityController.delete);

router.get('/passbook/log', activityController.log);
module.exports = router
