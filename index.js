const { SocksClient } = require('socks');
const { request } = require('undici');

const ipPortRegex = /^(?:\d{1,3}\.){3}\d{1,3}:\d+$/;

/**
 * @typedef {import('socks/typings/common/constants').SocksProxyType} SocksScraper.SocksProxyType
 */

/**
 * @typedef {import('undici/types/header').IncomingHttpHeaders} SocksScraper.IncomingHttpHeaders
 */

/**
 * like { checkURL, checkURLPort, headers}
 * @typedef {Object} SocksScraper.ClassOptions
 * @property {?string} checkURL
 * @property {?number} checkURLPort
 * @property {SocksScraper.IncomingHttpHeaders} headers
 */

/**
 * like { address, host, port, latency }
 * @typedef {Object} SocksScraper.IDefaultProxy
 * @property {string} address
 * @property {string} host
 * @property {number} port
 * @property {number} latency
 */

class SocksScraper {
	/**
	 * @param {string[]} sites 
	 * @param {SocksScraper.ClassOptions} options 
	 */
	constructor(sites = [], options = {}) {

		/**
		 * @readonly
		 * @public
		 * @type {sites}
		 */
		this.sites = sites

		/**
		 * @private
		 * @type {options.checkURL}
		 */
		this.checkURL = options?.checkURL || 'http://ifconfig.me/ip'

		/**
		 * @private
		 * @type {options.checkURLPort}
		 */
		this.checkURLPort = options?.checkURLPort || 80

		/**
		 * @private
		 * @type {options.headers}
		 */
		this.headers = options?.headers || {
			"content-type": "application/x-www-form-urlencoded",
		}
	}

	/**
	 * Add the site to the list of sites on which free proxies are placed, the main thing that the site was raw or the like
	 * @public
	 * @param {string[]} sites 
	 */
	addSites(sites) {
		this.sites.push(...sites)
	}

	/**
	 * Clears the list of sites from which the tool receives proxies
	 * @public
	 */
	clearSites() {
		this.sites = []
	}

	/**
	 * at `0` the best at `-1` the worst
	 * @public
	 * @param {SocksScraper.IDefaultProxy[]} proxies 
	 * @returns {SocksScraper.IDefaultProxy[]}
	 */
	static filterByLatency(proxies) {
		return proxies.sort((a, b) => a.latency - b.latency);
	}

	/**
	 * Get a list of ip:port proxies ignoring garbage comments etc.
	 * @public
	 * @param {string} url 
	 * @returns {Promise<string[]>}
	 */
	async getProxiesFromRawSite(url) {
		const response = await request(url, { method: "GET", headers: this.headers })
		const responseText = await response.body.text()

		const proxyList = responseText.split('\n').filter((x) => x.match(ipPortRegex))
		return proxyList
	}

	/**
	 * Check ip:port to see if it is a proxy and if it works at all
	 * @public
	 * @param {SocksScraper.SocksProxyType} type 
	 * @param {string} address 
	 * @param {number} timeout 
	 * @returns {Promise<?SocksScraper.IDefaultProxy>}
	 */
	async checkSocksProxy(type, address, timeout = 5000) {
		const [host, portStr] = address.split(':');
		const port = Number(portStr);

		const startTime = performance.now();
		const result = await SocksClient.createConnection({
			timeout,
			command: 'connect',
			destination: { host: this.checkURL, port: this.checkURLPort },
			proxy: { host, port, type }
		})
			.then(() => ({ address, host, port, latency: Math.round(performance.now() - startTime) }))
			.catch(() => null);

		return result;
	}

	/**
	 * Get proxies from all added sites, check if they work and return them as SocksScraper.IDefaultProxy[]
	 * @public
	 * @param {SocksScraper.SocksProxyType} sockType 
	 * @param {number} timeout 
	 * @returns {Promise<SocksScraper.IDefaultProxy[]>}
	 */
	async getWorkedSocksProxies(sockType, timeout) {
		const sitesPromise = this.sites.map(async (siteUrl) => {
			return await this.getProxiesFromRawSite(siteUrl)
		})

		const notTestedProxyList = await Promise.all(sitesPromise)

		const NTPListPromise = notTestedProxyList.flat()
			.map(async (proxyAddress) => {
				return await this.checkSocksProxy(sockType, proxyAddress, timeout)
			})

		const workedProxyList = await Promise.all(NTPListPromise)
		const clearList = workedProxyList.filter((proxy) => Boolean(proxy))

		return clearList
	}
}

module.exports = SocksScraper