<template>
  <div class="detail">
    页面 detail {{bar}}
    <ul>
      <li v-for="item in itemList">{{ item }}</li>
    </ul>
  </div>
</template>
<script type="text/ecmascript-6">
export default {
   async asyncData ({ store }) {
    await store.dispatch('fetchItem', { id: 1 })
    return {
      bar: 777
    }
  },
  data () {
    return {}
  },
  computed: {
    itemList () {
      return this.$store.state.items
    }
  },
  methods: {}
}
</script>
<style lang="scss" rel="stylesheet/scss">
.detail {
  height: 200px;
  background-color: burlywood;
}
</style>
