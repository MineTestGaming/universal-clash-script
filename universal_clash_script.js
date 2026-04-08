/**
 * 通用 Clash 配置脚本
 * 功能：
 * 1. 🌍 全球 (原 auto) 移动至地区组前
 * 2. 策略组重命名：首选、次选
 * 3. 针对日本、台湾等组禁用 lazy 测速，确保秒切
 */

// --- 1. 内部常量 ---
const PROXY_GROUP = 'PROXY',
  PRIMARY_SELECT = '1️⃣ 首选',
  SECONDARY_SELECT = '2️⃣ 次选',
  AUTO_GROUP = '🌍 全球',
  MANUAL_GROUP = 'MANUAL',
  DIRECT_GROUP = 'DIRECT',
  DEFAULT_GROUP = 'DEFAULT',
  REJECT_GROUP = 'REJECT',
  ADS_GROUP = 'ADS'

// --- 2. 用户配置 ---
const CUSTOM_BLACKLIST = ['argotunnel.com']
const CUSTOM_WHITELIST = [
  'xn--ngstr-lra8j.com', 'srv.nintendo.net', 'd4c.nintendo.net', 'cdn.nintendo.net',
  'PROCESS-NAME,WinStore.App.exe', 'PROCESS-NAME,SystemSettings.exe',
  'ppzhilian.com', 'gh-proxy.org', 'gh-proxy.com'
]
const CUSTOM_BLOCKLIST = [
  'firebaseremoteconfigrealtime.googleapis.com',
  'firebaseremoteconfig.googleapis.com',
  'amplesound.net',
  'IP-CIDR,159.203.227.87/32,no-resolve',
  'IP-CIDR,50.116.38.191/32,no-resolve'
]

const PROXY_FILTER = /(http.+\..+)|请|剩余|套餐|流量|优惠|活动|到期|过期|网址/i
const IS_GFW_BLACKLIST_ENABLED = true
const IS_DNS_ENABLED = true

// --- 3. 地区配置中心 ---
const REGION_MAP = {
  '🇭🇰 香港': { keywords:['🇭🇰', 'HK', 'Hong Kong', '香港'], domains:['tvb.com', 'viu.tv'] },
  '🇹🇼 台湾': { keywords:['🇹🇼', 'TW', 'Taiwan', '台湾'], domains:['ani.gamer.com.tw'] },
  '🇯🇵 日本': { keywords:['🇯🇵', 'JP', 'Japan', '日本'], domains:['dmm.co.jp', 'abema.tv'] },
  '🇸🇬 新加坡': { keywords:['🇸🇬', 'SG', 'Singapore', '新加坡'], domains:[] },
  '🇰🇷 韩国': { keywords:['🇰🇷', 'KR', 'Korea', '韩国'], domains:[] },
  '🇺🇸 美国': { keywords:['🇺🇸', 'US', 'USA', 'United States', '美国'], domains:['max.com', 'hulu.com'] },
}

// --- 4. 核心配置 ---
const optimalDnsConfig = {
  enable: IS_DNS_ENABLED,
  listen: '0.0.0.0:1053',
  ipv6: false,
  'enhanced-mode': 'fake-ip',
  'fake-ip-range': '198.18.0.1/16',
  'fake-ip-filter':['geosite:private', 'geosite:connectivity-check','+.argotunnel.com'],
  nameserver:['https://doh.pub/dns-query'],
  fallback:['tls://8.8.4.4#proxy', 'tls://1.1.1.1#proxy'],
  'fallback-filter': { geoip: true },
  'proxy-server-nameserver':['https://doh.pub/dns-query'],
  'default-nameserver':['223.5.5.5']
}

// --- 5. 辅助函数 ---
const getProxyRegion = (proxyName) => {
  for (const region in REGION_MAP) {
    const { keywords } = REGION_MAP[region]
    const patternParts = keywords.map(kw => /^[a-zA-Z\s]+$/.test(kw) ? `(?<![a-zA-Z])${kw.replace(/\s+/g, '\\s+')}(?![a-zA-Z])` : kw)
    if (new RegExp(patternParts.join('|'), 'i').test(proxyName)) return region
  }
  return '其他地区'
}

