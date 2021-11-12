import express from 'express'
import posthtml from 'express-posthtml'
import phdoctype from 'posthtml-doctype'
import phhash from 'posthtml-hash'
import phlazyload from 'posthtml-lazyload'
import phnoopener from 'posthtml-noopener'
import phnoscript from 'posthtml-noscript'
import phmodules from 'posthtml-modules'
import router from './router.js'

const port = process.env.PORT || 8080

const app = express()
app.engine('html', posthtml)

// configure posthtml
const plugins = [
  phdoctype({
    "doctype": "HTML 5"
  }),
  phhash.default({
    "path": "public",
    "hashLength": 8
  }),
  phmodules(),
  phlazyload(),
  phnoopener.default(),
  phnoscript.default({
    "content": "You need to enable JavaScript to get the most out of this app."
  }),
]
const options = {}
app.set('views', 'src/views')
app.set('view options', { plugins: plugins, options: options })

// add middleware
app.use(express.json())

// route to api endpoints
app.use(router)

// set up static file handling
app.use(express.static('src/public', { fallthrough: false }))

// start server
app.listen(port)
console.log(`Server listening on port ${port}`)
