<template>
  <div class="LeftDrawer">
    <el-drawer
      :title="'MTSAS' + type + '总排行榜'"
      :visible.sync="drawer"
      direction="ltr"
      @close="closeLeftBar"
    >
      <ul class="drawer-list">
        <li v-for="(item, index) in RL" :key="index">
          <p>
            {{ index + 1 }}.<a @click="goMovieDetail(item.id)">{{
              item.title
            }}</a>
          </p>
        </li>
      </ul>
    </el-drawer>
    <div class="handle-float" @click="openLeftBar">
      <i class="el-icon-caret-right"></i>
    </div>
  </div>
</template>
<script>
export default {
  props: ["RL", "type"],
  data() {
    return {
      drawer: false,
    };
  },
  methods: {
    // 跳转电影详情页
    goMovieDetail(mid) {
      window.open(global.env.DOMAIN_NAME + "/movie/" + mid);
    },
    openLeftBar() {
      this.drawer = true;
    },
    closeLeftBar() {
      console.log("关闭");
    },
  },
};
</script>
<style scoped lang="scss">
.handle-float {
  display: flex;
  align-items: center;
  width: 20px;
  height: 40px;
  position: fixed;
  z-index: 3;
  left: 0;
  top: 50%;
  background-color: #ffffff87;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  box-shadow: 1px 0px 4px 1px #00000080;
  i {
    font-size: 20px;
  }
}
.drawer-list {
  display: flex;
  justify-content: center;
  flex-direction: column;
  li {
    width: 100%;
    padding: 5px;
    p {
      font-size: 18px;
      a:hover {
        font-size: 20px;
        color: gold;
        transition: all 0.1s;
      }
    }
  }
}
</style>
