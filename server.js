//====================== imports =========================
const express = require('express');
const connectDB = require('./db.js');
const cors = require('cors');
const userRouter = require('./routes/user-routes.js');
const chatRouter = require('./routes/chat-routes.js')
const messageRouter = require('./routes/message-routes.js')
require('dotenv').config();
const { errorMiddleware } = require('./middlewares/error-middleware.js')

//====================== initializations =========================
const PORT = process.env.PORT
const app = express();
connectDB()

//====================== middlewares =========================
app.use(cors({
    origin: [process.env.FRONTEND_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}))


app.use(express.json());
app.use('/api/v2/users', userRouter)
app.use('/api/v2/chats', chatRouter)
app.use('/api/v2/messages', messageRouter)

app.use(errorMiddleware)

//====================== test route =========================

app.get('/', (req, res) => {
    res.send('Api working...')
})

//========================== listen =============================
const server = app.listen(PORT, () => {
    console.log(`Server running at: http://localhost:${PORT}`)
})


const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL
    }
})

const userToSocketMap = {}

const getUserIdFromSocketId = (socketId) => {
    const socketIds = Object.values(userToSocketMap)
    const userIds = Object.keys(userToSocketMap)
    const index = socketIds.indexOf(socketId)
    return userIds[index]
}

io.on('connection', (socket) => {
    console.log('connected to socket.io')

    socket.on('JOIN_ROOM_REQ', (user) => {
        // console.log('JOIN_ROOM_REQ', user)
        userToSocketMap[user._id] = socket.id
        socket.join(user._id) // user joins a personal-room with id=userId
        socket.emit('JOIN_ROOM_RES', {
            socketId: socket.id,
            roomId: user._id
        })
    })

    socket.on('JOIN_CHAT_REQ', ({ roomId }) => {
        // console.log('JOIN_CHAT_REQ', roomId)
        socket.join(roomId) // user joins a common room, roomID == chatId
        console.log(`User joined room: ${roomId}`)
        socket.emit('JOIN_CHAT_RES', { 
            success: true,
            chatId: roomId,
        })
    })

    socket.on('NEW_MESSAGE_REQ', ({ message, chat }) => {
        // console.log('NEW_MESSAGE_REQ',message)
        chat.users.forEach((user) => {
            const socketId = userToSocketMap[user._id]
            io.to(socketId).emit('NEW_MESSAGE_RES', {
                message,
                chat
            })
        })
    })
    
    socket.on('NOTIFY_REQ', ({ sender, receiver, chat }) => {
        // console.log('notify req from:', receiver._id)
        io.to(userToSocketMap[receiver._id]).emit('NOTIFY_RES', { 
            // sender and reciever of the original message
            sender,
            receiver,
            chat
        })
    })

    socket.on("disconnect", (reason) => {
        const userId = getUserIdFromSocketId(socket.id)
        delete userToSocketMap[userId]
        console.log('Disconnected user: ', socket.id)
    });
})