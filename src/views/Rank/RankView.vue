<template>
  <div class="daily-rank-container">
    <TopBar></TopBar>
    <LeftDrawer :RL="rankList" :type="Type"></LeftDrawer>
    <PCS v-if="loading"></PCS>
    <div class="page-content" v-else>
      <ResourceFilter
        @orderType="getOrderType"
        @factorArr="getFactorArr"
      ></ResourceFilter>
      <TitleBoard :type="Type" :mode="mode"></TitleBoard>
      <div class="mtv-contents">
        <ul>
          <CardPanel
            v-if="rankList.length > 0"
            class="wrapper"
            :RL="rankList"
            :spot="offsetVal"
            :tagShow="true"
          ></CardPanel>
          <p class="no-match" v-else>暂无符合的筛选结果</p>
        </ul>
      </div>
    </div>
    <!-- total为总条数page-size为每页显示条数 -->
    <div class="pagination-wrapper">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="totalAmount"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="getNewList"
        @prev-click="prevOrNextClick(-1)"
        @next-click="prevOrNextClick(1)"
      >
      </el-pagination>
    </div>
    <Footer></Footer>
  </div>
</template>
<script>
import PCS from "./RankViewSkeleton.vue";
import TopBar from "@/components/common/TopbarView.vue";
import Footer from "@/components/common/FooterView.vue";
import CardPanel from "@/components/common/CardPanelView.vue";
import LeftDrawer from "@/components/common/rank/LeftDrawerView.vue";
import ResourceFilter from "@/components/common/ResourceFilterView.vue";
import TitleBoard from "@/components/common/rank/TitleBoardView.vue";
import getMovieInfo from "@/assets/js/getMovieInfo.js";
import { mapState } from "vuex";
import router from "@/router";
export default {
  name: "RankView",
  data() {
    return {
      mtvInfo: [],
      rankList: [],
      offsetVal: 0,
      currentPage: 1, //当前页码
      pageSize: 16, //页面可显示条数
      loading: true,
      totalAmount: 250,
      feildArr: [],
      pageOrder: ["mi.totalGrade", "desc"],
      factorArr: [],
    };
  },
  watch:{
    // '$route.query':{
    //   handler(to,from){
    //     console.log(to,from);
    //     this.updateView();
    //   },
    //   deep:true
    // },
    '$route.param':{
      handler(to,from){
        this.updateView();
      },
      deep:true
    }
  },
  computed: {
    ...mapState({
      loginStatus: (state) => state.user.loginStatus,
    }),
  },
  created() {
    this.getNewUrl();
  },
  mounted() {
    this.updateView();
  },
  // watch: {
  //   $router.query: {
  //     handler: "updateView",
  //     immediate: true,
  //     deep: true,
  //   },
  // },
  methods: {
    updateView() {
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
      let url_page = parseInt(this.$route.query.page);
      this.getNewUrl();
      this.currentPage = url_page;
      let off = (url_page - 1) * this.pageSize || 1;
      this.offsetVal = off;
      this.fetchList(
        this.pageSize,
        off,
        this.feildArr,
        this.Type,
        this.pageOrder,
        this.factorArr,
        this.loginStatus
      );
    },
    changeUrl(page) {
      let realPage = page || 1;
      let tp = this.$route.query.tp;
      let m = this.$route.query.m;
      this.$router.replace({
        name: "RankView",
        query: {
          tp,
          m,
          page:realPage,
        },
      });
    },
    getNewUrl() {
      let href = window.location.href.toString();
      let isCorrectUrl = href.includes("page") && href.includes('m') ;
      if (!isCorrectUrl) {
        router.push({name:'error'});
      }
      let param = this.$route.params.tp;
      let type='';
      if(param === 'movie'){
        type = '电影';
      }else if(param === 'tv'){
        type = '电视剧';
      }else{
        router.push({name:'error'});
      }
      this.Type = type;
      let param2 = this.$route.query.m || 0;
      if (param2 == 1) {
        this.mode = "256";
      } else if (param2 == 2) {
        this.mode = "64";
      } else {
        this.mode = "";
      }
    },
    //排序方式
    getOrderType(data) {
      if (data.join() == this.pageOrder.join()) return; //若排序条件相同则不触发
      this.pageOrder = data;
      //获取子组件传过来的值
      let url_page = this.$route.query.page || 1;
      this.currentPage = url_page;
      let off = (url_page - 1) * this.pageSize || 1;
      this.fetchList(
        this.pageSize,
        off,
        this.feildArr,
        this.Type,
        data,
        this.factorArr,
        this.loginStatus
      );
    },
    //比较数组是否相等
    compareArrays(arr1, arr2) {
      if (arr1.length !== arr2.length) {
        return false;
      }
      const sortedArr1 = arr1.sort((a, b) =>
        JSON.stringify(a) > JSON.stringify(b) ? 1 : -1
      );
      const sortedArr2 = arr2.sort((a, b) =>
        JSON.stringify(a) > JSON.stringify(b) ? 1 : -1
      );
      for (let i = 0; i < sortedArr1.length; i++) {
        if (JSON.stringify(sortedArr1[i]) !== JSON.stringify(sortedArr2[i])) {
          return false;
        }
      }
      return true;
    },
    //按照地区或者类型筛选
    getFactorArr(data) {
      //包含全部的元素就会去掉
      data.forEach((v) => {
        if (v[Object.keys(v)].includes("全部")) {
          data = data.filter((obj) => !(Object.keys(v) in obj));
        }
      });
      if (this.compareArrays(data, this.factorArr)) return; //若筛选条件相同则不触发
      this.factorArr = data;
      this.changeUrl(1);
      this.currentPage = 1;
      this.fetchList(
        this.pageSize,
        0,
        this.feildArr,
        this.Type,
        this.pageOrder,
        data,
        this.loginStatus
      );
    },
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
      console.log(res.data);
      if (res.data.length != 0) {
        if (this.mode == "") this.totalAmount = res.data[0].total;
        else this.totalAmount = parseInt(this.mode);
      } else {
        this.totalAmount = 0;
      }
      this.loading = false;
    },
    prevOrNextClick(val) {
      //翻译按钮单击
      this.currentPage += val;
      this.changeUrl(this.currentPage);
    }, //翻页方法
    getNewList(e) {
      this.changeUrl(e);
      this.currentPage = this.$route.query.page || 1;
      this.offsetVal = (e - 1) * this.pageSize || 1;
      this.fetchList(
        this.pageSize,
        this.offsetVal,
        this.feildArr,
        this.Type,
        this.pageOrder,
        this.factorArr,
        this.loginStatus
      );
    },
  },
  components: {
    PCS,
    TopBar,
    Footer,
    CardPanel,
    LeftDrawer,
    ResourceFilter,
    TitleBoard,
  },
};
</script>
<style scoped lang="scss">
@import "@/assets/css/rank/rank.scss";
</style>
