const mongoose = require('mongoose')

/*
No need of receivers, we know the sender & the chatId.
Everybody else would be reciever. That way we don't 
have to create an array of receivers.
*/

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
    },
    deleteFor: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
}

const messageSchema = new mongoose.Schema(schema, { timestamps: true })

const MessageModel = mongoose.model("Message", messageSchema)

module.exports = MessageModel