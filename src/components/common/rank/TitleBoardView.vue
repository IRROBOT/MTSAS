<template>
  <div class="TitleBoard">
    <div class="content-title">
      <p class="text-shadow">
        MTSAS{{ type }}总排行榜{{ mode != "" ? "Top" + mode : mode }}
      </p>
    </div>
  </div>
</template>
<script>
export default {
  props: ["type", "mode"],
  data() {
    return {};
  },
};
</script>
<style scoped lang="scss">
.content-title {
  width: 100%;
  height: 80px;
}
.text-shadow {
  text-align: center;
  font-size: 45px;
  -webkit-text-stroke: 1px white;
  color: transparent;
  text-shadow: 0 0 18px white;
}
</style>
