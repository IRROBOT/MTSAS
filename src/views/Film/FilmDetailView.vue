<template>
  <div class="film-detail-wrapper">
    <TopBar></TopBar>
    <CommentEditorP ref="CE"></CommentEditorP>
    <FDS v-if="loading"></FDS>
    <div class="movie-detail" v-else>
      <!-- 选择收藏夹的弹窗 -->
      <folderSelectBox
        ref="folderSelect"
        @markResult="handleMarkResult"
      ></folderSelectBox>
      <div class="movie-container">
        <div class="poster-container">
          <div class="img-container">
            <img
              v-if="isLoadPoster"
              :src="baseUrl + 'posters/' + currentMovieInfo.posterImg"
              :alt="currentMovieInfo.title"
            />
            <el-empty v-else :image-size="200" description="404"></el-empty>
          </div>
          <div class="collection">
            <el-statistic :value="currentMovieInfo.markNum" title="收藏人数">
              <template slot="suffix">
                <i
                  class="icon iconfont icon-like_heart"
                  style="color: #ff4444"
                ></i>
              </template>
            </el-statistic>
            <div class="collect">
              <div @click="isOpenDialog" class="heart-wrapper">
                <i
                  :class="
                    currentMovieInfo.isMark == 1
                      ? 'icon iconfont icon-like_heart activeHeart'
                      : 'icon iconfont icon-like_heart'
                  "
                ></i>
              </div>
            </div>
          </div>
        </div>
        <div class="movie-info-container">
          <p class="movie-title">{{ currentMovieInfo.title }}</p>
          <div class="movie-score">
            <el-rate v-model="StarRate" disabled text-color="#ff9900" :max="5">
            </el-rate>
            <span
              >{{ parseFloat(currentMovieInfo.totalGrade).toFixed(1) }} /
              10.0</span
            >
          </div>
          <div class="relate-info">
            <label
              >导演:
              <p>{{ currentMovieInfo.director }}</p></label
            >
            <label
              >编剧:
              <p>{{ currentMovieInfo.scriptWriter }}</p></label
            >
            <label
              >类型:
              <p>{{ currentMovieInfo.contentClass }}</p></label
            >
            <label
              >地区:
              <p>{{ currentMovieInfo.area }}</p></label
            >
            <label
              >语言:
              <p>{{ currentMovieInfo.lang }}</p></label
            >
            <label
              >时长:
              <p>{{ currentMovieInfo.duration }}</p></label
            >
            <label
              >上映时间:
              <p>{{ currentMovieInfo.date }}</p></label
            >
          </div>
        </div>
      </div>
      <div class="bottom-info-box">
        <el-tabs v-model="activeName">
          <el-tab-pane label="主演" name="first">
            <ul>
              <li v-for="(item, index) in actorList" :key="index">
                <p>演员:{{ item.actor }}</p>
                <p>角色:{{ item.role }}</p>
              </li>
            </ul>
          </el-tab-pane>
          <el-tab-pane label="评价" name="second">
            <div class="my-score">
              <h4>我的评分</h4>
              <el-rate
                @change="changeMyRate"
                v-model="myStarRate"
                text-color="#ff9900"
                show-text
                :texts="[2, 4, 6, 8, 10]"
                :max="5"
              >
              </el-rate>

              <span> / 10</span>
            </div>
            <div class="write-comment">
              <h4 v-if="currentMovieInfo.cid == null">
                写评论<i
                  class="el-icon-edit-outline"
                  @click="clickCommentEditor(true)"
                ></i>
              </h4>

              <h4
                v-else
                class="comment-port"
                @click="checkMyComment(currentMovieInfo.cid, 't0')"
              >
                我的影评<i class="el-icon-s-comment"></i>
              </h4>
            </div>
          </el-tab-pane>
          <el-tab-pane label="剧情" name="third">
            <p class="brief">
              {{ currentMovieInfo.synopsis }}
            </p></el-tab-pane
          >
          <el-tab-pane label="其它" name="fourth">{{
            "短评: “" + currentMovieInfo.quote + "”"
          }}</el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <div class="split-bar">用户影评</div>
    <div class="movie-comments">
      <ul class="comment-wrapper" v-if="commentList.length > 0">
        <li v-for="(item, index) in commentList" :key="index" v-if="item.status === '已审核'">
          <section class="left" @click="checkMyComment(item.cid, 't0')">
            <p>{{ item.title }}</p>
            <p>
              {{ item.text }}
            </p>
          </section>
          <section class="middle">
            <div class="top-single">
              <div class="img-wrapper">
                <img
                  :src="baseUrl + '/avatar/' + item.profile"
                  alt="用户头像"
                />
              </div>
              <div class="single-info">
                <h3>{{ item.nickName }}</h3>
                <div class="score">
                  <el-rate
                    :value="parseFloat(item.myScore) / 2"
                    disabled
                    text-color="#ff9900"
                    :max="5"
                  >
                  </el-rate>
                  <span>{{ item.myScore.toFixed(1) }}</span>
                </div>
              </div>
            </div>
            <p>{{ item.comment_date }}</p>
          </section>
          <section class="right">
            <h2>
              <i
                :class="
                  isActiveLike[index].isLike
                    ? 'icon iconfont icon-like-fill activeLikeUp'
                    : 'icon iconfont icon-like-fill'
                "
                @click="activeLike(item.cid, index)"
              ></i
              ><span>{{
                isActiveLike[index].likeNum > 10000
                  ? parseInt(isActiveLike[index].likeNum / 10000) + "w+"
                  : isActiveLike[index].likeNum
              }}</span>
            </h2>
            <h2 @click="checkMyComment(item.cid, 't1')">
              <i class="icon iconfont icon-huifu1"></i
              ><span>{{
                item.replyInfo.length >= 1000 ? "999+" : item.replyInfo.length
              }}</span>
            </h2>
          </section>
        </li>
      </ul>
      <div class="noComment" v-else>
        <el-empty description="暂无评论"></el-empty>
        <span>写评论</span
        ><i class="el-icon-edit-outline" @click="clickCommentEditor(true)"></i>
      </div>
    </div>
    <Footer></Footer>
  </div>
