const mongoose = require('mongoose')

const schema = {
    username:{
        type: String,
        unique: true,
        required: true
    },
    email:{
        type: String,
        unique: true,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    avatar:{
        type: String
    },
    backgroundImage: {
        type: String,
        default: 'https://icon-library.com/images/141782.svg.svg'
    },
}
const userSchema = new mongoose.Schema(schema)

const UserModel = mongoose.model('User', userSchema)

module.exports = UserModel