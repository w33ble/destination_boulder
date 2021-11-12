// borrowed from https://github.com/nordsimon/graphql-client/blob/master/index.js
export default function gqlQuery(url, opts = {}) {
  if (!url) throw new Error('Missing url parameter')

  const headers = new Headers(opts.headers || {})
  headers.append('Content-Type', 'application/json')

  const secret = window.localStorage.getItem('hasura-admin-secret')
  if (secret) headers.append('x-hasura-admin-secret', secret)

  return async function (query, variables) {
    const req = new Request(url, {
      method: 'POST',
      body: JSON.stringify({
        query: query,
        variables: variables
      }),
      headers: headers,
      credentials: opts.credentials
    })

    const res = await fetch(req)
    if (!res.ok) {
      throw new Error(`Query failed (${res.status}) ${await res.text()}`)
    }

    return res.json()
  }
}
