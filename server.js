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
        origin: 'http://localhost:3000'
    }
})

io.on('connection', (socket) => {
    console.log('connected to socket.io')

    socket.on('JOIN_ROOM_REQ', (userData) => {
        // console.log(userData)
        socket.join(userData._id) // user joins a personal-room with id=userId
        socket.emit('JOIN_ROOM_RES', {
            socketId: socket.id,
            roomId: userData._id
        })
    })

    socket.on('JOIN_CHAT_REQ', ({ roomId }) => {
        socket.join(roomId) // user joins a common room, roomID == chatId
        console.log(`User joined room: ${roomId}`)
        socket.emit('JOIN_CHAT_RES', { 
            success: true,
            chatId: roomId,
            users: Array.from(io.sockets.adapter.rooms.get(roomId) || [])
        })
    })

    socket.on('NEW_MESSAGE_REQ', ({ roomId, message }) => {
        // console.log(`New message: ${message}`)
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
        clients.forEach((clientId) => {
            io.to(clientId).emit('NEW_MESSAGE_RES', {
                chatId: roomId,
                message
            })
        })
    })

    socket.on("disconnect", (reason) => {
        // const targetEmail = emailToSocketMapping[socket.id]
        // const targetSID = socketToEmailMapping[targetEmail]
        // delete emailToSocketMapping[targetEmail]
        // delete socketToEmailMapping[targetSID]
        console.log('Disconnected user: ', socket.id)
    });
})