<template>
  <div class="daily-rank">
    <Splitter>
      <template v-slot:end
        ><h2 @click="linkToDailyRank">
          更多<i class="el-icon-d-arrow-right"></i></h2
      ></template>
    </Splitter>
    <transition name="el-fade-in-linear">
      <div
        class="left-arrow"
        v-show="isShowArrow"
        @mouseenter="isOpenArrow(true)"
        @mouseleave="isOpenArrow(false)"
        @mousedown="scrollContents(10, -1)"
        @mouseup="stopSlide"
      >
        <i class="el-icon-arrow-left"></i>
      </div>
    </transition>
    <transition name="el-fade-in-linear">
      <div
        class="right-arrow"
        v-show="isShowArrow"
        @mouseenter="isOpenArrow(true)"
        @mouseleave="isOpenArrow(false)"
        @mousedown="scrollContents(10, 1)"
        @mouseup="stopSlide"
      >
        <i class="el-icon-arrow-right"></i>
      </div>
    </transition>
    <ul
      @mouseenter="isOpenArrow(true)"
      @mouseleave="isOpenArrow(false)"
      ref="li_window"
    >
      <CardPanel
        class="content-list"
        :off="offset"
        :RL="rankList"
        @LiRect="getLis"
        :spot="spot"
        :tagShow="false"
        ref="child"
      ></CardPanel>
    </ul>
  </div>
</template>
<script>
import Splitter from "@/components/common/home/SplitterView.vue";
import CardPanel from "@/components/common/CardPanelView.vue";
import getMovieInfo from "@/assets/js/getMovieInfo.js";
import { mapState } from "vuex";
export default {
  data() {
    return {
      isShowArrow: false,
      isIncrease: false,
      timerId: 0,
      offset: 0,
      rankList: [],
      LR: 0,
      spot: 0, //排名偏移量
      feildArr: [],
    };
  },
  computed: {
    ...mapState({
      loginStatus: (state) => state.user.loginStatus,
    }),
  },
  mounted() {
    this.feildArr = this.loginStatus
      ? [
          "mi.id",
          "mi.title",
          "mi.posterImg",
          "mi.totalGrade",
          "mi.artType",
          "coalesce(ue.isMark,0) as isMark",
        ]
      : ["mi.id", "mi.title", "mi.posterImg", "mi.totalGrade", "mi.artType"];
    this.fetchList(
      10,
      0,
      this.feildArr, //mtv_info表统一缩写为mi,user_evaluated表统一缩写为ue
      "电视剧",
      ["mi.id", "asc"],
      [],
      this.loginStatus
    );
  },

  methods: {
    getLis(val) {
      this.LR = val;
    },
    //移动内容
    scrollContents(step, direction) {
      if (!this.isIncrease) {
        this.isIncrease = true;
        let ul_right = this.$refs.li_window.getBoundingClientRect().right;
        this.timerId = setInterval(() => {
          this.$refs.child.sendData();
          if (this.LR - ul_right <= -10 && direction == -1) {
            this.stopSlide(this.timerId);
            this.$message("已经到头了");
            return;
          }
          if (this.offset >= 0 && direction == 1) {
            this.stopSlide(this.timerId);
            this.offset = 0;
            this.$message("已经到头了");
            return;
          }
          this.offset += step * direction;
        }, 50);
      }
    },
    //停止移动
    stopSlide() {
      clearInterval(this.timerId);
      this.isIncrease = false;
    },
    //获取电视剧数据
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
      this.rankList = res.data;
    },

    linkToDailyRank() {
      //详情跳转链接到日排行榜页
      let param = "tv";
      this.$router.push({
        name: "RankView",
        params: { tp: param },
        query: { m: 0, page: 1 },
      });
    },
    isOpenArrow(status) {
      this.isShowArrow = status;
    },
  },
  components: {
    Splitter,
    CardPanel,
  },
};
</script>
<style scoped lang="scss">
@import "@/assets/css/home/dailyRank.scss";
</style>
