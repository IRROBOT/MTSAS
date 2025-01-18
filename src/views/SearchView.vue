<template>
  <div class="search-result-list">
    <TopBar @searchMovie="reloadSearch"></TopBar>
    <p class="search-tip">
      搜索关于“<span>{{ searchKeyword }}</span
      >”的结果
    </p>
    <div class="result-list-container" v-if="rankList.length > 0">
      <ul>
        <CardPanel class="wrapper" :RL="rankList" :spot="startSpot"></CardPanel>
      </ul>
    </div>
    <el-empty v-else :image-size="600" description="暂无结果"></el-empty>
    <!-- total为总条数page-size为每页显示条数 -->
    <div class="pagination-wrapper">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="RLL"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="updateSearchResult"
        @prev-click="prevOrNextClick(-1)"
        @next-click="prevOrNextClick(1)"
      >
      </el-pagination>
    </div>
    <Footer></Footer>
  </div>
</template>
<script>
import TopBar from "@/components/common/TopbarView.vue";
import Footer from "@/components/common/FooterView.vue";
import CardPanel from "@/components/common/CardPanelView.vue";
import http from "@/common/api/request.js";
import { mapState } from "vuex";
export default {
  name: "searchView",
  data() {
    return {
      rankList: [],
      currentPage: 1,
      pageSize: 16,
      RLL: 1,
      startSpot: 0,
      tmpList: [],
    };
  },
  computed: {
    ...mapState({
      loginStatus: (state) => state.user.loginStatus,
    }),
  },
  created() {
    this.getSearchResult(this.$route.query.page);
    this.searchKeyword = this.$route.query.keyword.trim();
  },
  mounted() {},
  methods: {
    //获取搜索结果
    getSearchResult(e) {
      this.changeUrl(e);
      //向后端发起请求
      http
        .$axios({
          url: "/mtv/api/searchMovies",
          method: "GET", //get请求对应 params  post请求的对应 data
          headers: {
            token: this.loginStatus,
          },
          params: {
            keyword: this.$route.query.keyword,
          },
        })
        .then((res) => {
          if (res.success) {
            this.rankList = [];
            this.currentPage = parseInt(this.$route.query.page);
            this.tmpList = res.data;
            this.RLL = res.data.length;
            let cp = this.$route.query.page;
            let index = (cp - 1) * 16;
            this.startSpot = index;
            let limit = cp * 16 > this.RLL ? this.RLL : cp * 16;
            for (let i = index; i < limit; i++) {
              this.rankList.push(this.tmpList[i]);
            }
          } else {
            this.rankList = [];
            this.$message.error(res.data);
          }
          this.searchKeyword = this.$route.query.keyword.trim();
        });
    },
    reloadSearch(i) {
      this.$router.replace({
        name: "SearchView",
        query: {
          keyword: i,
          page: 1,
        },
      });
      this.getSearchResult(1);
    },
    //通过已经存在的结果数组来更新搜索结果
    updateSearchResult(e) {
      this.changeUrl(e);
      this.rankList.length = 0;
      let cp = this.$route.query.page;
      this.startSpot = (cp - 1) * 16;
      let limit = cp * 16 > this.RLL ? this.RLL : cp * 16;
      for (let i = this.startSpot; i < limit; i++) {
        this.rankList.push(this.tmpList[i]);
      }
    },
    prevOrNextClick(val) {
      //翻译按钮单击
      this.currentPage = parseInt(this.$route.query.page) + val;
      this.changeUrl(this.currentPage);
    },
    changeUrl(page) {
      let keyword = this.$route.query.keyword;
      this.$router.replace({
        name: "SearchView",
        query: {
          keyword,
          page,
        },
      });
    },
  },
  components: {
    TopBar,
    Footer,
    CardPanel,
  },
};
</script>
<style scoped lang="scss">
.search-result-list {
  background-color: #00284e;
  max-width: 2560px;
  width: 100%;
}
.pagination-wrapper {
  width: max-content;
  margin: 40px auto;
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
.result-list-container {
  margin: 0 auto;
  margin-top: 90px;
  width: max-content;
  background-color: #00284e;
  display: flex;
  min-height: 80vh;
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
.no-match {
  p {
    width: 100%;
    font-size: 25px;
    color: white;
    padding: 10px;
  }
}
.search-tip {
  font-size: 23px;
  color: white;
  text-align: center;
  span {
    color: gold;
  }
}
</style>
