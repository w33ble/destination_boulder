import gqlQuery from './gqlQuery.js'

document.addEventListener('alpine:init', async () => {
  Alpine.data('maps', () => ({
    map: null,
    client: null,
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


      mapboxgl.accessToken = 'pk.eyJ1IjoidzMzYmxlIiwiYSI6ImNrdzJpa2RjdjBkejEycXA4ajZvODM4MnYifQ.WI0Ma64icuiJ7CtjycEWdw'

      this.$nextTick(async () => {
        this.map = new mapboxgl.Map({
          container: 'mapTarget', // container ID
          style: 'mapbox://styles/mapbox/streets-v11', // style URL
          center: [options.center.lng, options.center.lat], // starting position [lng, lat]
          zoom: options.zoom // starting zoom
        });

        this.client = gqlQuery('https://intense-sparrow-57.hasura.app/v1/graphql')

        this.loaded = true

        await this.getLocations()
      })
    },
    async getLocations() {
      let locations = []

      try {
        const res = await this.client(`
          query getalllocations {
            locations {
              address
              geolocation
              title
              url
              id
              notes
              price
              isPOI
            }
          }
        `)

        locations = res.data.locations
      } catch (error) {
        console.error(error)
        alert('Location query failed, check the logs')
        return
      }

      locations.forEach(l => this.addPoint(l))
    },
    addPoint(location) {
      const [lat, lng] = location.geolocation.split(',')
      const marker = new mapboxgl.Marker({
        color: location.isPOI ? '#633987' : '#2689AD'
      })
        .setLngLat([lng, lat])
        .addTo(this.map);

      if (location.isPOI) {
        marker.setPopup(new mapboxgl.Popup().setHTML(`<h3>${location.title}</h3>`))
      } else {
        marker.setPopup(new mapboxgl.Popup().setHTML(`<h3>${location.title}</h3>
        <p>${location.address}</p>
        ${location.price ? `<p><strong>$${location.price} / mo</strong></p>` : ''}
        ${location.notes ? `<p><em>${location.notes}</em></p>` : ''}
        <p><a target="_blank" rel="noopener noreferrer" href="${location.url}">${location.url.substring(0, 26)}...</a></p>
        `))
      }
    }
  }))
})
