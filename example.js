const SocksScraper = require('.'); // require('socks-scraper');

async function master() {
	// Initialize the scraper with a list of raw sites
	const socksScraper = new SocksScraper([
		"https://raw.githubusercontent.com/officialputuid/KangProxy/KangProxy/http/http.txt",
		"https://raw.githubusercontent.com/officialputuid/KangProxy/KangProxy/socks4/socks4.txt",
		"https://raw.githubusercontent.com/officialputuid/KangProxy/KangProxy/socks5/socks5.txt",

		'https://api.proxyscrape.com/?request=displayproxies&status=alive&proxytype=socks4',
		'https://api.proxyscrape.com/?request=displayproxies&status=alive&proxytype=socks5',
	])

	// Add one more site to the list of sites on which free proxies are placed
	socksScraper.addSites(["https://api.proxyscrape.com/?request=displayproxies&status=alive"])

	// Timeout for checking the proxy in ms
	const timeout = 10000

	const chunkSize = 5000;

	const retryCount = 5;

	console.log('Updating unchecked proxies...');
	// Gets proxies from all sites, VERY IMPORTANT: it must be called before the getWorkedSocksProxies()
	await socksScraper.updateUncheckedProxies()

	console.log(`Done updating unchecked proxies! (${socksScraper.unCheckedProxies.size})`);

	// Get a list of proxies from all sites, check if they work and return the best ones
	const wsp4 = await socksScraper.getWorkedSocksProxies('socks4', timeout, chunkSize, undefined, undefined, retryCount)

	// Sort the list by latency and take the fastest proxy
	const bestWSP4 = SocksScraper.filterByLatency(wsp4)[0]

	console.log(`The best socks4 proxy is ${bestWSP4.address} with latency ${bestWSP4.latency}ms (${wsp4.length})`)

	const wsp5 = await socksScraper.getWorkedSocksProxies('socks5', timeout, chunkSize, undefined, undefined, retryCount)
	const bestWSP5 = SocksScraper.filterByLatency(wsp5)[0]

	console.log(`The best socks5 proxy is ${bestWSP5.address} with latency ${bestWSP5.latency}ms (${wsp5.length})`)

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
