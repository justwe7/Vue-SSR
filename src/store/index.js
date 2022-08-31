import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    userInfo: {},
    vuexDataTimestamp: +new Date(),
    items: {}
  },
  actions: {
    fetchItem ({ commit }, id) {
      return axios
        .get('https://api-puce-rho.vercel.app/api/idCard?json=1')
        .then(res => res.data)
        .then((data) => {
          commit('setItem', { id, item: data })
        })
    },
    fetchUserInfo ({ commit }) {
      return axios
        .get('https://api-puce-rho.vercel.app/api/idCard?json=1&age=1&quantity=1')
        .then((res) => {
          commit('setUserInfo', res)
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
