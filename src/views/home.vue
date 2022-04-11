<template>
  <div class="home">
    页面 home
    <div>{{ abc2 }}9999</div>
    <button @click="foo">接口请求</button>
  </div>
</template>
<script type="text/ecmascript-6">
import axios from 'axios'
// import a from './xx'
// console.log(a)

export default {
  async asyncData ({ store, myAddData, errorHandler, urlRedirect }) {
    // console.log(store)
    // throw { code : 500 }
    // urlRedirect('/detail')
    // try {
    //   obj.a = 2
    // } catch (error) {
    //   errorHandler(error)
    // }
    console.log('asyncData:', myAddData)
    return {
      abc2: 77277
    }
  },
  mounted () {
    // require('./xxx')
  },
  methods: {
    foo () {
      console.log(9999)
      axios.get('/api/mp-data')
    }
  }
}
</script>
<style lang="scss" rel="stylesheet/scss">
.home {
  opacity: 1;
  height: 300px;
  color: #f00;

  // background-color: yellowgreen;
}
</style>
