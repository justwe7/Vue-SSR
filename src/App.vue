<template>
  <div id="app">
    <h1>Hello World!</h1>
    <router-link to="/">Foo</router-link>
    <router-link to="/Bar">Bar</router-link>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
html,
body {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  font-size: 16px;
}
</style>