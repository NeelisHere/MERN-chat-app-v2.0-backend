const express = require('express');
const userController = require('../controllers/user-controller.js')
const { protected } = require('../middlewares/auth-middleware.js')

const router = express.Router()

router.post('/test', (req, res) => {
    console.log('Inside users routes')
    res.json(req.body)
})

router.post('/login', userController.login)
router.post('/register', userController.register)
router.get('/', protected, userController.searchUsers)
router.get('/me', protected, userController.getMyProfile)
router.get('/:userId', protected, userController.getUserProfile)

module.exports = router