import gqlQuery from './gqlQuery.js'

document.addEventListener('alpine:init', async () => {
  Alpine.data('maps', () => ({
    token: null,
    map: null,
    client: null,
    loaded: false,
    refreshing: false,
    points: [],
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
        this.token = window.localStorage.getItem('hasura-admin-secret')

        this.map = new mapboxgl.Map({
          container: 'mapTarget', // container ID
          style: 'mapbox://styles/mapbox/streets-v11', // style URL
          center: [options.center.lng, options.center.lat], // starting position [lng, lat]
          zoom: options.zoom // starting zoom
        });

        this.client = gqlQuery('https://intense-sparrow-57.hasura.app/v1/graphql')

        await this.getLocations()

        this.loaded = true
      })
    },
    async getLocations() {
      let locations = []

      try {
        this.refreshing = true

        this.clearPoints()

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
        this.refreshing = false
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

      this.points.push(marker)

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
    },
    clearPoints() {
      this.points.forEach(p => p.remove())
    },
    async addLocation() {
      // close the modal
      const myModal = bootstrap.Modal.getInstance(this.$refs.addLocationModal).hide()

      // grab form input values the lazy way
      const form = this.$refs.addLocationForm
      const inputs = form.querySelectorAll('input')
      const [title, address, url, cost, poi, notes] = Array.from(inputs).map((i) => i.checked || i.value)
      const isPOI = Boolean(poi)

      try {
        const res = await this.client(`
          mutation saveLocation($title: String, $address: String, $url: String, $notes: String, $price: numeric, $isPOI: Boolean) {
            insert_locations(objects: {
              title: $title
              address: $address
              url: $url
              notes: $notes
              price: $price
              isPOI: $isPOI
            }) {
              affected_rows
            }
          }
        `, {
          title, address, url, price: Number(cost) || null, isPOI, notes
        })
      } catch(error) {
        console.error(error)
        alert('Failed to add location, check the logs')
      }
    }
  }))
})
