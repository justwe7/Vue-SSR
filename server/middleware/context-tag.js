
module.exports = function () {
  return async function (ctx, next) {
    // query 中携带 ?downgrade=1 主动降级为客户端渲染
    if (ctx.query.downgrade === '1') {
      ctx._downgrade = true
    }
    await next()
  }
}
