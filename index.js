const { ProxyAgent } = require('proxy-agent');
const needle = require('needle');

const ipPortRegex = /^(?:\d{1,3}\.){3}\d{1,3}:\d+$/;

/**
 * @typedef {'http' | 'socks5' | 'socks4'} SocksScraper.SocksProxyType
 */

/**
 * @typedef {5 | 4} SocksScraper.SocksProxyOldType
 */

/**
 * @typedef {Object} IDefaultMessage
 * @property {SocksScraper.SocksProxyType} sockType
 * @property {number} timeout
 * @property {string[]} proxyChunk
 * @property {number} chunkSize
 */

/**
 * like { address, host, port, latency }
 * @typedef {Object} SocksScraper.IDefaultProxy
 * @property {string} address
 * @property {string} host
 * @property {number} port
 * @property {number} latency
 */

/**
 * @param {needle.NeedleResponse} response
 */
function defaultProxyCallback(response) {
	return response.body?.origin || JSON.parse(response.body)?.origin
}

class SocksScraper {
	/**
	 * @param {?string[]} sites
	 */
	constructor(sites = []) {

		/**
		 * @public
		 * @type {sites}
		 */
		this.sites = sites

		/**
		 * @public
		 * @type {string[]}
		 */
		this.unCheckedProxies = []

		/**
		 * @public
		 * @type {SocksScraper.IDefaultProxy[]}
		 */
		this.checkedProxies = []
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
	 * Clears the list of unchecked proxies
	 */
	clearUnCheckedProxies() {
		this.unCheckedProxies = []
	}

	/**
	 * Clears the list of checked proxies
	 */
	clearCheckedProxies() {
		this.checkedProxies = []
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
	 */
	async getProxiesFromRawSite(url) {
		try {
			const res = await needle('get', url, {
				response_timeout: 10000,
				follow_max: 5,
				rejectUnauthorized: false
			})

			if (!res.body || typeof res.body !== 'string') return [];

			return res.body.split(/\r|\n|<br>/).filter((a) => a !== '').filter((x) => x.match(ipPortRegex)) || [];
		} catch (error) {
			return [];
		}
	}

	/**
	 * @param {SocksScraper.SocksProxyOldType} type
	 * @param {string} address
	 * @param {number?} timeout
	 * @param {string?} website
	 * @param {number?} checkURLPort
	 */
	static async checkSocksProxy(type, address, timeout = undefined, website = undefined, checkURLPort = undefined) {
		const newType = type === 5 ? 'socks5' : 'socks4';

		return await SocksScraper.isAliveProxy(newType, address, timeout, website) || null;
	}

	/**
	 * Check ip:port to see if it is a proxy and if it works at all
	 * @public
	 * @param {SocksScraper.SocksProxyType} type
	 * @param {string} address
	 * @param {number?} timeout
	 */
	static async isAliveProxy(type, address, timeout = 6000, website = 'https://httpbin.org/ip', callback = defaultProxyCallback) {
		try {

			const agent = new ProxyAgent({
				getProxyForUrl: () => `${type}://${address}`,
				timeout,
				rejectUnauthorized: false
			});

			const startTime = performance.now();
			const response = await needle('get', website, {
				agent: agent,
				follow: 10,
				open_timeout: 10000,
				response_timeout: 10000,
				read_timeout: 5000,
				rejectUnauthorized: false
			})
			const latency = Math.round(performance.now() - startTime)

			if (callback && callback(response)) {
				const [host, portStr] = address.split(':');

				return {
					address,
					host,
					port: Number(portStr),
					latency
				}
			}

			return false
		} catch (error) {
			return false
		}
	}

	/**
	 * @public
	 */
	async updateUncheckedProxies() {
		const sitesPromise = this.sites.map(async (siteUrl) => await this.getProxiesFromRawSite(siteUrl))
		const notTestedProxyList = await Promise.all(sitesPromise)

		this.unCheckedProxies = Array.prototype.concat(...notTestedProxyList)
	}

	/**
	 * Get proxies from all added sites, check if they work and return them as SocksScraper.IDefaultProxy[]
	 * @public
	 * @param {SocksScraper.SocksProxyType} sockType
	 * @param {number} timeout
	 * @returns {Promise<SocksScraper.IDefaultProxy[]>}
	 */
	async getWorkedSocksProxies(sockType, timeout) {
		const checkedProxiesPromise = this.unCheckedProxies.map(async (a) => SocksScraper.isAliveProxy(sockType, a, timeout))

		const checkedProxies = await Promise.all(checkedProxiesPromise)

		for (const proxy of checkedProxies) {
			if (!proxy) continue

			this.checkedProxies.push(proxy)
		}

		return this.checkedProxies
	}
}

module.exports = SocksScraper