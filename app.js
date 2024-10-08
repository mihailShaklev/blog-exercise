const config = require('./utils/config')
const express = require('express')
const app = express()
require('express-async-errors')
const cors = require('cors')
const blogsRouter = require('./controllers/blogs')
const middleware = require('./utils/middleware')
const usersRouter = require('./controllers/users')
const logger = require('./utils/logger')
const loginRouter = require('./controllers/login')

const mongoose = require('mongoose')


mongoose.set('strictQuery', false)
mongoose.connect(config.MONGODB_URI)
    .then(() =>{
        logger.info('Connected to MongoDB!')
    })
    .catch(error => {
        logger.error('Error connecting to MongoDB:', error.message)
    })


app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)
app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
    
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)
    
module.exports = app