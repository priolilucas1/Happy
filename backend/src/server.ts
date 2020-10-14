import express from 'express'
import routes from './routes'

import path from 'path'
import './database/connection'

const app= express();
app.use(express.json())
app.use(routes)
app.use('/uploads', express.static(path.join(__dirname,'..','uploads')))

app.listen(3333)