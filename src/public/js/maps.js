import gqlQuery from './gqlQuery.js'
import debounce from 'https://cdn.jsdelivr.net/npm/tinybounce@1.2.0/dist/tinybounce.js'

document.addEventListener('alpine:init', async () => {
  // the click handler keeps firing twice, maybe it's a bug in alpine or something
  // i'm too lazy to figure it out, so we'll just debounce the operation
  const deleteLocation = debounce(async function deleteLocationRaw(client, id, cb) {
    // confirm delete
    const answer = confirm(`Are you sure you want to remove this location?`)
    if (!answer) return

    client(`
      mutation remove($id: Int!) {
        delete_locations_by_pk(id: $id) {
          id
        }
      }
    `, { id })
      .then(res => cb(null, res))
      .catch(err => cb(err))
  }, 250)

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
      if (!location.geolocation) {
        console.log(`Skipping marker, geolocation missing: ${location.id}`)
        return
      }

      const [lat, lng] = location.geolocation.split(',')
      const marker = new mapboxgl.Marker({
        color: location.isPOI ? '#633987' : '#2689AD'
      })
        .setLngLat([lng, lat])
        .addTo(this.map);

      this.points.push({ id: location.id, marker })

      if (location.isPOI) {
        marker.setPopup(new mapboxgl.Popup().setHTML(`<h3>${location.title}</h3>`))
      } else {
        console.log('render', location.id)
        marker.setPopup(new mapboxgl.Popup().setHTML(`<h3>${location.title}</h3>
        <p>${location.address}</p>
        ${location.price ? `<p><strong>$${location.price} / mo</strong></p>` : ''}
        ${location.notes ? `<p><em>${location.notes}</em></p>` : ''}
        <p><a class="btn btn-primary btn-full" target="_blank" rel="noopener noreferrer" href="${location.url}">Visit</a></p>
        <p x-show="token">
          <button class="btn btn-danger btn-sm btn-full" @click.stop="removeLocation(${location.id})">Remove</button>
        </p>
        `))
      }
    },
    clearPoints() {
      this.points.forEach(p => p.marker.remove())
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
    },
    async removeLocation(id) {
      const res = await deleteLocation(this.client, id, (err, res) => {
        if (err) {
          console.error(err)
          alert('Failed to delete location, check the logs')
          return
        }

        const point = this.points.find(p => p.id === id)

        if (point) {
          point.marker.remove()
        }
      })
    }
  }))
})
