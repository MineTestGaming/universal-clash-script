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
const CUSTOM_BLACKLIST = [
  // 'googleapis.cn', // 如果希望 Google Play 下载走代理，请放开本行
]

// 自定义直连名单
const CUSTOM_WHITELIST = [
  'xn--ngstr-lra8j.com', // 如果希望 Google Play 下载走代理，请注释本行
  'srv.nintendo.net',
  'd4c.nintendo.net',
  'cdn.nintendo.net',
  // `GEOSITE,microsoft`,
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

// 要过滤的节点关键词 (例如广告、说明等)
const PROXY_FILTER = /(http.+\..+)|请|剩余|套餐|流量|优惠|活动|到期|过期|网址/i

// 是否启用外网 GEOSITE 规则
// （若开启，少数情况会导致外网走不到国内 CDN，可以通过自定义直连名单解决）
const IS_GEOSITE_BLACKLIST_ENABLED = true

// 是否启用 DNS 和 GEOIP 规则（推荐开启）
const IS_DNS_ENABLED = true

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
  'respect-rules': true, // DNS 请求遵循代理规则
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
  // 国外 DNS 作为兜底
  fallback: ['tls://8.8.4.4', 'tls://1.1.1.1'],
  // 如果国内 DNS 解析到的不是 CN 的 IP，则采用 fallback 的结果
  'fallback-filter': {
    geoip: true,
  },
  'proxy-server-nameserver': ['https://doh.pub/dns-query'], // 解析代理服务器域名
  'default-nameserver': ['223.5.5.5'], // 解析 DNS 域名
}

const geoxConfig = {
  geoip:
    'https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat/releases/download/latest/geoip.dat',
  geosite:
    'https://cdn.jsdelivr.net/gh/Loyalsoldier/v2ray-rules-dat@release/geosite.dat',
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
  config = {
    proxies: config.proxies
  }
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

    // 白名单
    `GEOSITE,cn,${DIRECT_GROUP}`,
    `GEOSITE,win-update,${DIRECT_GROUP}`,

    // 黑名单
    ...(IS_GEOSITE_BLACKLIST_ENABLED
      ? [
          `GEOSITE,gfw,${PROXY_GROUP}`, // GFW
          // `GEOSITE,geolocation-!cn,${PROXY_GROUP}`, // 国外站点（如果希望所有国外站点代理，解除本行注释）
        ]
      : []),

    // IP
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
