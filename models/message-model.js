const mongoose = require('mongoose')

const schema = {
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    content: {
        type: String,
        trim: true
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat"
    }
}

const messageSchema = new mongoose.Schema(schema, { timestamps: true })

const MessageModel = mongoose.model("Message", messageSchema)

module.exports = MessageModel