<template>
  <div class="home">
    页面 home
    <div>
      {{abc2}}9999
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
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
}
</script>
<style lang="scss" rel="stylesheet/scss">
.home {
  height: 300px;
  color: #f00;
  background-color: yellowgreen;
}
</style>
