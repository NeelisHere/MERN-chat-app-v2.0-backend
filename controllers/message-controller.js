const { ErrorHandler } = require("../middlewares/error-middleware");
const ChatModel = require("../models/chat-model");
const MessageModel = require("../models/message-model");
const UserModel = require("../models/user-model");

class MessageController {
    async sendMessage(req, res, next) {
        const { content, chatId } = req.body
        if (!content || !chatId) {
            next(new ErrorHandler('Invalid data passed!', 400))
        }
        const messagePayload = {
            sender: req.user._id,
            content,
            chat: chatId,
        }
        try {
            let message = await MessageModel.create(messagePayload)
            message = await message.populate('sender', 'username avatar email')
            message = await message.populate('chat')
            message = await UserModel.populate(message, {
                path: 'chat.users',
                select: 'username avatar email'
            })
            await ChatModel.findByIdAndUpdate(chatId, {
                latestMessage: message._id
            })
            return res.json({
                success: true,
                message
            })
        } catch (error) {
            next(new ErrorHandler())
        }
    }

    async allMessages(req, res, next) {
        const { chatId } = req.params
        try {
            const messages = await MessageModel.find({ chat: chatId })
                .populate('sender', 'username avatar email')
                .populate('chat')
            return res.json({
                success: true,
                messages
            })
        } catch (error) {
            next(new ErrorHandler())
        }
    }

    async editMessages(req, res, next) {
        const { messageId, updatedContent } = req.body
        try {
            const targetMessage = await MessageModel.findById(messageId)
            targetMessage.content = updatedContent
            await targetMessage.save()
            res.json({
                success: true,
                updatedMessage: targetMessage
            })
        } catch (error) {
            next(new ErrorHandler())
        }
    }

    async deleteMessages(req, res, next) {}
}

module.exports = new MessageController();