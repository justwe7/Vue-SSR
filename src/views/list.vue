<template>
  <div class="list">
    <dl v-for="item in list" :key="item.name">
      <dt>{{ item.name }}</dt>
      <dd v-for="(subItem, index) in item.list" :key="index">
        {{ subItem }}
      </dd>
    </dl>
  </div>
</template>
<script type="text/ecmascript-6">
import axios from 'axios'
import get from 'lodash/get' // 使用单独的模块帮助webpack进行摇树
// import { get } from 'lodash' // 需要使用 babel-plugin-lodash 进行语法转换

export default {
  async asyncData ({ store, myAddData, errorHandler, urlRedirect }) {
    // const { data: list } = await axios.get('/api/mp-data')
    const res = await axios.get('https://api-puce-rho.vercel.app/api/mp-data')
    return {
      list: get(res, 'data', [])
    }
  },
  mounted () {
    console.log(this.$store)
  },
  methods: {}
}
</script>
<style lang="scss" rel="stylesheet/scss">
.list {
  color: goldenrod;

  dl {
    margin-bottom: 10px;
    background-color: #fafafa;
  }
}
</style>
