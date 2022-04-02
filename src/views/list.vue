<template>
  <div class="home">
    <dl v-for="item in list">
      <dt>{{ item.name }}</dt>
      <dd v-for="subItem in item.list">
        {{ subItem }}
      </dd>
    </dl>
  </div>
</template>
<script type="text/ecmascript-6">
import axios from 'axios'
export default {
  async asyncData ({ store, myAddData, errorHandler, urlRedirect }) {
    const { data: list } = await axios.get('/api/mp-data')
    return {
      list,

    }
  },
  mounted() {
    console.log(this.$store)
  },
  methods: {},
}
</script>
<style lang="scss" rel="stylesheet/scss">
.home {
  color: goldenrod;
  dl {
    margin-bottom: 10px;
    background-color: #fafafa;
  }
}
</style>
