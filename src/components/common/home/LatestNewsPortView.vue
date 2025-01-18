<template>
  <!-- <div class="latestNewsPort"> -->
  <div class="relate-news">
    <Splitter>
      <template v-slot:start><h2>最新资讯</h2></template>
      <template v-slot:end
        ><h2 @click="linkToNews">更多<i class="el-icon-d-arrow-right"></i></h2
      ></template>
    </Splitter>
    <ul class="news-content">
      <li
        class="news"
        v-for="i in 5"
        :key="i"
        @mouseenter="shadeNews(i - 1)"
        @mouseleave="shadeNews(i - 1)"
      >
        <transition name="el-zoom-in-center">
          <div class="shade" v-show="isTouch[i - 1]" @click="ToPageNews()">
            <transition name=".el-fade-in"
              ><i class="el-icon-arrow-right"></i
            ></transition>
          </div>
        </transition>
        <div class="relate-img">
          <img src="" alt="" />
        </div>
        <div class="text-contents">
          <h2 class="title-news">
            <span> Loki S2 Available to stream on Disney+ from 6 October </span>
          </h2>
          <p class="detail-news">
            Season 2 picks up in the aftermath of the shocking finale when Loki
            (Tom Hiddleston) finds himself in a battle for the soul of the Time
            Variance Authority. Along with Mobius, Hunter B-15 and a team of new
            and returning characters, Loki navigates an ever-expanding and
            increasingly dangerous multiverse in search of Sylvie, Judge
            Renslayer, Miss Minutes and the truth of what it means to possess
            free will and glorious purpose.
          </p>
        </div>
      </li>
    </ul>
  </div>
  <!-- </div> -->
</template>
<script>
import Splitter from "@/components/common/home/SplitterView.vue";
export default {
  data() {
    return {
      isTouch: [false, false, false, false],
    };
  },
  methods: {
    shadeNews(n) {
      this.$set(this.isTouch, n, !this.isTouch[n]);
    },
    ToPageNews() {
      //获取资讯id,去特定文章页
    },
    linkToNews() {
      //详情跳转链接到咨询页
      this.$router.push("/news");
    },
  },
  components: {
    Splitter,
  },
};
</script>
<style scoped lang="scss">
@import "@/assets/css/home/latestNews.scss";
</style>
