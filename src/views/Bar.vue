<template>
  <div>
    <h1 style="color: blue">Bar2</h1>
    {{ bar }}
    <!-- {{ foo }} -->
    <div class="item" v-for="item in itemList">{{ item }}</div>
    <!-- {{ itemList }} -->
  </div>
</template>

<script>
export default {
  name: 'Bar',
  computed: {
    itemList () {
      return this.$store.state.items
    }
  },
  data () {
    return {
      bar: 'data钩子'
    }
  },
  async asyncData ({ store }) {
    const data = {
      foo: 'asyncData数据'
    }
    await store.dispatch('fetchItem', { id: 2 })
    return data
  },
  // async asyncData ({ store }) {
  //   return store.dispatch('fetchItem', { id: 2 })
  // },
  mounted() {
    // fetch('https://api-puce-rho.vercel.app/api/idCard?json=1').then(res => res.json()).then(data => {
    //   console.log(data)
    // })
  },
}
</script>

<style>
.item {
  background-color: red;
}
</style>