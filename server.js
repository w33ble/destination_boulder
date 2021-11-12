import express from 'express'
import posthtml from 'express-posthtml'
import phdoctype from 'posthtml-doctype'
import phhash from 'posthtml-hash'
import phlazyload from 'posthtml-lazyload'
import phnoopener from 'posthtml-noopener'
import phnoscript from 'posthtml-noscript'
import phmodules from 'posthtml-modules'

const port = process.env.PORT || 8080

const app = express()
app.engine('html', posthtml)

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
  // "posthtml-doctype": {
  //   "doctype": "HTML 5"
  // },
  // "posthtml-hash": {
  //   "path": "public",
  //   "hashLength": 8
  // },
  // "posthtml-include": {},
  // "posthtml-lazyload": {},
  // "posthtml-noopener": {},
  // "posthtml-noscript": {
  //   "content": "You need to enable JavaScript to get the most out of this app."
  // },
  // "posthtml-w3c": {}
// }
app.set('views', 'src/views')
app.set('view options', { plugins: plugins, options: options })

app.get('/', (req, res) => res.render('index.html'))
app.get('/maps', (req, res) => res.render('maps.html'))

app.use(express.static('src/public', { fallthrough: false }))

app.listen(port)

console.log(`Server listening on port ${port}`)