// --- 6. 主函数 ---
const main = (config) => {
  config = { proxies: config.proxies }
  config.dns = optimalDnsConfig

  const allProxies = config.proxies
    .map((p) => p.name)
    .filter((name) => !PROXY_FILTER.test(name))

  const regionGroupsData = {}
  allProxies.forEach((name) => {
    const r = getProxyRegion(name)
    if (!regionGroupsData[r]) regionGroupsData[r] = []
    regionGroupsData[r].push(name)
  })

  // 生成各地区 url-test 组
  const autoRegionGroups = Object.entries(regionGroupsData).map(([name, proxies]) => {
    // 判断是否需要关闭 lazy
    const isNoLazy = name.includes('日本') || name.includes('台湾')
    return {
      name: name,
      type: 'url-test',
      proxies: proxies,
      url: 'http://www.gstatic.com/generate_204',
      interval: 60,
      tolerance: 500,
      lazy: !isNoLazy // 如果是日本、台湾，则 lazy 为 false
    }
  })

  const sortedRegionNames = autoRegionGroups
    .map(g => g.name)
    .sort((a, b) => {
      const order = Object.keys(REGION_MAP)
      return (order.indexOf(a) === -1 ? 99 : order.indexOf(a)) - (order.indexOf(b) === -1 ? 99 : order.indexOf(b))
    })

  // --- 策略组构建 ---

  // 🌍 全球自动测速
  const autoAllGroup = {
    name: AUTO_GROUP,
    type: 'url-test',
    proxies: allProxies,
    url: 'http://www.gstatic.com/generate_204',
    interval: 60,
    tolerance: 400,
    lazy: false // 全球组通常作为兜底，关闭 lazy
  }

  const candidateProxies = [AUTO_GROUP, MANUAL_GROUP, ...sortedRegionNames]

  // 1️⃣ 首选 (Select)
  const primarySelectGroup = {
    name: PRIMARY_SELECT,
    type: 'select',
    proxies: candidateProxies
  }

  // 2️⃣ 次选 (Select)
  const secondarySelectGroup = {
    name: SECONDARY_SELECT,
    type: 'select',
    proxies: [...candidateProxies, DIRECT_GROUP]
  }

  // PROXY 主出口 (Fallback)
  const proxyGroup = {
    name: PROXY_GROUP,
    type: 'fallback',
    proxies: [PRIMARY_SELECT, SECONDARY_SELECT],
    url: 'http://www.gstatic.com/generate_204',
    interval: 30
  }

  const manualGroup = { name: MANUAL_GROUP, type: 'select', proxies: allProxies }
  const defaultGroup = { name: DEFAULT_GROUP, type: 'select', proxies: [PROXY_GROUP, DIRECT_GROUP] }
  const adsGroup = { name: ADS_GROUP, type: 'select', proxies: [REJECT_GROUP, DIRECT_GROUP] }

  // 组装策略组列表
  config['proxy-groups'] = [
    proxyGroup,           // PROXY
    primarySelectGroup,   
    secondarySelectGroup,  
    manualGroup,
    defaultGroup,
    adsGroup,
    autoAllGroup, ...autoRegionGroups    // 地区组放在最后
  ]

  // --- 规则部分 ---
  const createRule = (domain, group) => {
    const parts = domain.split(',')
    return `${parts.length > 1 ? parts[0] : 'DOMAIN-SUFFIX'},${parts.length > 1 ? parts[1] : parts[0]},${group}${parts[2] ? ',' + parts[2] : ''}`
  }

  const regionRules = Object.entries(REGION_MAP)
    .filter(([name]) => regionGroupsData[name])
    .flatMap(([name, data]) => data.domains.map(d => createRule(d, name)))

  config.rules = [
    ...CUSTOM_BLOCKLIST.map(d => createRule(d, REJECT_GROUP)),
    ...CUSTOM_BLACKLIST.map(d => createRule(d, PROXY_GROUP)),
    ...CUSTOM_WHITELIST.map(d => createRule(d, DIRECT_GROUP)),
    ...regionRules,
    `GEOSITE,category-ads-all,${ADS_GROUP}`,
    `GEOSITE,private,${DIRECT_GROUP}`,
    `GEOSITE,cn,${DIRECT_GROUP}`,
    IS_GFW_BLACKLIST_ENABLED ? `GEOSITE,gfw,${PROXY_GROUP}` : undefined,
    IS_DNS_ENABLED ? `GEOIP,CN,${DIRECT_GROUP}` : false,
    `MATCH,${DEFAULT_GROUP}`
  ].filter(Boolean)

  return config
}
