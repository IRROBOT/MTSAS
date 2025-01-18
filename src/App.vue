<template>
  <div id="app">
    <keep-alive>
      <!--缓存组件，提升性能 不是所有页面都需要缓存-->
      <router-view v-if="$route.meta.keepAlive"></router-view>
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive"></router-view>
  </div>
</template>

<script>
export default {
  created() {
    this.$store.commit("initUser");
    this.$store.commit("webInit");
    this.$store.dispatch("initCollectionFolder");
    this.$store.dispatch("getMyComment");
    this.$store.dispatch("getUserMessage");
    //this.$store.dispatch("getUserMessage");
  },
};
</script>
