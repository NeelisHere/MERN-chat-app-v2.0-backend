const { ErrorHandler } = require('../middlewares/error-middleware.js');
const ChatModel = require('../models/chat-model.js');
const UserModel = require('../models/user-model.js');

class ChatController {
    async accessChat(req, res, next) {
        // get a chat/create a chat if not present (not a group chat)
        const { userId } = req.body
        // id of the target-user
        if (!userId) {
            next(new ErrorHandler('Invalid user', 400))
        }
        try {
            let existingChat = await ChatModel.find({
                isGroupChat: false,
                $and: [
                    { users: { $elemMatch: { $eq: req.user._id } } },
                    { users: { $elemMatch: { $eq: userId } } },
                ]
            }).populate('users', '-password').populate('latestMessage')

            existingChat = await UserModel.populate(existingChat, {
                path: 'latestMessage.sender',
                select: 'username avatar email'
            })

            if (existingChat.length > 0) {
                return res.json({
                    success: true,
                    chat: existingChat[0]
                })
            } else {
                const newChat = await ChatModel.create({
                    chatName: 'sender',
                    isGroupChat: false,
                    users: [userId, req.user._id]
                })
                const chat = await ChatModel.findById(newChat._id).populate('users', '-password')
                return res.json({ success: true, chat })
            }
        } catch (error) {
            next(new ErrorHandler())
        }
    }

    async fetchChats(req, res, next) {
        try {
            await ChatModel.find({ users: { $elemMatch: { $eq: req.user._id } } })
                .populate('users', '-password')
                .populate('groupAdmin', '-password')
                .populate('latestMessage')
                .sort({ updatedAt: -1 })
                .then(async (result) => {
                    result = await UserModel.populate(result, {
                        path: 'latestMessage.sender',
                        select: 'username avatar email',
                    })
                    res.status(200).json({
                        success: true,
                        myChats: result
                    })
                })
        } catch (error) {
            next(new ErrorHandler('Error fetching chat', 400))
        }
    }

    async createGroup(req, res, next) {
        let { chatName, users } = req.body
        if (!chatName || !users) {
            next(new ErrorHandler('All fields are required!', 400))
        }
        users = JSON.parse(users)
        if (users.length < 2) {
            next(new ErrorHandler('Group should have >2 users.', 400));
        }
        users.push(req.user)
        try {
            const newGroup = await ChatModel.create({
                chatName,
                users,
                isGroupChat: true,
                groupAdmin: req.user
            })

            const fullGroup = await ChatModel.findById(newGroup._id)
                .populate('users', '-password')
                .populate('groupAdmin', '-password')

            res.status(200).json({
                success: true,
                groupChat: fullGroup
            })

        } catch (error) {
            next(new ErrorHandler())
        }
    }

    async renameGroup(req, res, next) {
        const { chatId, newChatName } = req.body
        try {
            const updatedChat = await ChatModel.findByIdAndUpdate(
                chatId, { chatName: newChatName }, { new: true }
            )
            .populate('users', '-password')
            .populate('groupAdmin', '-password')
            res.json({
                success: true,
                updatedChat
            })
        } catch (error) {
            next(new ErrorHandler('Error renaming chat', 400))
        }
    }

    async removeUserFromGroup(req, res, next) {
        const { chatId, userId } = req.body
        try {
            const updatedChat = await ChatModel.findByIdAndUpdate(
                chatId, { $pull: { users: userId } }, { new: true }
            )
            .populate('users', '-password')
            .populate('groupAdmin', '-password')
            res.json({
                success: true,
                updatedChat
            })
        } catch (error) {
            next(new ErrorHandler('Error renaming chat', 400))
        }
    }

    async addUserToGroup(req, res, next) {
        const { chatId, userId } = req.body
        try {
            const updatedChat = await ChatModel.findByIdAndUpdate(
                chatId, { $push: { users: userId } }, { new: true }
            )
            .populate('users', '-password')
            .populate('groupAdmin', '-password')
            res.json({
                success: true,
                updatedChat
            })
        } catch (error) {
            next(new ErrorHandler('Error renaming chat', 400))
        }
    }

    async editGroupPhoto(req, res, next) {
        const { chatId, photo } = req.body
        try {
            const groupChat = await ChatModel.findById(chatId)
            groupChat.photo = photo
            await groupChat.save()
            res.json({ success: true, updatedChat: groupChat })
        } catch (error) {
            next(new ErrorHandler())
        }
    }
}

module.exports = new ChatController()