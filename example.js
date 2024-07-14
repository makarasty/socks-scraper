const SocksScraper = require('.'); // require('socks-scraper');

async function master() {
	// Initialize the scraper with a list of raw sites
	const socksScraper = new SocksScraper([
		"https://api.proxyscrape.com/?request=displayproxies&status=alive",
		"https://raw.githubusercontent.com/casals-ar/proxy-list/main/socks5",
		"https://raw.githubusercontent.com/casals-ar/proxy-list/main/socks4",
		"https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks4.txt",
		"https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/socks4.txt",
		'https://api.proxyscrape.com/?request=displayproxies&status=alive&proxytype=socks4',
		'https://api.proxyscrape.com/?request=displayproxies&status=alive&proxytype=socks5',
		'https://openproxylist.xyz/socks4.txt',
		'https://openproxylist.xyz/socks5.txt',
		'https://raw.githubusercontent.com/sunny9577/proxy-scraper/master/proxies.txt'
	])

	// Add one more site to the list of sites on which free proxies are placed
	socksScraper.addSites(["https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/socks4.txt"])

	// Timeout for checking the proxy in ms
	const timeout = 6000

	console.log('Updating unchecked proxies...');
	// Gets proxies from all sites, VERY IMPORTANT: it must be called before the getWorkedSocksProxies()
	await socksScraper.updateUncheckedProxies()

	console.log(`Done updating unchecked proxies! (${socksScraper.unCheckedProxies.size})`);

	// Get a list of proxies from all sites, check if they work and return the best ones
	const wsp4 = await socksScraper.getWorkedSocksProxies('socks4', timeout)

	// Sort the list by latency and take the fastest proxy
	const bestWSP4 = SocksScraper.filterByLatency(wsp4)[0]

	console.log(`The best socks4 proxy is ${bestWSP4.host}:${bestWSP4.port} with latency ${bestWSP4.latency}ms (${wsp4.length})`)

	const wsp5 = await socksScraper.getWorkedSocksProxies('socks5', timeout)
	const bestWSP5 = SocksScraper.filterByLatency(wsp5)[0]

	console.log(`The best socks5 proxy is ${bestWSP5.host}:${bestWSP5.port} with latency ${bestWSP5.latency}ms (${wsp5.length})`)

	/* only if you have VERY good internet...

	const http = await socksScraper.getWorkedSocksProxies('http', timeout)
	const bestHttp = SocksScraper.filterByLatency(http)[0]

	console.log(`The best http proxy is ${bestHttp.host}:${bestHttp.port} with latency ${bestHttp.latency}ms`)
	*/

	//  Check my socks5 proxy to see if it works at all
	const mySocks4Proxy = await SocksScraper.isAliveProxy('socks4', '3.10.93.50:80', 10000)
	const isAlive = Boolean(mySocks4Proxy)

	console.log(`My socks4 proxy is ${isAlive ? 'alive' : 'dead'}`)
	console.log(mySocks4Proxy);
}
master()
