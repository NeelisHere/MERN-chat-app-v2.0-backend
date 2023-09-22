const UserModel = require('../models/user-model')
const { Errorhandler, ErrorHandler } = require('../middlewares/error-middleware.js')
const { generateToken } = require('../services/token-services.js')
const bcrypt = require('bcrypt')

class UserController {

    async login(req, res, next) {
        const { username, password } = req.body
        try {
            const user = await UserModel.findOne({ username }).select('+password')
            const isMatch = await bcrypt.compare(password, user.password)
            if (user && isMatch) {
                res.json({
                    success: true,
                    user,
                    token: generateToken(user._id)
                })
            } else {
                next(new Errorhandler('Invalid username or password', 401))
            }
        } catch (error) {
            next(new Errorhandler())
        }
    }

    async register(req, res, next) {
        console.log('register')
        const { username, email, password } = req.body
        try {
            const userExists = await UserModel.findOne({ username })
            if (userExists) {
                next(new Errorhandler('User exists!', 400))
            }
            const hash = await bcrypt.hash(password, 10)
            const { _doc: user } = await UserModel.create({ username, email, password: hash })
            if (user) {
                res.status(201).json({
                    success: true,
                    user: { ...user, token: generateToken(user._id) }
                })
            } else {
                next(new Errorhandler('Failed to create user.', 400))
            }
        } catch (error) {
            next(new Errorhandler())
        }
    }

    async searchUsers(req, res, next) {
        const keyword = req.query.search ? {
            $or: [
                { username: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } }
            ]
        } : {}
        const users = await UserModel.find(keyword).find({ _id: { $ne: req.user._id } })
        res.json({
            success: true,
            users
        })
    }

    async getUserProfile(req, res, next) {
        const { userId } = req.params
        try {
            const user = await UserModel.findById(userId).select('-backgroundImage').select('-password')
            res.json({ success: true, user })
        } catch (error) {
            next(new ErrorHandler('Could not find user!', 401))
        }
    }

    async getMyProfile(req, res, next) {
        res.json({
            success: true,
            me: req.user
        })
    }
}

module.exports = new UserController()

