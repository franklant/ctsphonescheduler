const express = require('express')
const http = require('http')
const fs = require('fs')

const PORT = 5120
const INDEX_PATH = "./index.html"

const app = express()

app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

/// ROUTES (GET)
app.get("/", (req, res) => {
    // READ THE INDEX FILE AND SEND IT IN THE RESPONSE
    fs.readFile(INDEX_PATH, (error, data) => {
        if (error) {
            res.status(404)
            res.send("404 Page could not be found")
        } else {
            res.status(200)
            res.send(data)
        }
    })
})

/// OPEN PORT, LISTEN TO SERVER
app.listen(
    PORT,
    (error) => {
        console.log(`Listening on port ${PORT}`)
    }
)