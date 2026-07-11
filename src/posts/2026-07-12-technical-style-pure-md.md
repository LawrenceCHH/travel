---
layout: post
title: "[純MD版] 現代 Web 應用架構設計：高併發 API 伺服器與快取策略實戰"
subtitle: "解析前後端解耦、Redis 多級快取與資料一致性設計方案"
date: 2026-07-12 15:10:00 +0800
background: '/img/posts/tech_architecture.jpg'
tags:
  - 架構設計
  - Redis 快取
  - 純MD排版
---

## 引言：高併發下的系統瓶頸

在現代網際網路架構中，隨著用戶規模與請求量的爆發式增長，單一的資料庫讀寫往往會成為整個系統的效能瓶頸。為了提供低延遲、高吞吐量的服務，合理的架構解耦以及快取機制（Caching）的引入，是系統設計中必不可少的環節。

本文將探討如何設計一個高併發的 Web 應用架構，並重點分析多級快取、Redis 策略以及資料一致性的防護方案。

---

## 1. 現代前後端解耦系統架構

在高併發場景下，前後端分離（Decoupling）是首要採取的架構模式。下圖展示了標準的現代 Web 服務拓撲架構：

![Figure 1.0: Full-Stack Decoupled Architecture with Load-Balanced API Server and Redis Caching](/travel/img/posts/tech_architecture.jpg)

整個系統分為三個核心層次：
1. **Frontend Client**：瀏覽器與行動端 App，透過 CDN 靜態資源加速，利用 Ajax/Fetch 發送非同步 API 請求。
2. **Backend API Server**：由負載均衡器（Load Balancer）分發至多個 Node.js/Go/Python 無狀態微服務節點。
3. **Storage & Cache Layer**：熱點資料暫存在高性能快取中（如 Redis/Memcached），冷資料與事務性操作則持久化至關聯型資料庫（如 PostgreSQL）或 NoSQL 資料庫。

---

## 2. 快取讀寫策略對比

為快取層選擇正確的模式，直接決定了系統的複雜度與容錯性。常見的快取策略包括以下三種：

| 快取更新模式 (Pattern) | 讀操作流程 | 寫操作流程 | 優點 / 缺點 |
| :--- | :--- | :--- | :--- |
| **Cache-Aside** (旁路快取) | 先查快取，若 Miss 則查 DB 並回寫快取。 | 先更新 DB，再直接刪除舊快取。 | **[優]** 最常用，簡單安全。<br>**[缺]** 可能有短暫不一致。 |
| **Write-Through** (直寫快取) | 同上，快取由代理層透明處理。 | 寫入時，由快取層同步寫入 DB 後返回。 | **[優]** 無不一致問題。<br>**[缺]** 寫延遲較高，寫壓力大。 |
| **Write-Behind** (後寫快取) | 同上。 | 唯獨寫入快取，異步批量將更新刷回 DB。 | **[優]** 極致的寫效能。<br>**[缺]** DB 宕機恐丟失未落盤資料。 |

---

## 3. Node.js + Redis 實戰程式碼範例

下面是使用 Node.js 連接 Redis，並在 Express 框架中實作 `Cache-Aside` 模式與自動過期機制的中介軟體（Middleware）範例：

```javascript
const express = require('express');
const redis = require('redis');

const app = express();
const redisClient = redis.createClient({ url: 'redis://localhost:6379' });

// 初始化 Redis 連線
(async () => {
  redisClient.on('error', (err) => console.error('Redis Client Error', err));
  await redisClient.connect();
})();

// 旁路快取快照讀取中介軟體
const cacheMiddleware = (ttl = 300) => {
  return async (req, res, next) => {
    const { id } = req.params;
    const cacheKey = `posts:detail:${id}`;

    try {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        console.log(`[Cache Hit] Key: ${cacheKey}`);
        return res.json(JSON.parse(cachedData)); // 直接返回快取內容
      }

      console.log(`[Cache Miss] Fetching from DB for Key: ${cacheKey}`);
      // 將 res.json 包裝起來，以便在 DB 返回時自動存入快取
      const originalJson = res.json;
      res.json = (data) => {
        redisClient.setEx(cacheKey, ttl, JSON.stringify(data)); // 設定 TTL 存入 Redis
        originalJson.call(res, data);
      };
      next();
    } catch (err) {
      console.error('Cache middleware error:', err);
      next(); // 降級處理：快取異常時直接放行至 DB 查詢
    }
  };
};

// 使用快取中介軟體，限時 5 分鐘
app.get('/api/posts/:id', cacheMiddleware(300), async (req, res) => {
  const { id } = req.params;
  const post = await database.findPostById(id); // 模擬關聯型資料庫查詢
  res.json(post);
});
```

---

> [!WARNING]
> **警惕：高併發下的三大快取陷阱**
>
> 1. **快取雪崩 (Cache Avalanche)**：大量 Key 在同一時間失效。應在 TTL 上加入隨機擾動時間 (Jitter)，防止集中失效。
> 2. **快取擊穿 (Hotspot Key)**：超熱點 Key 失效的瞬間，大量併發直接壓垮資料庫。應使用互斥鎖（Distributed Mutex Lock）保護 DB 載入路徑。
> 3. **快取穿透 (Cache Penetration)**：惡意查詢不存在的 Key。應在快取層最前線放置布隆過濾器（Bloom Filter）或快取空結果（`"null"`）。

---

## 4. 總結

快取是高併發系統設計的靈丹妙藥，但引入快取也意味著系統狀態的複雜化。在設計時，務必遵循「先主存、後快取」的更新順序，並配合合理的資料降級、熔斷機制，才能保證 Web 應用在高併發流量潮汐下依然堅如磐石。
