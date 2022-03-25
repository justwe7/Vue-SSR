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
   async asyncData ({ store, myAddData }) {
    console.log('asyncData:', myAddData)
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
  mounted() {
    fetch('https://api-puce-rho.vercel.app/api/idCard?json=1').then(res => res.json()).then(data => {
      console.log(data)
    })
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
