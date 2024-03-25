const { parentPort } = require('node:worker_threads');
const SocksScraper = require('./index.js');

/**
 * @param {SocksScraper.IDefaultMessage} event
 */
async function listener(event) {
	try {
		const { sockType, timeout, proxyChunk, chunkSize } = event;
	
		const fullProxiesList = []
		for (let i = 0; i < proxyChunk.length; i += chunkSize) {
			const slice = proxyChunk.slice(i, i + chunkSize);
			const ProxiesListPromise = slice.map(async (a) => await SocksScraper.checkSocksProxy(sockType, a, timeout));
			const ProxiesList = await Promise.all(ProxiesListPromise)
			fullProxiesList.push(...ProxiesList)
		}
	
		parentPort.postMessage(fullProxiesList.filter((proxy) => Boolean(proxy)));
	} catch (error){
		console.log(error);
	}
}

parentPort.on('message', listener);
