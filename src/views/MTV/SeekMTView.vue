<template>
  <div class="seek-MT-container">
    <TopBar @path="getPath"></TopBar>
    <PCS v-if="loading"></PCS>
    <div class="page-content" v-else>
      <ResourceFilter
        @orderType="getOrderType"
        @factorArr="getFactorArr"
        :defaultType="defaultType"
        ref="filter"
      ></ResourceFilter>
      <p class="space-occupy"></p>
      <div class="mtv-contents">
        <ul>
          <CardPanel
            v-if="rankList.length > 0"
            class="wrapper"
            :RL="rankList"
            :spot="offsetVal"
            :tagShow="false"
          ></CardPanel>
          <p class="no-match" v-else>暂无符合的筛选结果</p>
        </ul>
      </div>
    </div>
    <!-- total为总条数page-size为每页显示条数 -->
    <div class="pagination-wrapper">
      <el-pagination
      v-if="rankList.length > 0"
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
import PCS from "./SeekMTSkeleton.vue";
import TopBar from "@/components/common/TopbarView.vue";
import Footer from "@/components/common/FooterView.vue";
import CardPanel from "@/components/common/CardPanelView.vue";
import ResourceFilter from "@/components/common/ResourceFilterView.vue";
import getMovieInfo from "@/assets/js/getMovieInfo.js";
import { mapState } from "vuex";
export default {
  name: "SeekMTView",
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
  computed: {
    ...mapState({
      loginStatus: (state) => state.user.loginStatus,
    }),
  },
  created() {
    let param = this.$route.query.type;
    this.defaultType = JSON.parse(decodeURIComponent(atob(param)));
    if (this.defaultType != "全部") {
      this.factorArr = [{ contentClass: this.defaultType }];
    } else {
      this.factorArr = [];
    }
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
    let url_page = parseInt(this.$route.query.page);
    this.currentPage = url_page;
    let off = (url_page - 1) * this.pageSize;
    this.offsetVal = off;
    this.fetchList(
      this.pageSize,
      off,
      this.feildArr,
      "",
      this.pageOrder,
      this.factorArr,
      this.loginStatus
    );
  },
  methods: {
    changeUrl(page) {
      let type = btoa(encodeURIComponent(JSON.stringify(this.defaultType)));
      this.$router.replace({
        name: "SeekMTView",
        query: {
          type,
          page,
        },
      });
    },
    getPath(data) {
      if (data == this.defaultType) return;
      if (data != "全部") {
        this.factorArr = [{ contentClass: data }];
      } else {
        this.factorArr = [];
      }
      if (data != this.defaultType) {
        this.defaultType = data;
        this.fetchList(
          this.pageSize,
          0,
          this.feildArr,
          "",
          this.pageOrder,
          this.factorArr,
          this.loginStatus
        );
      }
      this.$refs.filter.catchDefaultType(data);
    },
    //排序方式
    getOrderType(data) {
      if (data.join() == this.pageOrder.join()) return; //若排序条件相同则不触发
      this.pageOrder = data;
      //获取子组件传过来的值
      let url_page = this.$route.query.page;
      this.currentPage = url_page;
      let off = (url_page - 1) * this.pageSize;
      this.fetchList(
        this.pageSize,
        off,
        this.feildArr,
        "",
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
        if (Object.keys(v) == "contentClass") {
          this.defaultType = v.contentClass;
          this.defaultType = v.contentClass;
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
        "",
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
      if (res.data.length != 0) {
        this.totalAmount = res.data[0].total;
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
      this.currentPage = this.$route.query.page;
      this.offsetVal = (e - 1) * this.pageSize;
      this.fetchList(
        this.pageSize,
        this.offsetVal,
        this.feildArr,
        "",
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
    ResourceFilter,
  },
};
</script>
<style scoped lang="scss">
.seek-MT-container {
  background-color: #00284e;
}
.space-occupy {
  height: 80px;
}
.pagination-wrapper {
  width: max-content;
  margin: 10% auto;
  background-color: #00284e;
  ::v-deep .btn-prev,
  ::v-deep .btn-next,
  ::v-deep .btn-quicknext,
  ::v-deep .btn-quickprev,
  ::v-deep .number {
    width: 40px !important;
    height: 40px !important;
    font-size: 20px !important;
    line-height: 40px;
  }
  ::v-deep i {
    font-size: 30px !important;
  }
}
.page-content {
  max-width: 2560px;
  margin: 0 auto;
  background-color: #00284e;
  ::v-deep .el-collapse-item__header {
    justify-content: center;
    font-size: 20px;
    .el-icon-arrow-right {
      margin: 0 !important;
    }
  }
  .mtv-contents {
    width: max-content;
    margin: auto;
    display: flex;
    background-color: #ffffff73;
    border-radius: 20px;
    justify-content: center;
    overflow: hidden;
    .wrapper {
      display: grid;
      justify-self: center;
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(4, 1fr);
    }
  }
}
.no-match {
  font-size: 25px;
  color: white;
  padding: 10px;
}
</style>
