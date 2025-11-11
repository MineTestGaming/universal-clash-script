/**
 * 通用 Clash 配置脚本，按地区自动分组
 */

// --- 1. 内部常量 ---
const PROXY_GROUP = 'PROXY',
  MANUAL_GROUP = 'MANUAL',
  DIRECT_GROUP = 'DIRECT',
  DEFAULT_GROUP = 'DEFAULT',
  REJECT_GROUP = 'REJECT',
  ADS_GROUP = 'ADS'

// --- 2. 用户配置 ---
// 自定义代理名单
const CUSTOM_BLACKLIST = []

// 自定义直连名单
const CUSTOM_WHITELIST = [
  'srv.nintendo.net',
  'd4c.nintendo.net',
  'cdn.nintendo.net',
]

// 自定义屏蔽名单
const CUSTOM_BLOCKLIST = [
  'firebaseremoteconfigrealtime.googleapis.com',
  'firebaseremoteconfig.googleapis.com',
]

// 其他自定义规则
const CUSTOM_PRIORITY_RULES = []

// 自定义兜底规则
const CUSTOM_FALLBACK_RULES = []

// 是否开启 GFW 和 外网黑名单
// 开启的优点：更安全。外网网址不经过国内 DNS。
// 开启的缺点：导致部分外网站点走不到国内 CDN。（如 Google Play 下载）
const IS_GEOSITE_BLACKLIST_ENABLED = false

// 开启 GEOSITE_BLACKLIST 时额外的黑名单，用于解决地区不匹配导致的访问问题。
const CUSTOM_GEOSITE_BLACKLIST = ['googleapis.cn']

// 是否启用 DNS 和 GEOIP 规则（推荐开启）
const IS_DNS_ENABLED = true

// 要过滤的节点关键词 (例如广告、说明等)
const PROXY_FILTER = /(http.+\..+)|请|剩余|套餐|流量|优惠|活动|到期|过期|网址/i

// --- 3. 地区配置中心 ---
// 此处统一管理所有地区信息。
// 大致按地理位置由近及远排序。
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
    domains: ['max.com', 'hulu.com', 'disneyplus.com', 'tv.youtube.com'],
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
  'respect-rules': false,
  'enhanced-mode': 'fake-ip',
  'fake-ip-range': '198.18.0.1/16',
  'fake-ip-filter': ['geosite:private', 'geosite:connectivity-check'],

  // 说明：此处 DNS 的目的是匹配 GEOIP,CN，我们希望最快解析出最近的 IP。
  // 因此优先使用国内 DNS，以国外 DNS 作为兜底，nameserver 和 fallback 会并发请求。
  // 如果想更加安全（即国外站点不通过国内 DNS），可以开启路由部分的 gfw 和 国外域名规则。用 nameserver-policy 再次分流似乎是多余的。
  // 而 direct-nameserver 会导致 DIRECT 被解析两次，并不适用当前场景。

  // 优先使用国内 DNS
  nameserver: [
    'https://doh.pub/dns-query',
    //'https://dns.alidns.com/dns-query' // 阿里的不好用，play store 解析不到下载地址
  ],
  // 国外 DNS 作为兜底
  fallback: ['tls://8.8.4.4', 'tls://1.1.1.1'],
  'proxy-server-nameserver': ['https://doh.pub/dns-query'], // 解析代理服务器域名
  'default-nameserver': ['223.5.5.5'], // 解析 DNS 域名
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
  /** 从用户规则创建规则行 */
  const createRule = (domainFilter, groupName) =>
    [
      // 无逗号则默认 DOMAIN-SUFFIX，有逗号则使用逗号分割的第一部分
      (domainFilter.includes(',') && domainFilter.split(',')[0]) ||
        'DOMAIN-SUFFIX',
      // 无逗号则整个字符串视为域名，有逗号则使用逗号分割的第二部分
      domainFilter.split(',')[1] || domainFilter,
      groupName,
      // 逗号分隔符的第三部分可以包含额外参数，如 no-resolve
      domainFilter.split(',')[2],
    ]
      .filter((v) => v !== undefined)
      .join(',')
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
    ...CUSTOM_PRIORITY_RULES,
    ...CUSTOM_BLOCKLIST.map((domain) => createRule(domain, REJECT_GROUP)),
    ...CUSTOM_BLACKLIST.map((domain) => createRule(domain, PROXY_GROUP)),
    ...CUSTOM_WHITELIST.map((domain) => createRule(domain, DIRECT_GROUP)),
    // GEOSITE_BLACKLIST 开启时的额外黑名单
    ...(IS_GEOSITE_BLACKLIST_ENABLED
      ? CUSTOM_GEOSITE_BLACKLIST.map((domain) =>
          createRule(domain, PROXY_GROUP)
        )
      : []),

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
    `GEOSITE,geolocation-!cn@cn,${DIRECT_GROUP}`, // 可直连的国外站点
    `GEOSITE,geolocation-cn@!cn,${PROXY_GROUP}`, // 需代理的国内站点

    // 黑名单（跟随 IS_GEOSITE_BLACKLIST_ENABLED）
    ...(IS_GEOSITE_BLACKLIST_ENABLED
      ? [
          `GEOSITE,gfw,${PROXY_GROUP}`, // GFW
          `GEOSITE,geolocation-!cn,${PROXY_GROUP}`, // 国外站点
        ]
      : []),

    // 白名单
    `GEOSITE,cn,${DIRECT_GROUP}`, // 国内站点和域名
    IS_DNS_ENABLED ? `GEOIP,CN,${DIRECT_GROUP}` : false, // 国内IP（GEOIP 规则放最后）

    // 兜底
    ...CUSTOM_FALLBACK_RULES,
    `MATCH,${DEFAULT_GROUP}`,
  ].filter((v) => v)

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
