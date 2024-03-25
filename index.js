const { SocksClient } = require('socks');
const { request } = require('undici');
const { Worker } = require('node:worker_threads');
const path = require('path')

const workerPath = path.join(__dirname, 'worker.js')
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
 * @property {?SocksScraper.IncomingHttpHeaders} headers
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

class SocksScraper {
	/**
	 * @param {?string[]} sites 
	 * @param {?SocksScraper.ClassOptions} options 
	 */
	constructor(sites = [], options = { headers: null }) {

		/**
		 * @public
		 * @type {sites}
		 */
		this.sites = sites

		/**
		 * @private
		 */
		this.unCheckedProxies = []

		/**
		 * @private
		 * @type {typeof options.headers}
		 */
		this.headers = options?.headers || {
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
			'Connection': 'keep-alive'
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
	 * @returns {Promise<string[] | []>}
	 */
	async getProxiesFromRawSite(url) {
		try {
			const response = await request(url, { method: "GET", headers: this.headers })
			const responseText = await response.body.text()

			const proxyList = responseText.split('\n').filter((x) => x.match(ipPortRegex))
			return proxyList
		} catch (error) {
			return null
		}
	}

	/**
	 * Check ip:port to see if it is a proxy and if it works at all
	 * @public
	 * @param {SocksScraper.SocksProxyType} type 
	 * @param {string} address 
	 * @param {number} timeout 
	 * @returns {Promise<?SocksScraper.IDefaultProxy>}
	 */
	static async checkSocksProxy(type, address, timeout = 5000, checkURL = 'http://ip-api.com/ip', checkURLPort = 80) {
		const [host, portStr] = address.split(':');
		const port = Number(portStr);

		const startTime = performance.now();

		try {
			await SocksClient.createConnection({
				timeout,
				command: 'connect',
				destination: { host: checkURL, port: checkURLPort },
				proxy: { host, port, type }
			})
			const latency = Math.round(performance.now() - startTime)

			return { address, host, port, latency }
		} catch (error) {
			return null
		}
	}

	/**
	 * @public
	 * @returns {Promise<void>}
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
	 * @param {number} [chunkSize=10000] number of Promise.all treatments for 1 worker
	 * @param {number} [workerCount=1] count of workers
	 * @returns {Promise<?SocksScraper.IDefaultProxy[]>}
	 */
	async getWorkedSocksProxies(sockType, timeout, workerCount = 1, chunkSize = 10000) {
		const workers = [], workedProxyLists = [];
		const proxyChunkSize = Math.ceil(this.unCheckedProxies.length / workerCount);

		for (let i = 0; i < workerCount; i++) {
			const worker = new Worker(workerPath);

			worker.on('message', (workedProxyList) => {
				workedProxyLists.push(...workedProxyList);
			});

			const proxyChunk = this.unCheckedProxies.slice(i * proxyChunkSize, (i + 1) * proxyChunkSize);
			worker.postMessage({ sockType, timeout, proxyChunk, chunkSize });
			workers.push(worker);
		}

		await Promise.all(workers.map((worker) => new Promise((resolve) => {
			worker.once('message', resolve);
		})));

		for (const worker of workers) {
			worker.terminate();
		}

		return workedProxyLists;
	}
}

module.exports = SocksScraper