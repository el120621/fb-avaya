const express = require('express')
const router = express.Router()

const facebook_controller = require('../controllers/facebookWebhook')
// receive GET request from Facebook
// only used once for verification of webhook by Facebook
router.route('/')
    .get(facebook_controller.verifyWebhook)
    .post(facebook_controller.webhookFacebook)

module.exports = router