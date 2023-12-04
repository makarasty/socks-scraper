# ProxyScraper
💜 Uses https://github.com/casals-ar/proxy-list to get a list of proxies

![image](https://github.com/makarasty/ProxyScraper/assets/71918286/0a4e90a1-0998-4fc3-be65-dfd6593ff571)

#Example
```js
const { ProxyScraper, FilterLatency } = require('github-proxy-scraper');

async function main() {
	const proxyScraper = new ProxyScraper();

	const proxies5 = FilterLatency(await proxyScraper.FetchSocks5());

	console.log(proxies5);

	const proxies4 = await proxyScraper.FetchSocks4();

	console.log(proxies4);

	console.log(`The best socks5 proxy url is ${proxies5[0].address}, with latency of ${proxies5[0].latency} ms`);
}

main()
```
