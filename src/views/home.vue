<template>
  <div class="home">
    页面 home
    <div>
      {{abc}}9999
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
export default {
  async asyncData ({ store, myAddData }) {
    console.log('asyncData:', myAddData)
    return {
      abc: 123
    }
  },
}
</script>
<style lang="scss" rel="stylesheet/scss">
.home {
  height: 300px;
  color: #f00;
  background-color: yellowgreen;
}
</style>
