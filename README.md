# Proxy Scraper

Library for Node.js for proxy collection and validation

# Install
- `npm i socks-scraper`

# OS Dependencies
- Node.js

# Lib Dependencies
- undici
- socks

# JSDoc
```js
/**
 * like { address, host, port, latency }
 * @typedef {Object} SocksScraper.IDefaultProxy
 * @property {string} address
 * @property {string} host
 * @property {number} port
 * @property {number} latency
 */
```

# Usage example
```js
const SocksScraper = require('socks-scraper');

// Initialize the scraper with a list of raw sites
const socksScraper = new SocksScraper([
	"https://raw.githubusercontent.com/casals-ar/proxy-list/main/socks5",
	"https://raw.githubusercontent.com/casals-ar/proxy-list/main/socks4",
	"https://shieldcommunity.net/sockets.txt",
	"https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks4.txt",
	"https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/socks4.txt"
])

// Add one more site to the list of sites on which free proxies are placed
socksScraper.addSites(["https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/socks4.txt"])

// Timeout for checking the proxy in ms
const timeout = 6000

// Get a list of proxies from all sites, check if they work and return the best ones
const wsp4 = await socksScraper.getWorkedSocksProxies(4, timeout)
// Sort the list by latency and take the fastest proxy
const bestWSP4 = SocksScraper.filterByLatency(wsp4)[0]

console.log(`The best socks4 proxy is ${bestWSP4.ip}:${bestWSP4.port} with latency ${bestWSP4.latency}ms`)

const wsp5 = await socksScraper.getWorkedSocksProxies(5, timeout)
const bestWSP5 = SocksScraper.filterByLatency(wsp5)[0]

console.log(`The best socks5 proxy is ${bestWSP5.ip}:${bestWSP5.port} with latency ${bestWSP5.latency}ms`)

// Check my socks5 proxy to see if it works at all
const mySocks5Proxy = await socksScraper.checkSocksProxy(5, '3.122.84.99:3128', 4000)
const isAlive = Boolean(mySocks5Proxy)

console.log(`My socks5 proxy is ${isAlive ? 'alive' : 'dead'}!`)
console.log(mySocks5Proxy)
```
```js
My socks5 proxy is alive!
{
  address: '3.122.84.99:3128',
  host: '3.122.84.99',
  port: 3128,
  latency: 100
}
```