</template>
<script>
import FDS from "./FilmDetailSkeleton.vue";
import TopBar from "@/components/common/TopbarView.vue";
import Footer from "@/components/common/FooterView.vue";
import CommentEditorP from "@/components/common/CommentEditorView.vue";
import http from "@/common/api/request.js";
import common from "@/assets/js/common.js";
import { mapState, mapMutations } from "vuex";
import folderSelectBox from "@/components/common/ChooseFolderView.vue";
// const createSkeletonHTML = require("draw-page-structure/evalDOM");
// createSkeletonHTML().then((skeletonHTML) => {
//   // 观察浏览器控制台
//   console.log(skeletonHTML);
// });
export default {
  data() {
    return {
      activeName: "third", //默认选中剧情栏
      loading: true,
      currentMovieInfo: {},
      isActiveLike: [],
      commentList: [],
      actorList: [],
      isLoadPoster: false,
      mid: 0,
      state: "",
    };
  },
  created() {
    this.baseUrl = global.env.SERVER_BASE + "/public/images/";
    this.mid = this.$route.params.mid || 0;
    this.getMovieInfo(this.mid); //获取电影相关信息
    this.getUserCommentList(this.mid);
  },
  mounted() {
    setTimeout(() => {
      this.updateViewNum();
    }, 30000); // 30000毫秒等于30秒
  },
  computed: {
    ...mapState({
      loginStatus: (state) => state.user.loginStatus,
      userInfo: (state) => state.user.userInfo,
    }),
    myStarRate: {
      //我的评分
      get() {
        return parseFloat(this.currentMovieInfo.myScore) / 2;
      },
      set() {},
    },
    StarRate: {
      //此影片总评分
      get() {
        return parseFloat(this.currentMovieInfo.totalGrade) / 2;
      },
      set() {},
    },
  },
  methods: {
    ...mapMutations(["setCurrentMtv"]),
    checkMyComment(cid, sign) {
      //查看我的评论
      this.$router.push({
        name: "CommentView",
        params: { cid, mid: this.mid },
        query: {
          sign,
        },
      });
    },

    //给此电影评分
    changeMyRate(val) {
      if (val == parseInt(this.currentMovieInfo.myScore) / 2) {
        return;
      }
      this.$alert("确认提交评分?", "评分提交提示", {
        confirmButtonText: "确定",
        callback: (action) => {
          if (action == "confirm") {
            //确认更改评分
            let score = val * 2;
            //向后端发起请求，更改评分
            http
              .$axios({
                url: "/mtv/api/updateMyScore",
                method: "POST", //get请求对应 params  post请求的对应 data
                headers: {
                  token: true,
                },
                data: {
                  id: this.mid,
                  score,
                },
              })
              .then((res) => {
                if (res.success) {
                  this.currentMovieInfo.myScore = score;
                } else {
                  this.$message.error("网络异常,请重试");
                }
              });
          }
        },
      });
    },
    synopsisInfoFilter() {
      //剧情数据处理
      let tmp = this.currentMovieInfo.synopsis;
      const regex = /(.*[。？！])[^。？！]*[。？！]*$/;
      const match = tmp.match(regex);
      if (match && match[1]) {
        this.currentMovieInfo.synopsis = match[1];
      }
      let tmp_data = this.currentMovieInfo.synopsis;
      this.currentMovieInfo.synopsis = tmp_data.replace(/\?/g,'·');
    },
    actorInfoFilter() {
      //演员数据处理
      let info = this.currentMovieInfo.actors;
      if(!info){
        this.actorList.push({actor:"暂无数据",role:"暂无数据"});
        return false;
      }
      let arr = info.split("#");
      arr.pop();
      arr.forEach((v) => {
        let tmp = v.split("|");
        if (tmp[1]) {
          tmp[1] = tmp[1].replace("饰", "").trim();
          let obj = { actor: tmp[0], role: tmp[1] };
          this.actorList.push(obj);
        }else{
          if(tmp[0]){
            this.actorList.push({actor:tmp[0],role:"暂无数据"});
          }
        }
      });
    },
    getMovieInfo(id) {
      //获取电影信息
      http
        .$axios({
          url: "/mtv/api/getAmtvInfo",
          method: "GET", //get请求对应 params  post请求的对应 data
          headers: {
            token: this.loginStatus,
          },
          params: {
            id,
          },
        })
        .then((res) => {
          if (res.success) {
            this.currentMovieInfo = res.data;
            let state = this.currentMovieInfo.isMark ? 0 : 1;
            this.setCurrentMtv({
              state,
              artType: this.currentMovieInfo.artType,
              posterImg: this.currentMovieInfo.posterImg,
              title: this.currentMovieInfo.title,
              mid: this.currentMovieInfo.id,
              index: null,
            });
            this.loading = false;
            this.isLoadPoster = true;
            this.actorInfoFilter();
            this.synopsisInfoFilter();
          } else {
            this.$message.error("网络异常,请重试");
          }
        });
    },
    //获取用户评论列表
    getUserCommentList(mid) {
      http
        .$axios({
          url: "/mtv/api/getUserCommentList",
          method: "GET", //get请求对应 params  post请求的对应 data
          params: {
            id: mid,
          },
        })
        .then((res) => {
          if (res.success) {
            if(res.data.length == 0) return;
            this.commentList = this.unique(res.data);
            this.commentList.forEach((v, k) => {
              if (v.likeNum != "") {
                let tmp = v.likeNum.split(",");
                let uid = this.currentMovieInfo.uid + "";
                this.$set(this.isActiveLike, k, {
                  isLike: tmp.indexOf(uid) != -1 ? true : false,
                  likeNum: tmp.length,
                });
              } else {
                this.$set(this.isActiveLike, k, {
                  isLike: false,
                  likeNum: 0,
                });
              }
            });
          }
        });
    },
    //对象数组去重
    unique(arr) {
      let map = new Map();  
      let uniqueArr = arr.filter(obj => {  
          if (!map.has(obj.cid)) {  
              map.set(obj.cid, true);  
              return true;  
          }  
          return false;  
      }); 
      return uniqueArr;    
    },
    //更此页面的观看次数
    updateViewNum() {
      http
        .$axios({
          url: "/mtv/api/updateMtvView",
          method: "POST", //get请求对应 params  post请求的对应 data
          headers:{
            load:false
          },
          data: {
            mid:this.mid
          },
        });
    },
    //判断收藏夹弹窗是否需要打开
    isOpenDialog() {
      //没有收藏过和登录状态就要打开
      if (!this.currentMovieInfo.isMark && this.loginStatus) {
        this.$refs.folderSelect.openFolderDialog(true);
      } else {
        this.$refs.folderSelect.collectTheMovie(false);
      }
    },
    //处理收藏夹弹窗返回的收藏结果
    handleMarkResult(res) {
      if (res.success) {
        let flag = this.currentMovieInfo.isMark;
        this.currentMovieInfo.isMark = !flag;
        this.currentMovieInfo.markNum =
        this.currentMovieInfo.markNum + (flag ? -1 : 1);
        this.$message.success(!flag ? "收藏成功" : "已取消收藏");
      }
    },
    activeLike(cid, i) {
      //点赞单击事件
      //调用防抖函数
      common.debounce(this.changeLikeStatus(cid, i), 300);
    },
    changeLikeStatus(cid, i) {
      //改变点赞状态
      let LikeStatus = this.isActiveLike[i].isLike;
      let state = !LikeStatus;
      let arr = [],
        value = "";
      let uid = this.currentMovieInfo.uid;
      this.commentList.forEach((v, k) => {
        if (i == k) {
          if (v.likeNum == "") {
            value += uid;
          } else {
            if (state) {
              //赞成
              arr = v.likeNum.split(",");
              arr.push(uid);
              value = arr.join(",");
            } else {
              //反对
              let flag = arr.indexOf(uid);
              flag != -1 ? arr.splice(flag, 1) : "";
              value = arr.join();
            }
          }
        }
      });
      //向后端发送请求
      http
        .$axios({
          url: "/mtv/api/updateLikeStatus",
          method: "POST", //get请求对应 params  post请求的对应 data
          headers: {
            token: true,
          },
          data: {
            cid,
            value,
          },
        })
        .then((res) => {
          if (res.success) {
            //改变点赞状态
            let LikeNum = parseInt(this.isActiveLike[i].likeNum);
            let sign = 1;
            if (LikeStatus) sign *= -1;
            let num = LikeNum + sign;
            this.$set(this.isActiveLike, i, { isLike: state, likeNum: num });
          } else {
            this.$message.error("网络异常,请重试");
          }
        });
    },

    async clickCommentEditor(val) {
      //先判断用户是否登录
      if (this.loginStatus) {
        //先判断是否给影片打过分,并且用户是否被禁言
        if (this.currentMovieInfo.myScore != "" && this.currentMovieInfo.myScore != "0") {
          let flag = await this.isUserMuted();
          if(flag)
            this.$refs.CE.controllDialog(val);
          else
            this.$message({ message: "当前状态无法评论", type: "warning" });
        } else {
          this.$message({ message: "请先给影片评分", type: "warning" });
        }
      } else {
        this.$message({ message: "请先登录", type: "warning" });
      }
    },
    async isUserMuted(){
      let res = await http.$axios({
          url:"/mtv/api/checkUserIsBan",
          method:"get",
          headers: {
            token: true,
            load:false
          }
        });
        return res.data;
    },
  },
  components: {
    FDS,
    TopBar,
    Footer,
    CommentEditorP,
    folderSelectBox,
  },
};
</script>
<style scoped lang="scss">
@import "@/assets/css/film/detail.scss";
</style>
