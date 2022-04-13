import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import get from 'lodash/get'

Vue.use(Vuex)

export function createStore () {
  return new Vuex.Store({
    state: {
      userInfo: {},
      vuexDataTimestamp: +new Date(),
      items: {}
    },
    actions: {
      fetchItem ({ commit }, id) {
        // `store.dispatch()` 会返回 Promise，
        // 以便我们能够知道数据在何时更新
        return axios
          .get('https://api-puce-rho.vercel.app/api/idCard?json=1')
          .then(res => res.data)
          .then((data) => {
            commit('setItem', { id, item: data })
          })
        // return fetch('https://api-puce-rho.vercel.app/api/idCard?json=1').then(res => res.json()).then(data => {
        //   commit('setItem', { id, item: data })
        // })
      },
      fetchUserInfo ({ commit }) {
        return axios
          .get('https://api-puce-rho.vercel.app/api/idCard?json=1&age=1&quantity=1')
          .then((res) => {
            commit('setUserInfo', get(res, 'data.[0]', {}))
          })
      }
    },
    mutations: {
      setUserInfo (state, data) {
        state.userInfo = data
      },
      setItem (state, { id, item }) {
        Vue.set(state.items, id, item)
      }
    }
  })
}
