/**
 * 服务端页面级缓存中间件
*/
 const LRU = require('lru-cache')

 const longCache = new LRU({
   max: 400,
   maxAge: 24 * 3600 * 1000 // 1 day 后过期
 })
 
 const shortCache = new LRU({
   max: 400,
   maxAge: 1 * 60 * 1000 // 1min 后过期
 })
 
 const cacheMiddleware = async function (ctx, next) {
   ctx.longCache = longCache
   ctx.shortCache = shortCache
   // 在entry-server中进行缓存读取
   await next()
   // 缓存设置
   // SSR 完成后将模板缓存
   // TODO 缓存规则 -- 中间件未通过serverRender渲染，不会添加siteConfig字段
   if (ctx.siteConfig && ctx.siteConfig.enableCache) {
     const cacheKey = ctx.host + ctx.originalUrl
     const shortCacheFlag = ctx.cacheAsyncDataHook || Boolean(shortCache.get(cacheKey)) // 缓存类型标记
     if (shortCacheFlag) {
       shortCache.set(cacheKey, ctx.body)
     } else {
       longCache.set(cacheKey, ctx.body)
     }
   }
 }
 
 module.exports = {
   cacheMiddleware,
   longCache,
   shortCache,
 }
 