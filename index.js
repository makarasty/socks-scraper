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