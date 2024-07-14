<<<<<<< Updated upstream
const SocksScraper = require('socks-scraper');
const fs = require('fs').promises;

async function main() {
	console.clear();

	const socksScraper = new SocksScraper([
		"https://raw.githubusercontent.com/casals-ar/proxy-list/main/socks5",
        "https://raw.githubusercontent.com/casals-ar/proxy-list/main/socks4",
        "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks4.txt",
        "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/socks4.txt",
        "https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/txt/proxies-socks4.txt",
        "https://raw.githubusercontent.com/rdavydov/proxy-list/main/proxies/socks4.txt",
        "https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/txt/proxies.txt",
        "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks5.txt",
        "https://raw.githubusercontent.com/officialputuid/KangProxy/KangProxy/socks4/socks4.txt",
        "https://raw.githubusercontent.com/officialputuid/KangProxy/KangProxy/socks5/socks5.txt",
        "https://raw.githubusercontent.com/jetkai/proxy-list/main/archive/txt/proxies-http.txt",
        "https://raw.githubusercontent.com/jetkai/proxy-list/main/archive/txt/proxies-https.txt",
        "https://raw.githubusercontent.com/jetkai/proxy-list/main/archive/txt/proxies-socks4.txt",
        "https://raw.githubusercontent.com/jetkai/proxy-list/main/archive/txt/proxies-socks5.txt",
        "https://raw.githubusercontent.com/jetkai/proxy-list/main/archive/txt/proxies.txt",
        "https://raw.githubusercontent.com/clarketm/proxy-list/master/proxy-list-raw.txt",
        "https://raw.githubusercontent.com/hookzof/socks5_list/master/proxy.txt",
        "https://raw.githubusercontent.com/sunny9577/proxy-scraper/master/proxies.txt",
        "https://raw.githubusercontent.com/mishakorzik/Free-Proxy/main/proxy.txt",
        "https://raw.githubusercontent.com/roosterkid/openproxylist/main/SOCKS4_RAW.txt",
        "https://raw.githubusercontent.com/roosterkid/openproxylist/main/SOCKS5_RAW.txt",
        "https://raw.githubusercontent.com/MuRongPIG/Proxy-Master/main/socks4.txt",
        "https://raw.githubusercontent.com/MuRongPIG/Proxy-Master/main/socks5.txt",
        "https://raw.githubusercontent.com/prxchk/proxy-list/main/socks4.txt",
        "https://raw.githubusercontent.com/prxchk/proxy-list/main/socks5.txt",
        "https://raw.githubusercontent.com/ErcinDedeoglu/proxies/main/proxies/socks4.txt",
        "https://raw.githubusercontent.com/ErcinDedeoglu/proxies/main/proxies/socks5.txt",
        "https://raw.githubusercontent.com/opsxcq/proxy-list/master/list.txt",
        "https://raw.githubusercontent.com/Anonym0usWork1221/Free-Proxies/main/proxy_files/socks4_proxies.txt",
        "https://raw.githubusercontent.com/Anonym0usWork1221/Free-Proxies/main/proxy_files/socks5_proxies.txt",
        "https://raw.githubusercontent.com/casals-ar/proxy-list/main/socks5",
        "https://raw.githubusercontent.com/proxylist-to/proxy-list/main/socks4.txt",
        "https://raw.githubusercontent.com/proxylist-to/proxy-list/main/socks5.txt",
        'https://api.proxyscrape.com/?request=displayproxies&status=alive&proxytype=socks4',
        'https://api.proxyscrape.com/?request=displayproxies&status=alive&proxytype=socks5',
        'https://openproxylist.xyz/socks4.txt',
        'https://openproxylist.xyz/socks5.txt',
        "https://api.proxyscrape.com/?request=displayproxies&status=alive"
	]);
    console.log('Updating unchecked proxies...');

    await socksScraper.updateUncheckedProxies();
    
    console.log('Checking proxies...');
    
    const timeout = 10000
    
    const type = 'socks5'
    const wsp = await socksScraper.getWorkedSocksProxies(type, timeout)
    const data = wsp.map((p) => p.address).join('\n');
    await fs.writeFile(`proxies-s${type}.txt`, data)
    
    console.log(`Proxies have been saved to proxies-${type}.txt`);
    
    const type1 = 'socks4'
    const wsp1 = await socksScraper.getWorkedSocksProxies(type1, timeout)
    const data1 = wsp1.map((p) => p.address).join('\n');
    await fs.writeFile(`proxies-s${type1}.txt`, data1)
    
    console.log(`Proxies have been saved to proxies-${type1}.txt`);
}

main()
=======
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
 * like { address, latency }
 * @typedef {Object} SocksScraper.IDefaultProxy
 * @property {string} address
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
		 * @type {Set<string>}
		 */
		this.unCheckedProxies = new Set();

		/**
		 * @public
		 * @type {SocksScraper.IDefaultProxy[]}
		 */
		this.checkedProxies = [];
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
		this.unCheckedProxies.clear();
	}

	/**
	 * Clears the list of checked proxies
	 */
	clearCheckedProxies() {
		this.checkedProxies = [];
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

		return (await SocksScraper.isAliveProxy(newType, address, timeout, website)) || null;
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
				return {
					address,
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

		this.unCheckedProxies = new Set(Array.prototype.concat(...notTestedProxyList))
	}

	/**
	 * Get proxies from all added sites, check if they work and return them as SocksScraper.IDefaultProxy[]
	 * @public
	 * @param {SocksScraper.SocksProxyType} sockType
	 * @param {number} timeout
	 * @returns {Promise<SocksScraper.IDefaultProxy[]>}
	 */
	async getWorkedSocksProxies(sockType, timeout) {
		this.clearCheckedProxies()

		const checkedProxiesPromise = Array.from(this.unCheckedProxies).map(async (a) => SocksScraper.isAliveProxy(sockType, a, timeout))

		const checkedProxies = await Promise.all(checkedProxiesPromise)

		for (const proxy of checkedProxies) {
			if (!proxy) continue

			this.checkedProxies.push(proxy)
		}

		return this.checkedProxies
	}
}

module.exports = SocksScraper
>>>>>>> Stashed changes
