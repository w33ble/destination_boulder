import axios from 'axios'
import cheerio from 'cheerio'

export default async function getLocation(address) {
  const url = `https://www.google.com/maps/place/${address.replace(/' '/g, '+')}`
  const res = await axios.get(url)

  const $ = cheerio.load(res.data)

  const content = $('meta[itemprop=image]').attr('content')

  const params = new URLSearchParams(content)
  const center = params.get('center') || params.get('ll')

  // fall back to regex lookup
  // if (!center) {
  //   const match = res.data.match(/\@[0-9\.]+,[0-9\.\-]+/gi)

  //   if (!match.length) {
  //     console.log({ address, center })
  //     return {}
  //   }

  //   center = match[0].substr(1)
  // }

  const [lat, lng] = center.split(',')

  return { lat, lng }
}
