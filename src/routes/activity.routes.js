const express = require('express')
const router = express.Router()
const activityController = require('../controllers/activity.controller');

// Retrieve all activities
router.get('/', activityController.findAll);

// Create a new activity
router.post('/', activityController.create);

// Retrieve a single activity with id
router.get('/:id', activityController.findById);

// Update a activity with id
router.post('/:id', activityController.update);

// Delete a activity with id
router.delete('/:id', activityController.delete);

router.get('/passbook/log', activityController.log);
module.exports = router
