const express = require('express');
const { protected } = require('../middlewares/auth-middleware.js')
const chatController = require('../controllers/chat-controller.js')


const router = express.Router();

router.route('/test').get((req, res) => {
    res.json({ url: req.url })
})

router.route('/').post(protected, chatController.accessChat).get(protected, chatController.fetchChats)
router.route('/group/create').post(protected, chatController.createGroup)
router.route('/group/rename-chat').put(protected, chatController.renameGroup)
router.route('/group/remove-user').put(protected, chatController.removeUserFromGroup)
router.route('/group/add-user').put(protected, chatController.addUserToGroup)

module.exports = router

