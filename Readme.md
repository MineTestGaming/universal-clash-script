# 通用 Clash 配置脚本 (Universal Clash Script)

## 解决什么问题？

不同的机场的 Clash 订阅配置五花八门，策略组繁杂，自定义和迁移都很困难。

本脚本通过预处理原始配置文件，提取出上游配置中的节点信息，转换成统一的最优化配置。

## 特性

- 根据节点名称按地区分类，创建对应的 `url-test` 组。使用时只需选择地区即可获得最优连接。
- 简洁、优化的分流策略和 DNS 配置，应对绝大多数情况。
- 可配置的地区分流策略。
- 易于配置的黑白名单。
  
## 使用

兼容支持 JavaScript 脚本的 Clash 客户端。推荐在 [FIClash](https://github.com/chen08209/FlClash) 或 [Clash Verge Rev](https://github.com/clash-verge-rev/clash-verge-rev) 中使用。

### 从链接导入脚本

[universal_clash_script](https://github.com/john-walks-slow/universal-clash-script/raw/refs/heads/main/universal_clash_script.js)

## 配置

你可以通过修改脚本上方常量，快速自定义路由规则。

### 1. 黑白名单

- `DOMAIN_BLACKLIST`: 在此添加的域名或规则将强制代理。
  - 如果配置的是域名，则默认为 `DOMAIN-SUFFIX`。
  - 通过逗号分隔符可以指定规则类型，如 `DOMAIN-KEYWORD,foo`。
- `DOMAIN_WHITELIST`: 在此添加的域名或规则将强制直连。

### 2. 地区分流

```javascript
const REGION_MAP = {
    "🇭🇰 香港": {
        keywords: ["🇭🇰", "HK", "Hong Kong", "香港"], // 识别节点的关键词
        domains: ["tvb.com", "viu.tv"],             // 需要路由到地区的域名或规则
    },
    "🇯🇵 日本": {
        keywords: ["🇯🇵", "JP", "Japan", "日本"],
        domains: ["dmm.co.jp", "abema.tv", "nicovideo.jp"]
    },
    // ... 其他地区
};
```

例如，当你订阅中的某个节点名称包含 "JP"，它会被自动归入 `🇯🇵 日本` 这个 `url-test` 组。同时，当你访问 `dmm.co.jp` 时，流量会自动被路由到 `🇯🇵 日本` 组。

## 许可证

MIT