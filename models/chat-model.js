const mongoose = require('mongoose')

const schema = {
    chatName: {
        type: String,
        trim: true
    },
    isGroupChat:{
        type: Boolean,
        default: false
    },
    users:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    latestMessage:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
    groupAdmin:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}

const chatSchema = new mongoose.Schema(schema, { timestamps: true })

const ChatModel = mongoose.model("Chat", chatSchema)

module.exports = ChatModel