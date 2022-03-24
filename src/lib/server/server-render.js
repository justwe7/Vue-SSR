 import Vue from 'vue'
 const noopData = () => ({})
 
 /**
  * 净化组件，保证组件是函数式的并存在option对象
  * @param {Function|Object} Component | 组件构造函数or路由记录
  * @returns {Function} 组件构造函数
  */
 export function sanitizeComponent (Component) {
   // If Component already sanitized
   if (Component.options && Component._Ctor === Component) {
     return Component
   }
   if (!Component.options) {
     Component = Vue.extend(Component)
     Component._Ctor = Component
   } else {
     Component._Ctor = Component
     Component.extendOptions = Component.options
   }
   // For debugging purpose
   if (!Component.options.name && Component.options.__file) {
     Component.options.name = Component.options.__file
   }
   return Component
 }
 
 /**
  * 组件data函数重写，数据混合
  * @param {Function} Component | 组件构造函数
  * @param {Object} asyncData | 需要混合的数据对象
  */
 export function applyAsyncData (Component, asyncData) {
   const ComponentData = Component.options.data || noopData
   // Prevent calling this method for each request on SSR context
   if (!asyncData && Component.options.hasAsyncData) {
     return
   }
   Component.options.hasAsyncData = true
   Component.options.data = function () {
     const data = ComponentData.call(this)
     if (this.$ssrContext) {
       asyncData = this.$ssrContext.asyncData[Component.cid]
     }
     // 此处注意顺序！asyncData在前data在后！
     // return _.defaultsDeep({}, asyncData, data)
     return Object.assign({}, data, asyncData)
   }
   if (Component._Ctor && Component._Ctor.options) {
     Component._Ctor.options.data = Component.options.data
   }
 }
 
 /**
  * 函数Promise化
  * @param {Function} fn | 需要Promies化的函数
  * @param {Object} context | 函数执行上下文
  */
 export function promisify (fn, context) {
   let promise = fn(context)
   if (!promise || (!(promise instanceof Promise) && (typeof promise.then !== 'function'))) {
     promise = Promise.resolve(promise)
   }
   return promise
 }

 /**
 * 获取当前url路径
 * @param {String} base | 基础路径
 * @param {String} mode | 路由模式
 */
export function getLocation (base, mode) {
  var path = window.location.pathname
  if (mode === 'hash') {
    return window.location.hash.replace(/^#\//, '')
  }
  if (base && path.indexOf(base) === 0) {
    path = path.slice(base.length)
  }
  return (path || '/') + window.location.search + window.location.hash
}

/**
 * 执行匹配组件中的asyncData函数，并且和组件的data函数融合
 * @param {Object} Components 路由记录(非组件构造函数)
 * @param {Object} store
 * @param {Object} router
 * @param {Function} errorHandler
 */
 export function asyncComponents ({ Components, store, route, errorHandler, urlLocation, ...restParams }) {
  return Promise.all(Components.map(Component => {
    Component = sanitizeComponent(Component)
    if (Component.options.asyncData && typeof Component.options.asyncData === 'function') {
      return promisify(Component.options.asyncData, {
        store,
        route,
        ...restParams
        // urlLocation,
        // errorHandler
      }).then((asyncDataResult = {}) => {
        applyAsyncData(Component, asyncDataResult)
        return asyncDataResult
      })
    } else {
      return null
    }
  }))
}

/**
 * 支持热更新，重写当前父组件的$forceUpdate
 * @param {Object} $component
 * @param {Object} router
 * @param {Object} store
 * @param {Function} errorHandler
 */
 export function addHotReload ($component, router, store, errorHandler) {
  // 仅重写含有asyncData函数的父组件的$forceupdate
  if ($component.$vnode.data._hasHotReload || !$component.$parent || !$component.$options.asyncData) return
  // $vnode = 父组件_vnode
  $component.$vnode.data._hasHotReload = true
  var _forceUpdate = $component.$forceUpdate.bind($component.$parent)
  // $conpnent.$vnode.context
  $component.$vnode.context.$forceUpdate = async () => {
    const Components = router.getMatchedComponents(router.currentRoute)
    Promise.all(Components.map(Component => {
      Component = sanitizeComponent(Component)
      if (Component.options.asyncData && typeof Component.options.asyncData === 'function') {
        return promisify(Component.options.asyncData, {
          store,
          route: router.currentRoute,
          errorHandler
        }).then(asyncDataResult => {
          applyAsyncData(Component, asyncDataResult)
          return asyncDataResult
        })
      } else {
        return null
      }
    })).then(() => {
      _forceUpdate()
    }).catch(() => {
      _forceUpdate()
    })
  }
}

/**
 * 热更新支持
 * @param {Object|VueInstance}
 * @param {Object|VueRouter}
 * @param {Object|Vuex}
 * @returns {undefined}
 */
 export function hotReloadAPI (_app, router, store, errorHandler) {
  // only in develop support hot reload
  if (!module || !module.hot) return
  // 当前页面的所有vue组件
  const $components = getChildComponents(_app, [])
  $components.forEach(c => {
    addHotReload.bind(_app)(c, router, store, errorHandler)
  })
}

/**
 * 递归获取当前vue实例下所有路由子组件实例
 * @param {Object|VueInstance}
 * @param {Array}
 * @returns {Array|VueInstance}
 */
export function getChildComponents ($parent, $components = []) {
  $parent.$children.forEach(($child) => {
    if ($child.$options.__file) {
      $components.push($child)
    }
    if ($child.$children && $child.$children.length) {
      getChildComponents($child, $components)
    }
  })

  return $components
}
