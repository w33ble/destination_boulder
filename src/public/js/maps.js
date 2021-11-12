
document.addEventListener('alpine:init', () => {
  // Alpine.data('maps', () => ({
  //   title: 'Maps'
  // }))
  const token = window.localStorage.getItem('graph-token') || ''
  const headers = {
    'content-type': 'application/json',
  }

  if (token) headers['x-hasura-admin-secret'] = token
  fetch('https://intense-sparrow-57.hasura.app/v1/graphql', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: `
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
      `
    })
  })
    .then(res => {
      if (res.status >= 400) throw new Error(res.statusText)
      return res.json()
    })
    .then(res => {
      console.log(res)
    })
    .catch(err => {
      console.error(err)
    })
})