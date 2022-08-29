<template>
    vue app12xxss
    <router-link to="/">首页1</router-link>
    <router-link to="/detail">详情</router-link>
    <button @click="handleClick">bar</button>
    <router-view></router-view>
</template>
<script type="text/ecmascript-6">
export default {
  data () {
    return {
      foo: 'vue app'
    }
  },
  methods: {
    handleClick () {
      console.log(8)
    }
  }
}
</script>
<style lang="scss" rel="stylesheet/scss">
#app {
  color: blue;
}
</style>
