/**
 * 通用 Clash 配置脚本
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
  'xn--ngstr-lra8j.com',
  'srv.nintendo.net',
  'd4c.nintendo.net',
  'cdn.nintendo.net',
  'PROCESS-NAME,WinStore.App.exe',
  'PROCESS-NAME,SystemSettings.exe',
  'ppzhilian.com',
  'gh-proxy.org',
  'gh-proxy.com',
]
const CUSTOM_BLOCKLIST = [
  'firebaseremoteconfigrealtime.googleapis.com',
  'firebaseremoteconfig.googleapis.com',
  'amplesound.net',
  'IP-CIDR,159.203.227.87/32,no-resolve',
  'IP-CIDR,50.116.38.191/32,no-resolve',
]
// 其他自定义规则
const CUSTOM_PRIORITY_RULES = []
// 自定义兜底规则
const CUSTOM_FALLBACK_RULES = [
  // IP 地址默认直连
  //'IP-CIDR,0.0.0.0/0,DIRECT,no-resolve'
]
const PROXY_FILTER = /(http.+\..+)|请|剩余|套餐|流量|优惠|活动|到期|过期|网址/i
const IS_GFW_BLACKLIST_ENABLED = true
const IS_DNS_ENABLED = true
const REGION_ORDER = [
  '🇭🇰 香港',
  '🇹🇼 台湾',
  '🇯🇵 日本',
  '🇸🇬 新加坡',
  '🇺🇸 美国',
  '🇰🇷 韩国',
  '🇬🇧 英国',
  '🇩🇪 德国',
  '🇫🇷 法国',
  '🇳🇱 荷兰',
  '🇨🇦 加拿大',
  '🇦🇺 澳大利亚',
  '🇻🇳 越南',
  '🇹🇭 泰国',
  '🇲🇾 马来西亚',
  '🇮🇳 印度',
  '🇹🇷 土耳其',
  '🇷🇺 俄罗斯',
  '其他地区',
]

// --- 3. 地区配置中心 ---
const REGION_MAP = {
  '🇭🇰 香港': {
    keywords: ['🇭🇰', 'HK', 'Hong Kong', '香港'],
    domains: ['tvb.com', 'viu.tv', 'lihkg.com', 'hkgolden.com'],
  },
  '🇹🇼 台湾': {
    keywords: ['🇹🇼', 'TW', 'Taiwan', '台湾', '台灣'],
    domains: [
      'ani.gamer.com.tw',
      'litv.tv',
      'ptt.cc',
      'dcard.tw',
      'mobile01.com',
      'gamer.com.tw',
    ],
  },
  '🇯🇵 日本': {
    keywords: ['🇯🇵', 'JP', 'Japan', '日本'],
    domains: ['dmm.co.jp', 'abema.tv', 'nicovideo.jp'],
  },
  '🇸🇬 新加坡': {
    keywords: ['🇸🇬', 'SG', 'Singapore', '新加坡', '狮城'],
    domains: [],
  },
  '🇺🇸 美国': {
    keywords: ['🇺🇸', 'US', 'USA', 'United States', 'America', '美国'],
    domains: [
      'max.com',
      'hulu.com',
      'disneyplus.com',
      'tv.youtube.com',
      'cdn.usefathom.com',
      'claude.ai',
      'anthropic.com',
      'claudeusercontent.com',
    ],
  },
  '🇰🇷 韩国': {
    keywords: ['🇰🇷', 'KR', 'Korea', 'South Korea', '韩国'],
    domains: [],
  },
  '🇬🇧 英国': {
    keywords: ['🇬🇧', 'UK', 'United Kingdom', 'England', '英国'],
    domains: ['bbc.co.uk'],
  },
  '🇩🇪 德国': {
    keywords: ['🇩🇪', 'DE', 'Germany', '德国'],
    domains: [],
  },
  '🇫🇷 法国': {
    keywords: ['🇫🇷', 'FR', 'France', '法国'],
    domains: [],
  },
  '🇳🇱 荷兰': {
    keywords: ['🇳🇱', 'NL', 'Netherlands', '荷兰'],
    domains: [],
  },
  '🇨🇦 加拿大': {
    keywords: ['🇨🇦', 'CA', 'Canada', '加拿大'],
    domains: [],
  },
  '🇦🇺 澳大利亚': {
    keywords: ['🇦🇺', 'AU', 'Australia', '澳大利亚', '澳洲'],
    domains: [],
  },
  '🇻🇳 越南': {
    keywords: ['🇻🇳', 'VN', 'Vietnam', '越南'],
    domains: [],
  },
  '🇹🇭 泰国': {
    keywords: ['🇹🇭', 'TH', 'Thailand', '泰国'],
    domains: [],
  },
  '🇲🇾 马来西亚': {
    keywords: ['🇲🇾', 'MY', 'Malaysia', '马来西亚', '大马'],
    domains: [],
  },
  '🇮🇳 印度': {
    keywords: ['🇮🇳', 'IN', 'India', '印度'],
    domains: [],
  },
  '🇹🇷 土耳其': {
    keywords: ['🇹🇷', 'TR', 'Turkey', '土耳其'],
    domains: [],
  },
  '🇷🇺 俄罗斯': {
    keywords: ['🇷🇺', 'RU', 'Russia', '俄罗斯'],
    domains: [],
  },
}

// --- 4. 核心配置 ---
const optimalDnsConfig = {
  enable: IS_DNS_ENABLED,
  listen: '0.0.0.0:1053',
  ipv6: false,
  'prefer-h3': false,
  'use-hosts': true,
  'use-system-hosts': true,
  'enhanced-mode': 'fake-ip',
  'fake-ip-range': '198.18.0.1/16',
  'fake-ip-filter': ['geosite:private', 'geosite:connectivity-check'],

  // 说明：此处 DNS 的目的是匹配 GEOIP,CN，我们希望最快解析出最近的 IP。
  // 因此优先使用国内 DNS，以国外 DNS 作为兜底，nameserver 和 fallback 会并发请求。
  // 走到 GEOIP 之前已经将外网站点将导向代理，用 nameserver-policy 再次分流是多余的。
  // 而 direct-nameserver 会导致 DIRECT 被解析两次，并不适用当前场景。

  // 优先使用国内 DNS
  nameserver: [
    'https://doh.pub/dns-query',
    //'https://dns.alidns.com/dns-query' // 阿里的不好用，play store 解析不到下载地址
  ],
  // 国外 DNS 作为兜底（with proxy）
  fallback: ['tls://8.8.4.4#proxy', 'tls://1.1.1.1#proxy'],
  // 如果国内 DNS 解析到的不是 CN 的 IP，则采用 fallback 的结果
  'fallback-filter': {
    geoip: true,
  },
  'proxy-server-nameserver': ['https://doh.pub/dns-query'], // 解析代理服务器域名
  'default-nameserver': ['223.5.5.5'], // 解析 DNS 域名
}

const optimalTunConfig = {
  enable: true,
  stack: 'gvisor',
  'auto-route': true,
  'auto-redirect': true,
  'auto-detect-interface': true,
  mtu: 1500,
  gso: true,
  'gso-max-size': 65536,
}

// --- 5. 辅助函数 ---
const getProxyRegion = (proxyName) => {
  for (const region in REGION_MAP) {
    const { keywords } = REGION_MAP[region]
    const patternParts = keywords.map((kw) =>
      /^[a-zA-Z\s]+$/.test(kw)
        ? `(?<![a-zA-Z])${kw.replace(/\s+/g, '\\s+')}(?![a-zA-Z])`
        : kw,
    )
    if (new RegExp(patternParts.join('|'), 'i').test(proxyName)) return region
  }
  return '其他地区'
}

// --- 6. 主函数 ---
const main = (config) => {
  config = { proxies: config.proxies }
  config.dns = optimalDnsConfig
  config.tun = optimalTunConfig

  const allProxies = config.proxies
    .map((p) => {
      if (Object.keys(REGION_MAP).includes(p.name)) {
        p.name += '01'
      }
      return p.name
    })
    .filter((name) => !PROXY_FILTER.test(name))

  const regionGroupsData = {}
  allProxies.forEach((name) => {
    const r = getProxyRegion(name)
    if (!regionGroupsData[r]) regionGroupsData[r] = []
    regionGroupsData[r].push(name)
  })

  // 生成各地区 url-test 组
  const autoRegionGroups = Object.entries(regionGroupsData).map(
    ([name, proxies]) => {
      // 判断是否需要关闭 lazy
      const isNoLazy = name.includes('日本') || name.includes('台湾')
      return {
        name: name,
        type: 'url-test',
        proxies: proxies,
        url: 'http://www.gstatic.com/generate_204',
        interval: 60,
        tolerance: 500,
        lazy: !isNoLazy, // 如果是日本、台湾，则 lazy 为 false
      }
    },
  )
  autoRegionGroups.sort((a, b) => {
    const order = REGION_ORDER
    return (
      (order.indexOf(a.name) === -1 ? 99 : order.indexOf(a.name)) -
      (order.indexOf(b.name) === -1 ? 99 : order.indexOf(b.name))
    )
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
    lazy: false, // 全球组通常作为兜底，关闭 lazy
  }

  const candidateProxies = [
    AUTO_GROUP,
    MANUAL_GROUP,
    ...autoRegionGroups.map((g) => g.name),
  ]

  // 1️⃣ 首选 (Select)
  const primarySelectGroup = {
    name: PRIMARY_SELECT,
    type: 'select',
    proxies: candidateProxies,
  }

  // 2️⃣ 次选 (Select)
  const secondarySelectGroup = {
    name: SECONDARY_SELECT,
    type: 'select',
    proxies: [...candidateProxies, DIRECT_GROUP],
  }

  // PROXY 主出口 (Fallback)
  const proxyGroup = {
    name: PROXY_GROUP,
    type: 'fallback',
    proxies: [PRIMARY_SELECT, SECONDARY_SELECT],
    url: 'http://www.gstatic.com/generate_204',
    interval: 30,
  }

  const manualGroup = {
    name: MANUAL_GROUP,
    type: 'select',
    proxies: allProxies,
  }
  const defaultGroup = {
    name: DEFAULT_GROUP,
    type: 'select',
    proxies: [PROXY_GROUP, DIRECT_GROUP],
  }
  const adsGroup = {
    name: ADS_GROUP,
    type: 'select',
    proxies: [REJECT_GROUP, DIRECT_GROUP],
  }

  // 组装策略组列表
  config['proxy-groups'] = [
    proxyGroup, // PROXY
    primarySelectGroup,
    secondarySelectGroup,
    manualGroup,
    defaultGroup,
    adsGroup,
    autoAllGroup,
    ...autoRegionGroups, // 地区组放在最后
  ]

  // --- 规则部分 ---
  const createRule = (domain, group) => {
    const parts = domain.split(',')
    return `${parts.length > 1 ? parts[0] : 'DOMAIN-SUFFIX'},${parts.length > 1 ? parts[1] : parts[0]},${group}${parts[2] ? ',' + parts[2] : ''}`
  }

  const regionRules = Object.entries(REGION_MAP)
    .filter(([name]) => regionGroupsData[name])
    .flatMap(([name, data]) => data.domains.map((d) => createRule(d, name)))

  config.rules = [
    ...CUSTOM_PRIORITY_RULES,
    ...CUSTOM_BLOCKLIST.map((d) => createRule(d, REJECT_GROUP)),
    ...CUSTOM_BLACKLIST.map((d) => createRule(d, PROXY_GROUP)),
    ...CUSTOM_WHITELIST.map((d) => createRule(d, DIRECT_GROUP)),
    ...regionRules,
    `GEOSITE,category-ads-all,${ADS_GROUP}`,
    `GEOSITE,private,${DIRECT_GROUP}`,
    `GEOSITE,cn,${DIRECT_GROUP}`,
    IS_GFW_BLACKLIST_ENABLED ? `GEOSITE,gfw,${PROXY_GROUP}` : undefined,
    IS_DNS_ENABLED ? `GEOIP,CN,${DIRECT_GROUP}` : false,
    ...CUSTOM_FALLBACK_RULES,
    `MATCH,${DEFAULT_GROUP}`,
  ].filter(Boolean)

  return config
}
