<template>
  <div class="banner-content">
    <div class="carousel">
      <el-carousel>
        <el-carousel-item v-for="(item, index) in carouselList" :key="index">
          <div class="shade" @click="goPosterDetail(item.mid)">
            <p>{{ item.description }}</p>
          </div>
          <img :src="item.imgUrl" alt="pic" />
        </el-carousel-item>
      </el-carousel>
    </div>
    <div class="month-rank">
      <div class="title-bar">
        <h2 @click="LinkToMR">
          电影总排行榜<i class="el-icon-d-arrow-right"></i>
        </h2>
      </div>
      <ul class="posters-wrapper">
        <li
          class="poster-wrapper"
          v-for="(item, index) in RankList"
          :key="index"
          :style="'transform: translateY(' + distance[index] + 'px)'"
          @mouseenter="stopTimer"
          @mouseleave="startTimer(20)"
        >
          <div class="left-bar">
            <div v-for="left in 6" :key="left"></div>
          </div>
          <div class="midle-poster">
            <div class="rank-text-bar">
              <span>{{ index + 1 }}</span>
              <i class="icon iconfont icon-paimingbiaoqian"></i>
            </div>
            <img
              :src="baseUrl + item.posterImg"
              :alt="item.title"
              @click="toDetail(item.id)"
            />
          </div>
          <div class="right-bar">
            <div v-for="right in 6" :key="right"></div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import getMovieInfo from "@/assets/js/getMovieInfo.js";
import http from "@/common/api/request.js";
import router from "@/router";
import { mapState } from "vuex";
export default {
  data() {
    return {
      count: 0,
      count_distance: 0,
      count_index: 0,
      distance: [],
      posters: [],
      carouselList: [],
      LiHeight: 0,
      slip_distance: 0,
      tid: [],
      RankList: [],
    };
  },
  computed: {
    ...mapState({
      loginStatus: (state) => state.user.loginStatus,
    }),
  },
  created() {
    this.baseUrl = global.env.SERVER_BASE + "/public/images/posters/";
    this.getCarouselList();
  },
  mounted() {
    this.fetchList(
      20,
      0,
      ["mi.id", "mi.title", "mi.posterImg"],
      "电影",
      ["mi.totalGrade", "desc"],
      [],
      this.loginStatus
    );
    //初始化加载20条数据
    this.initData(20);
  },
  methods: {
    async fetchList(limit, offset, field, artType, order, fuzzyQuery, isLog) {
      const res = await getMovieInfo.getRankList(
        limit,
        offset,
        field,
        artType,
        order,
        fuzzyQuery,
        isLog
      );
      this.$emit("bannerLoad", false);
      this.RankList = res.data;
    },
    initData(len) {
      this.LiHeight = 320; //li高度值
      this.slip_distance = this.LiHeight * len;
      this.distance.length = len;
      this.distance.fill(0);
      this.startTimer(len);
    },
    // 开启滚动
    startTimer(val) {
      this.stopAnimation = false;
      let lastTime = 0;
      const step = (timestamp) => {
        if (!lastTime) lastTime = timestamp;
        const progress = timestamp - lastTime;
        if (progress > 15) {
          // 控制帧率
          for (let i = 0; i < this.distance.length; i++) {
            let len = this.distance[i] - 1;
            this.$set(this.distance, i, len);
          }
          this.count_distance += -1;
          if (this.count_distance == this.LiHeight * -1) {
            this.count_distance = 0;
            if (this.count_index == val) {
              this.count_index = 0;
            }
            let n = this.count_index;
            let long =
              parseInt(this.distance[n]) + parseInt(this.slip_distance);
            this.$set(this.distance, n, long);
            this.count_index = n + 1;
          }
          lastTime = timestamp;
        }
        if (!this.stopAnimation) {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);
    },
    // 停止滚动
    stopTimer() {
      this.stopAnimation = true;
    },
    //获取轮播图
    getCarouselList(){
      http
        .$axios({
          url: "/mtv/api/getCarousel",
          method: "GET", //get请求对应 params  post请求的对应 data
        })
        .then((res) => {
          if (res.success) {
            this.carouselList = res.data;
          } else {
            this.$message.error(res.data);
          }
        });
    },
    goPosterDetail(mid){
      window.open(global.env.DOMAIN_NAME + "/movie/" + mid);
    },
    LinkToMR() {
      let param = 'movie';
      this.$router.push({
        name: "RankView",
        params:{tp:param},
        query: { m: 0, page: 1 },
      });
    },
    //到详情页
    toDetail(id) {
      window.open(global.env.DOMAIN_NAME + "/movie/" + id);
    },
  },
  beforeDestroy() {
    // 在组件销毁之前，清除定时器以避免内存泄漏
    this.stopTimer();
  },
};
</script>
<style scoped lang="scss">
@import "@/assets/css/home/banner.scss";
</style>
