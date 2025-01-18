<template>
  <div class="home">
    <TopBar></TopBar>
    <Banner @bannerLoad="loadSign"></Banner>
    <HomeSkeleton v-if="isLoad"></HomeSkeleton>
    <div v-else>
      <div class="web-bulletin">
        <el-carousel direction="vertical" :autoplay="true" :interval="2000">
          <el-carousel-item v-for="(item,index) in bulletinList" :key="index">
            <div class="bulletin-text-warpper">
              <p @click="goSystemNotification">{{ item.content }}--{{ item.publishTime }}</p>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
      <div class="web-content">
        <!-- 每日榜单 -->
        <DailyRankPort></DailyRankPort>
      </div>
      <Footer></Footer>
      <el-backtop :visibility-height="1400"></el-backtop>
    </div>
  </div>
</template>
<script>
import TopBar from "@/components/common/TopbarView.vue";
import Banner from "@/components/common/home/BannerView.vue";
import DailyRankPort from "@/components/common/home/DailyRankPortView.vue";
import Footer from "@/components/common/FooterView.vue";
import HomeSkeleton from "./HomeSkeleton.vue";
import http from "@/common/api/request.js";
// const createSkeletonHTML = require("draw-page-structure/evalDOM");
// createSkeletonHTML().then((skeletonHTML) => {
//   // 观察浏览器控制台
//   console.log(skeletonHTML);
// });
export default {
  name: "HomeView",
  data() {
    return {
      isLoad: true,
      bulletinList:[]
    };
  },
  computed: {},
  created() {
this.getBulletinList();
  },
  mounted() {
    
  },
  methods: {
    // ...mapActions(["getUserMessage"]),
    loadSign(data) {
      this.isLoad = data;
    },
    getBulletinList() {
      http.$axios({
        url:'/mtv/api/getBulletinList',
        method:'get',
      }).then(res=>{
        if(res.success){
          this.bulletinList = res.data;
        }else{
          this.$message.error(res.message);
        }
      })
    },
    goSystemNotification(){
      window.open(global.env.DOMAIN_NAME + "/userCenter/notice?tar=1");
    }
  },
  components: {
    TopBar,
    Banner,
    DailyRankPort,
    HomeSkeleton,
    Footer,
  },
};
</script>
<style scoped lang="scss">
.home {
  height: auto;
  background-color: #00284e;
  .web-bulletin {
    //网站公告部分
    background-color: #ffffff73;
    height: 80px;
    margin: 0 auto;
    margin-top: 20px;
    margin-left: 40px;
    margin-right: 40px;
    border-radius: 10px;
    overflow: hidden;
    ::v-deep .el-carousel {
      position: relative;
      top: -138%;
      .bulletin-text-warpper {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        p {
          color: orange;
        }
        p:hover{
          text-decoration: underline;
          cursor: pointer;
        }
      }
    }
  }
  .web-content {
    max-width: 2560px;
    margin: 0 auto;
  }
}
</style>
