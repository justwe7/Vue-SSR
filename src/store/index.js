import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export function createStore () {
  return new Vuex.Store({
    state: {
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
      }
    },
    mutations: {
      setItem (state, { id, item }) {
        Vue.set(state.items, id, item)
      }
    }
  })
}
