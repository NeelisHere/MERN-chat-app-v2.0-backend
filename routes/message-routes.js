const express = require('express');
const { protected } = require('../middlewares/auth-middleware')
const messageController = require('../controllers/message-controller.js')

const router = express.Router()

router.route('/test').post(protected, (req, res) => {
    res.json({
        ...req.body,
        success: true
    })
})

router.route('/').post(protected, messageController.sendMessage)
router.route('/:chatId').get(protected, messageController.allMessages)
router.route('/edit').put(protected, messageController.editMessages)
router.route('/delete').put(protected, messageController.deleteMessages)

module.exports = router