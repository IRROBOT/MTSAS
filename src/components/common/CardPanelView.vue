<template>
  <div class="CardPanel">
    <li
      class="rank-contents"
      :style="{ left: off + 'px' }"
      v-for="(item, index) in RL"
      :key="index"
      ref="li_r"
    >
    <transition name="el-fade-in-linear">
      <div class="rank-tag" v-show="tagShow">
        <i class="icon iconfont icon-paimingbiaoqian">
          <span>{{index + spot}}</span>
        </i>
      </div>
    </transition>
      <el-card shadow="hover">
        <el-tooltip effect="dark" :content="item.title" placement="top">
          <div class="title">
            <span>{{ item.title }}</span>
          </div>
        </el-tooltip>
        <div class="img-wrapper">
          <!-- <img
            :src="baseUrl + 'posters/' + item.posterImg"
            :alt="item.title"
            @click="goMovieDetail(item.id)"
          /> -->
          <el-image class="img-lazy" fit="contain" :alt="item.title" :src="baseUrl + 'posters/' + item.posterImg" @click="goMovieDetail(item.id)" lazy></el-image>
        </div>
        <div class="score-panel">
          <h3>
            <i class="el-icon-star-on"></i>
            <span>{{ parseFloat(item.totalGrade).toFixed(1) }}</span>
          </h3>
          <h3>
            <i
              @click="isOpenDialog(item.isMark, item.id, index)"
              :class="
                item.isMark == 1
                  ? 'icon iconfont icon-like_heart activeHeart'
                  : 'icon iconfont icon-like_heart'
              "
            ></i>
          </h3>
        </div>
      </el-card>
    </li>
    <folderSelectBox
      ref="folderSelect"
      @markResult="handleMarkResult"
    ></folderSelectBox>
  </div>
</template>
<script>
// import http from "@/common/api/request.js";
// import common from "@/assets/js/common.js";
import folderSelectBox from "@/components/common/ChooseFolderView.vue";
import { mapState, mapMutations } from "vuex";
export default {
  components: { folderSelectBox },
  props: ["off", "RL", "spot","tagShow"],
  data() {
    return {
      offset: 0, //left的偏移值
      isCollect: [],
     // tagShow:true
    };
  },
  created() {
    this.baseUrl = global.env.SERVER_BASE + "/public/images/";
  },
  computed: {
    ...mapState({
      loginStatus: (state) => state.user.loginStatus,
      userInfo: (state) => state.user.userInfo,
    }),
  },
  methods: {
    ...mapMutations(["setCurrentMtv"]),
    goMovieDetail(mid) {
      window.open(global.env.DOMAIN_NAME + "/movie/" + mid);
    },
    sendData() {
      let gap =
        this.$refs.li_r[this.RL.length - 1].getBoundingClientRect().right;
      this.$emit("LiRect", gap);
    },
    changeTag(val){
      this.tagShow=val;
    },
    //判断收藏夹弹窗是否需要打开
    isOpenDialog(isMark, mid, i) {
      let state = this.RL[i].isMark == 1 ? 0 : 1;
      this.setCurrentMtv({
        state,
        mid,
        artType: this.RL[i].artType,
        posterImg: this.RL[i].posterImg,
        title: this.RL[i].title,
        index: i,
      });
      //没有收藏过和登录状态就要打开
      if (!isMark && this.loginStatus) {
        this.$refs.folderSelect.openFolderDialog(true);
      } else {
        this.$refs.folderSelect.collectTheMovie(false);
      }
    },
    //收藏成功后
    handleMarkResult(res) {
      if (res.success) {
        let tmp = this.RL[res.index];
        tmp.isMark = res.state;
        this.$set(this.RL, res.index, tmp);
        this.$message.success(res.state == 1 ? "收藏成功" : "已取消收藏");
      }
    },
  },
};
</script>
<style scoped lang="scss">
@mixin flexCenter {
  display: flex;
  justify-content: center;
  align-items: center;
}
.rank-contents {
  display: grid-item;
  position: relative;
  width: 260px;
  margin: 20px;
  transition: all 0.3s ease;
  .rank-tag {
    width: 70px;
    height: 70px;
    position: absolute;
    top: 13%;
    right: 0;
    z-index:10;
    i {
      color: rgba(255, 162, 0, 0.6);
      font-size: 65px;
      @include flexCenter;
      position: relative;
      span {
        position: absolute;
        font-size: 18px;
        color: white;
      }
    }
  }
  .el-card {
    width: 100%;
    height: 350px;
    transition: transform 0.5s ease;
    ::v-deep .el-card__body {
      padding: 0px;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      .title {
        width: 100%;
        height: 50px;
        background-color: black;
        @include flexCenter;
        span {
          width: 90%;
          margin: auto;
          color: white;
          text-align: center;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          font-size: 16px;
        }
      }
      .img-wrapper {
        width: 100%;
        min-height: 250px;
        max-height: 260px;
        background:black;
        border:1px solid black;
        display: flex;
        .img-lazy {
          cursor: pointer;
         width: max-content;
         margin:0 auto;
          height: 100%;

        }
      }
      .score-panel {
        position: relative;
        bottom: 0px;
        width: 100%;
        height: 50px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: black;
        h3 {
          padding: 0 10px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          i {
            font-size: 30px;
            margin: 0 10px;
          }
          .el-icon-star-on {
            color: gold;
          }
          span {
            line-height: 30px;
          }
        }
      }
    }
  }
  .el-card:hover {
    transform: translateY(-10px);
    }
}
.activeHeart {
  color: #ff4444;
}
</style>
