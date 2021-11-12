import axios from 'axios'
import getLocation from '../lib/getLocation.js'

async function setGeolocation(id, location) {
  await axios.post(process.env.HASURA_GRAPH_URL,
    {
      variables: { id, location },
      query: `
      mutation update($id: Int, $location: String) {
        update_locations(where: { id: { _eq: $id } }, _set: { geolocation: $location }) {
          affected_rows
          returning {
            id
            notes
          }
        }
      }
      `
    },
    {
      headers: {
        'x-hasura-admin-secret': process.env.HASURA_ADMIN_TOKEN
      }
    })
}

export default async function geocode(req, res, next) {
  if(req.headers['x-token'] !== process.env.API_REQUEST_TOKEN) {
    res.status(401).json({ success: false })
    return
  }

  try {
    const { id, address, geolocation } = req.body.event.data.new
    if (address) {
      if (geolocation) {
        console.log('Address already geocoded:', address)
        res.status(304).json({ success: true })
        return
      }

      const geo = await getLocation(address)
      console.log('Geocoded address:', address, geo.location)
      await setGeolocation(id, geo.location)
    }

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(400).json({ success: false })
  }
}
