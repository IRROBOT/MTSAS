<template>
  <div class="accessories">
    <Splitter>
      <template v-slot:start><h2>电影周边</h2></template>
      <template v-slot:end
        ><h2>更多<i class="el-icon-d-arrow-right"></i></h2
      ></template>
    </Splitter>
    <GoodsCard class="goods-list"></GoodsCard>
  </div>
</template>
<script>
import Splitter from "@/components/common/home/SplitterView.vue";
import GoodsCard from "@/components/common/GoodsCardView.vue";
export default {
  data() {
    return {};
  },
  methods: {},
  components: {
    Splitter,
    GoodsCard,
  },
};
</script>
<style lang="scss" scoped>
@import "@/assets/css/home/merchandise.scss";
</style>
