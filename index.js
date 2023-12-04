const { SocksClient } = require('socks');
const { fetch } = require('undici');
const Promise = require('bluebird');

class ProxyScraper {
	constructor(timeout = 4000) {
		this.timeout = timeout
		this.destination = {
			host: 'ifconfig.me',
			port: 80
		};
	}

	/**
	 * @private
	 * @param {string} type - Type of proxy list (socks5 or socks4)
	 * @return {string}
	 */
	GetProxyListUrl(type) {
		return `https://raw.githubusercontent.com/casals-ar/proxy-list/main/${type}`;
	}

	/**
	 * @private
	 * @param {string} type
	 * @return {Promise<string>} A promise that resolves to the list of proxies as a string.
	 */
	async FetchProxyList(type) {
		try {
			const response = await fetch(this.GetProxyListUrl(type));
			if (!response.ok) {
				throw new Error('Network response was not ok.');
			}
			return response.text();
		} catch (error) {
			throw new Error(`Failed to access url: ${error.message}`);
		}
	}

	/**
	 * @private
	 * @param {string} address
	 * @return {Object|number} Returns an object if successful, or 0 on failure.
	 */
	async TestProxy(type, address) {
		let [host, port] = address.split(':');

		port = +port

		const proxyOptions = {
			command: 'connect',
			timeout: this.timeout,
			destination: this.destination,
			proxy: { host, port, type }
		};

		const startTime = performance.now();

		const result = await SocksClient.createConnection(proxyOptions)
			.then(() => ({ address, host, port, latency: +(performance.now() - startTime).toFixed(0) }))
			.catch(() => 0);

		return result;
	}

	/**
	 * @private
	 * @param {String} type
	 * @param {Number} [concurrency=0]
	 * @return {Promise<Array<Object>>} A promise that resolves with a list of working proxies.
	 */
	async FetchWorkedProxyList(type, concurrency = 0) {
		const proxyText = await this.FetchProxyList(type);

		const proxyList = proxyText.split('\n')

		const workedProxyList = await Promise
			.map(proxyList, async (address) =>
				this.TestProxy(+type.at(-1), address.trimEnd()
				), { concurrency }
			);

		const filteredProxyList = workedProxyList.filter((proxy) => proxy)

		return filteredProxyList
	}

	/**
	 * Retrieves a list of working Socks5 proxies.
	 *
	 * @param {number} concurrency - Max number of concurrent checks
	 * @return {Promise<Array<Object>>} Promise resolving to an array of proxies
	 */
	async FetchSocks5(concurrency) {
		return this.FetchWorkedProxyList('socks5', concurrency)
	}

	/**
	 * Retrieves a list of working Socks4 proxies.
	 *
	 * @param {number} concurrency - Max number of concurrent checks
	 * @return {Promise<Array<Object>>} Promise resolving to an array of proxies
	 */
	async FetchSocks4(concurrency) {
		return this.FetchWorkedProxyList('socks4', concurrency)
	}

	/**
	 *
	 * @param {Array<Object>} proxies
	 * @return {Array<Object>}
	 */
	static FilterLatency(proxies) {
		return proxies.sort((a, b) => a.latency - b.latency);
	}
}

module.exports = {
	FilterLatency: ProxyScraper.FilterLatency,
	ProxyScraper
}