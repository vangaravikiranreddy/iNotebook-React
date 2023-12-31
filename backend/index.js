const connectToMongo = require('./db');
const express = require('express')
var cors = require('cors')

connectToMongo()
    .then(() => {
        const app = express()
        const port = 9000

        app.use(express.json())
        app.use(cors())

        // Available Routes
        app.use('/api/auth', require('./routes/auth'))
        app.use('/api/notes', require('./routes/notes'))

        app.listen(port, () => {
            console.log(`iNoteBook backend app listening at http://localhost:${port}`)
        })
    })
    .catch(error => console.error("Error connecting to MongoDB:", error));