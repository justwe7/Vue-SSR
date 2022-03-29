const isServer = process.env.TARGET_ENV === 'server'

/**
 * 供 asyncData 使用的异常捕获函数
 * @param {Error} err asyncData 钩子抛出的异常
 */
export function errorHandler (err) {
  // TODO 如果是接口请求错误则降级渲染

  // 服务端抛出异常并中断后续流程，直接降级为客户端渲染
  if (isServer) {
    throw err
  } else {
    console.error(err)
  }
}

/**
 * 供 asyncData 使用重定向方法
 */
export function urlRedirect (ctx) {
  return function (url, code = 302) {
    if (ctx && isServer) {
      ctx.status = code
      ctx.redirect(url)
    } else {
      location.replace(url)
    }
  }
}
