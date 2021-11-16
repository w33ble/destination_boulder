import gqlQuery from './gqlQuery.js'
import { Loader } from 'https://cdn.jsdelivr.net/npm/@googlemaps/js-api-loader@1.12.9/dist/index.esm.js'

document.addEventListener('alpine:init', async () => {
  Alpine.data('maps', () => ({
    loaded: false,
    async init() {
      // initialize google maps
      const options = {
        center: {
          lat: 40.0289103,
          lng: -105.2377461,
        },
        zoom: 11,
      }
      const loader = new Loader({
        apiKey: "AIzaSyDdxXbvuh1sCOR8rA6p1D6AQjI6EoGBUvM",
        version: "weekly",
        libraries: ["places"]
      });
      const google = await loader.load()

      new google.maps.Map(document.getElementById("mapTarget"), options);
      this.loaded = true
    },
  }))

  try {
    const client = gqlQuery('https://intense-sparrow-57.hasura.app/v1/graphql')
    const res2 = await client(`
      query getalllocations {
        locations {
          address
          geolocation
          title
          url
          id
          notes
        }
      }
    `)
    console.log(res2)
  } catch (error) {
    console.error(error)
  }
})
