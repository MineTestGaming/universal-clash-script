/**
 * 通用 Clash 配置脚本，按地区自动分组
 */

// --- 1. 用户配置 ---
// 自定义代理名单
let DOMAIN_BLACKLIST = []

// 自定义直连名单
let DOMAIN_WHITELIST = [
  // Switch 下载
  'srv.nintendo.net',
  'd4c.nintendo.net',
  'cdn.nintendo.net',
  // Pixiv 镜像
  'pixiv.re',
]

// 自定义屏蔽名单
let DOMAIN_BLOCKLIST = []

// 其他自定义规则
let CUSTOM_RULES = []

// 要过滤的节点关键词 (例如广告、说明等)
let PROXY_FILTER = /(http.+\..+)|请|剩余|套餐|流量|优惠|活动|到期|过期|网址/i

// --- 2. 地区配置中心 ---
// 此处统一管理所有地区信息。
// 策略组的排序将严格按照此处的 key 顺序。
// 已大致按地理位置由近及远排序。
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
  '🇰🇷 韩国': {
    keywords: ['🇰🇷', 'KR', 'Korea', 'South Korea', '韩国'],
    domains: [],
  },
  '🇯🇵 日本': {
    keywords: ['🇯🇵', 'JP', 'Japan', '日本'],
    domains: ['dmm.co.jp', 'abema.tv', 'nicovideo.jp'],
  },
  '🇸🇬 新加坡': {
    keywords: ['🇸🇬', 'SG', 'Singapore', '新加坡', '狮城'],
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
  '🇦🇺 澳大利亚': {
    keywords: ['🇦🇺', 'AU', 'Australia', '澳大利亚', '澳洲'],
    domains: [],
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
  '🇬🇧 英国': {
    keywords: ['🇬🇧', 'UK', 'United Kingdom', 'England', '英国'],
    domains: ['bbc.co.uk'],
  },
  '🇨🇦 加拿大': {
    keywords: ['🇨🇦', 'CA', 'Canada', '加拿大'],
    domains: [],
  },
  '🇺🇸 美国': {
    keywords: ['🇺🇸', 'US', 'USA', 'United States', 'America', '美国'],
    domains: [
      'max.com',
      'hulu.com',
      'disneyplus.com',
      'tv.youtube.com',
    ],
  },
}

// --- 3. 内部常量 ---
const PROXY_GROUP = 'PROXY',
  MANUAL_GROUP = 'MANUAL',
  DIRECT_GROUP = 'DIRECT',
  DEFAULT_GROUP = 'DEFAULT',
  REJECT_GROUP = 'REJECT',
  ADS_GROUP = 'ADS'

// --- 4. 核心配置 ---
const optimalDnsConfig = {
  enable: true,
  listen: '0.0.0.0:1053',
  ipv6: false,
  'prefer-h3': false,
  'use-hosts': true,
  'respect-rules': false,
  'enhanced-mode': 'fake-ip',
  'fake-ip-range': '198.18.0.1/16',
  'fake-ip-filter': ['geosite:private', 'geosite:connectivity-check'],
  // 直连域名 DNS
  'direct-nameserver': [
    'https://doh.pub/dns-query',
    'https://dns.alidns.com/dns-query',
  ],
  // 国外域名 DNS
  nameserver: ['tls://1.1.1.1', 'tls://8.8.4.4'],
  'proxy-server-nameserver': ['https://doh.pub/dns-query'],
  'default-nameserver': ['223.5.5.5'],
}

const geoxConfig = {
  geoip:
    'https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat/releases/download/latest/geoip.dat',
  // 使用原版 geosite
  geosite:
    'https://testingcf.jsdelivr.net/gh/v2fly/domain-list-community@release/dlc.dat',
  mmdb: 'https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat/releases/download/latest/country.mmdb',
  asn: 'https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat/releases/download/latest/GeoLite2-ASN.mmdb',
}

// --- 5. 辅助函数 ---
const getProxyRegion = (proxyName) => {
  for (const region in REGION_MAP) {
    const { keywords } = REGION_MAP[region]
    const patternParts = keywords.map((kw) => {
      if (/^[a-zA-Z\s]+$/.test(kw)) {
        const processedKw = kw.replace(/\s+/g, '\\s+')
        return `(?<![a-zA-Z])${processedKw}(?![a-zA-Z])`
      }
      return kw
    })
    const finalPattern = new RegExp(patternParts.join('|'), 'i')
    if (finalPattern.test(proxyName)) {
      return region
    }
  }
  return '其他地区'
}

// --- 6. 主函数 ---
const main = (config) => {
  // --- 注入基础配置 ---
  config.dns = optimalDnsConfig
  config['geox-url'] = geoxConfig

  // --- 处理节点 ---
  const allProxies = config.proxies
    .map((p) => p.name)
    .filter((name) => !PROXY_FILTER.test(name))

  const regionGroups = {}
  allProxies.forEach((proxyName) => {
    const region = getProxyRegion(proxyName)
    if (!regionGroups[region]) {
      regionGroups[region] = []
    }
    regionGroups[region].push(proxyName)
  })

  let autoRegionGroups = Object.entries(regionGroups)
    .map(([region, proxies]) => ({
      name: region,
      type: 'url-test',
      proxies: proxies.filter((p) => p !== region),
      url: 'http://www.gstatic.com/generate_204',
      interval: 300,
      tolerance: 100,
    }))
    .filter((group) => group.proxies.length > 0)

  // --- 定义路由规则 ---
  const createRule = (domainFilter, groupName) => [
    (domainFilter.includes(',') && domainFilter.split(',')[0]) || 'DOMAIN-SUFFIX',
    domainFilter.split(',')[1] || domainFilter,
    groupName,
    domainFilter.split(',')[2]
  ].filter(v => v !== undefined).join(',')
  const existingRegionGroupNames = new Set(autoRegionGroups.map((g) => g.name))
  const regionSpecificRules = Object.entries(REGION_MAP)
    .filter(
      ([groupName, data]) =>
        existingRegionGroupNames.has(groupName) && data.domains.length > 0
    )
    .flatMap(([groupName, data]) =>
      data.domains.map((domain) => createRule(domain, groupName))
    )

  config.rules = [
    // 自定义规则
    ...DOMAIN_BLOCKLIST.map((domain) => createRule(domain, REJECT_GROUP)),
    ...DOMAIN_BLACKLIST.map((domain) => createRule(domain, PROXY_GROUP)),
    ...DOMAIN_WHITELIST.map((domain) => createRule(domain, DIRECT_GROUP)),
    ...CUSTOM_RULES,

    // 地区分流
    ...regionSpecificRules,

    // 广告拦截
    `GEOSITE,category-ads-all,${ADS_GROUP}`,

    // 内网直连
    `IP-CIDR,192.168.0.0/16,${DIRECT_GROUP},no-resolve`,
    `IP-CIDR,10.0.0.0/8,${DIRECT_GROUP},no-resolve`,
    `IP-CIDR,172.16.0.0/12,${DIRECT_GROUP},no-resolve`,
    `IP-CIDR,127.0.0.1/8,${DIRECT_GROUP},no-resolve`,
    `GEOSITE,private,${DIRECT_GROUP},no-resolve`,

    // 特例
    `GEOSITE,gfw,${PROXY_GROUP}`, // GFW
    `GEOSITE,geolocation-!cn@cn,${DIRECT_GROUP}`, // 可直连的国外站点
    `GEOSITE,geolocation-cn@!cn,${PROXY_GROUP}`, // 需代理的国内站点

    // 通例
    `GEOSITE,geolocation-cn,${DIRECT_GROUP}`, // 国内站点
    `GEOSITE,tld-cn,${DIRECT_GROUP}`, // 国内域名
    `GEOIP,CN,${DIRECT_GROUP}`, // 国内 IP（放最后，避免不必要的 DNS 解析）
    // `GEOSITE,geolocation-!cn,${PROXY_GROUP}`, // 国外站点（建议跟随兜底设置）
    
    // 兜底
    `MATCH,${DEFAULT_GROUP}`,
  ]

  // --- 创建并重排策略组 ---
  const regionOrder = Object.keys(REGION_MAP)

  const sortedRegionGroups = autoRegionGroups.sort((a, b) => {
    if (a.name === '其他地区') return 1
    if (b.name === '其他地区') return -1
    const indexA = regionOrder.indexOf(a.name)
    const indexB = regionOrder.indexOf(b.name)
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })

  const sortedRegionNames = sortedRegionGroups.map((g) => g.name)

  const proxySelectGroup = {
    name: PROXY_GROUP,
    type: 'select',
    proxies: [MANUAL_GROUP, ...sortedRegionNames],
  }
  const manualSelectGroup = {
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

  config['proxy-groups'] = [
    proxySelectGroup,
    manualSelectGroup,
    defaultGroup,
    adsGroup,
    ...sortedRegionGroups,
  ]

  config['proxy-groups'].forEach((group) => {
    if (group.proxies) {
      group.proxies = group.proxies.filter(
        (proxyName) => !PROXY_FILTER.test(proxyName)
      )
    }
  })

  return config
}
