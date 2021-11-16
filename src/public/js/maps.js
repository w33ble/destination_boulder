import gqlQuery from './gqlQuery.js'

document.addEventListener('alpine:init', async () => {
  Alpine.data('maps', () => ({
    loaded: false,
    map: null,
    async init() {
      // initialize google maps
      const options = {
        center: {
          lat: 40.0289103,
          lng: -105.2377461,
        },
        zoom: 9,
      }


      mapboxgl.accessToken = 'pk.eyJ1IjoidzMzYmxlIiwiYSI6ImNrdzJpa2RjdjBkejEycXA4ajZvODM4MnYifQ.WI0Ma64icuiJ7CtjycEWdw'

      this.$nextTick(() => {
        this.map = new mapboxgl.Map({
          container: 'mapTarget', // container ID
          style: 'mapbox://styles/mapbox/streets-v11', // style URL
          center: [options.center.lng, options.center.lat], // starting position [lng, lat]
          zoom: options.zoom // starting zoom
        });
        this.loaded = true

        new mapboxgl.Marker()
          .setLngLat([options.center.lng, options.center.lat])
          .addTo(this.map);
      })
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
