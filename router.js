import express from 'express'
import geocodeApi from './api/geocode.js'

const router = express.Router()

// serve up html pages
router.get('/', (req, res) => res.render('index.html'))
router.get('/maps', (req, res) => res.render('maps.html'))

// api endpoints
router.post('/api/geocode', geocodeApi)

export default router
