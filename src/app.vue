<template>
  <div id="app">
    <router-link to="/home">首页</router-link>
    <router-link to="/list">列表</router-link>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  </div>
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
  color: peru;
}
</style>
