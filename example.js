const SocksScraper = require('.'); // require('socks-scraper');

async function master() {
	// Initialize the scraper with a list of raw sites
	const socksScraper = new SocksScraper([
		"https://raw.githubusercontent.com/casals-ar/proxy-list/main/socks5",
		"https://raw.githubusercontent.com/casals-ar/proxy-list/main/socks4",
		"https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks4.txt",
		"https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/socks4.txt",
		"https://shieldcommunity.net/sockets.txt"
	])

	// Add one more site to the list of sites on which free proxies are placed
	socksScraper.addSites(["https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/socks4.txt"])

	// Timeout for checking the proxy in ms
	const timeout = 6000

	console.log('Updating unchecked proxies...');
	// Gets proxies from all sites, VERY IMPORTANT: it must be called before the getWorkedSocksProxies()
	await socksScraper.updateUncheckedProxies()

	console.log('Done updating unchecked proxies!');

	// Get a list of proxies from all sites, check if they work and return the best ones
	const wsp4 = await socksScraper.getWorkedSocksProxies(4, timeout)
	// Sort the list by latency and take the fastest proxy
	const bestWSP4 = SocksScraper.filterByLatency(wsp4)[0]

	console.log(`The best socks4 proxy is ${bestWSP4.host}:${bestWSP4.port} with latency ${bestWSP4.latency}ms`)

	const wsp5 = await socksScraper.getWorkedSocksProxies(5, timeout, 1, 20000)
	const bestWSP5 = SocksScraper.filterByLatency(wsp5)[0]

	console.log(`The best socks5 proxy is ${bestWSP5.host}:${bestWSP5.port} with latency ${bestWSP5.latency}ms`)

	// Check my socks5 proxy to see if it works at all
	const mySocks5Proxy = await SocksScraper.checkSocksProxy(5, '94.131.14.66:1080', 4000)
	const isAlive = Boolean(mySocks5Proxy)

	console.log(`My socks5 proxy is ${isAlive ? 'alive' : 'dead'}`)
	console.log(mySocks5Proxy)
}
master()
