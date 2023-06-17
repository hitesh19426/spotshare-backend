const express = require('express')
const bodyParser = require('body-parser')
const placeRouter = require('./routes/places')
const userRouter = require('./routes/users')
const HttpError = require('./models/http-error')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()
app.use(bodyParser.json())

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
    next()
})

app.use('/api/places', placeRouter)
app.use('/api/users', userRouter)

app.use((req, res, next) => {
    return next(new HttpError('Could not find the route', 404));
})

app.use((error, req, res, next) => {
    if(res.headerSent){
        return next(error)
    }
    res.status(error.code || 500)
    res.json({message: error.message || 'Some unknown error occurred!'})
})

mongoose.connect(process.env.ATLAS_URI).then(() => {
    console.log('successfully connected to database');
}).catch((err) => {
    return console.log(err);
})

app.listen(5000, () => {
    console.log('listening to port ' + 5000)
})