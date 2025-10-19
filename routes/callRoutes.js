const express = require('express');
const callController = require('../controllers/callController');
const authController = require('../controllers/authController');

const router = express.Router();

// Public route for creating callback requests
router.post('/', callController.createCallbackRequest);

// Protected admin routes
router.use(authController.protect);
router.use(authController.restrictTo('admin'));

router.get('/', callController.getCallbackRequests);
router.delete('/:id', callController.deleteCallbackRequest);

module.exports = router;
