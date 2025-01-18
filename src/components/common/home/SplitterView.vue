<template>
  <div class="splitter">
    <div class="top-content-title-bar">
      <div class="left-title">
        <slot name="start"><h2>电视剧排行榜</h2></slot>
      </div>
      <div class="right-pointer">
        <slot name="end"
          ><h2>更多<i class="el-icon-d-arrow-right"></i></h2
        ></slot>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {};
  },
  methods: {},
};
</script>
<style scoped lang="scss">
@import "@/assets/css/home/splitter.scss";
</style>
