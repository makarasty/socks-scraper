const { ProxyScraper, FilterLatency } = require('.');

async function main() {
	const proxyScraper = new ProxyScraper();

	const proxies5 = FilterLatency(await proxyScraper.FetchSocks5());

	console.log(proxies5);

	const proxies4 = await proxyScraper.FetchSocks4();

	console.log(proxies4);

	console.log(`The best socks5 proxy url is ${proxies5[0].address}, with latency of ${proxies5[0].latency} ms`);
}

main()