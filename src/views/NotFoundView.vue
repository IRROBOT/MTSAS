<template>
  <div class="url-error">
    <TopBar></TopBar>
    <div class="img-wrapper">
      <p class="words"><span>404 NOT FOUND</span></p>
      <div class="btn-wrapper">
        <el-button type="primary" @click="$router.push('/home')"
          >返回首页</el-button
        >
        <el-button @click="$router.go(-1)">返回上一页</el-button>
      </div>
    </div>
    <Footer></Footer>
  </div>
</template>
<script>
import TopBar from "@/components/common/TopbarView.vue";
import Footer from "@/components/common/FooterView.vue";
export default {
  components: {
    TopBar,
    Footer,
  },
  data() {
    return {};
  },
};
</script>
<style scoped lang="scss">
.img-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  justify-content: center;
  align-items: center;
  background-color: black;
  background-size: 100% 100%;
}
.words {
  font-size: 200px;
  text-align: center;
  color: #333;
  font-weight: bold;
  span:hover {
    color: #fff;
    transition: all 1s;
    text-decoration: outline;
    -webkit-text-stroke: 5px skyblue;
    text-shadow: 10px 0px 30px #f4feff;
  }
  span {
    transition: ease-out 1s;
  }
}
</style>
