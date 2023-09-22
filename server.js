const express = require('express');
require('dotenv').config();


const PORT = process.env.PORT

const app = express();

app.get('/', (req, res) => {
    res.send('Api working...')
})


app.listen(PORT, () => {
    console.log(`Server running at: http://localhost:${PORT}`)
})

