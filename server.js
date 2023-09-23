//====================== imports =========================
const express = require('express');
const connectDB = require('./db.js');
const cors = require('cors');
const userRouter = require('./routes/user-routes.js');
const chatRouter = require('./routes/chat-routes.js')
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

app.use(errorMiddleware)

//====================== test route =========================

app.get('/', (req, res) => {
    res.send('Api working...')
})

//========================== listen =============================
app.listen(PORT, () => {
    console.log(`Server running at: http://localhost:${PORT}`)
})

