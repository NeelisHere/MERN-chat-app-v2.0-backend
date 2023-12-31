const jwt = require("jsonwebtoken")
const UserModel = require("../models/user-model")
const { ErrorHandler } = require("./error-middleware")
const colors = require("colors")

const protected = async (req, res, next) => {
    console.log('auth middleware entered...'.blue)
    // console.log(req.body)
    if (
        req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            const token = req.headers.authorization.split(' ')[1]
            // console.log(req.headers.authorization)
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
            req.user = await UserModel.findById(decodedToken.id).select('-password')
            console.log('auth middleware passed...'.blue)
            next()
        } catch (error) {
            next(new ErrorHandler())
        }
    } else {
        next(new ErrorHandler('Invalid token!', 401))
    }
}

module.exports = {
    protected
};
