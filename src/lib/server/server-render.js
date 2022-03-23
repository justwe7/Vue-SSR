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
