import gqlQuery from './gqlQuery.js'

document.addEventListener('alpine:init', async () => {
  // Alpine.data('maps', () => ({
  //   title: 'Maps'
  // }))

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
