const express = require('express')
//https://www.npmjs.com/package/bookmark-parser (29/10/2020)
const BMParser = require('bookmarks-parser')
const MozParser = require('bookmark-parser')
const fs = require('fs')

const dotenv = require('dotenv')
dotenv.config()

const path = require('path')

const app = express()

//middleware
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }))
app.use(bodyParser.json({ limit: '50mb' }))

const cors = require('cors')
app.use(cors())

app.use(express.static('dist'))

let PORT = process.env.PORT
if(PORT == null || PORT == '') {
    PORT = 8000
}
app.listen(PORT, () => {
    console.log('server running on port 8000')
})

app.get('/', (req, res) => {
    res.sendFile(path.resolve('src/index.html'))
})

//TODO: may also need to use 'path' package to form correct file paths when live
app.post('/read', (req, res) => {
    console.log('server read file body:', req.body)

    BMParser(req.body.page, (err, response) => {
        if(err) {
            console.log('error parsing file text', err)
            res.send(err)
        }

        console.log(response.bookmarks)
        res.send(response.bookmarks)
    })
})

app.get('/readMoz', (req, res) => {
    const defaultFolder = fs.readdirSync(path.relative(__dirname, '../AppData/Roaming/Mozilla/Firefox/Profiles')).map(folders => {
        if(folders.match(/default/)) {
            return folders
        }
    })

    const filePath = path.relative(__dirname, `../AppData/Roaming/Mozilla/Firefox/Profiles/${defaultFolder}/bookmarkbackups`)

    const latestFile = fs.readdirSync(filePath)
    .sort((a, b) => fs.statSync(`${filePath}/${b}`).mtime - fs.statSync(`${filePath}/${a}`).mtime)

    console.log('latest file:', latestFile[0])
    MozParser.readFromJSONLZ4File(`${filePath}/${latestFile[0]}`)
    .then((data) => {
        res.send(data)
    })
    .catch(err => {
        console.log('error parsing stream:', err)
    })
})

//TODO: for heroku get fs to grab correct filepath from computer and not where it's hosted
app.get('/readStream', (req, res) => {
    console.log('server read stream')
    fs.promises.readFile(path.relative(__dirname, '../AppData/Local/Google/Chrome/User Data/Default/Bookmarks'))
    .then((data) => {
        res.send(data)
    })
    .catch(err => {
        console.log('error parsing stream:', err)
    })
})