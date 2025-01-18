<template>
  <div class="comment-wrapper">
    <TopBar></TopBar>
    <CommentEditorP ref="CE"></CommentEditorP>
    <div class="comment-content">
      <!-- 影评头部信息部分 -->
      <div class="comment-header">
        <div class="comment-title">
          <h2>{{ comment_info.title }}</h2>
        </div>
        <div class="comment-author">
          <div class="left-holder"></div>
          <div class="author-info">
            <div class="profile-wrapper">
              <img :src="baseUrl + comment_info.profile" alt="作者头像" />
            </div>
            <p>{{ comment_info.nickName }}</p>
            <p class="rate-box">
              <el-rate
                :value="parseFloat(rate) / 2"
                disabled
                text-color="#ff9900"
                score-template="{value}"
              >
              </el-rate>
              <span>{{ comment_info.myScore }}</span>
            </p>
            <p>于{{ comment_info.comment_date }}编辑</p>
          </div>
          <div class="toolbar">
            <div class="comment-edit" v-if="comment_info.isShowBar">
              <span @click="openEditor">编辑<i class="el-icon-edit"></i></span>
              <span @click="deleteComment"
                >删除<i class="el-icon-delete"></i
              ></span>
            </div>
          </div>
        </div>
      </div>
      <!-- 富文本区域 -->
      <div class="comment-richText" v-html="comment_info.commentInfo"></div>
      <!-- 内容区域的底部 -->
      <div class="comment-bottom">
        <div class="favor-btn">
          <i
            :class="
              isActiveLike[0].isLike
                ? 'icon iconfont icon-like-fill activeLike'
                : 'icon iconfont icon-like-fill'
            "
            @click="activeLike()"
          ></i>
          <span>{{ isActiveLike[0].likeNum }}</span>
        </div>
        <div class="article-copyright">
          <span
            >© 本文版权归作者{{
              " " + comment_info.nickName + " "
            }}所有，任何形式转载请联系作者</span
          >
        </div>
      </div>
      <!-- 回复影评部分 -->
      <div class="comment-reply-wrapper">
        <div class="comment-reply-header-info">
          <p>当前共{{ replyLen }}条回复</p>
        </div>
        <div class="reply-box">
          <div class="profile-wrapper">
            <el-image
              style="width: 75px; height: 75px"
              :src="baseUrl + comment_info.user_profile"
              :fit="cover"
              lazy
            ></el-image>
          </div>
          <div class="reply-content-wrapper">
            <el-input
              type="textarea"
              :rows="4"
              :maxlength="200"
              :minlength="1"
              clearable
              resize="none"
              :autosize="{ minRows: 4, maxRows: 8 }"
              show-word-limit
              placeholder="回复作者"
              v-model="textarea"
            >
            </el-input>
          </div>
          <div class="btn-wrapper">
            <el-button
              type="primary"
              @click="replyAuthor"
              :disabled="isReleaseBtn"
              >回复</el-button
            >
          </div>
        </div>
        <div class="reply-wrapper" ref="reply_sign">
          <ul class="list" v-if="replyLen > 0">
            <el-divider v-if="replyLen > 0">回复内容</el-divider>
            <li v-for="(item, index) in comment_info.replyInfo" :key="index">
              <div class="reply-info-header">
                <!-- 回复影评的用户头像 -->
                <el-image
                  style="width: 50px; height: 50px"
                  :src="baseUrl + item.profile"
                  :fit="cover"
                  lazy
                ></el-image>
                <span>{{ item.nickName }}</span>
                <span>{{ item.date }}</span>
                <div class="like-part">
                  <i
                    :class="
                      replyActive[index].isLike
                        ? 'icon iconfont icon-like-fill activeLike'
                        : 'icon iconfont icon-like-fill'
                    "
                    @click="likeThisReply(index)"
                  ></i
                  ><!-- 点赞 -->
                  <span>{{ replyActive[index].likeNum }}</span>
                </div>
              </div>
              <hr />
              <p>{{ item.reply }}</p>
              <div
                class="delete-wrapper"
                v-if="item.uid == comment_info.user_uid"
              >
                <span @click="deleteThisReply(index)">删除</span>
              </div>
            </li>
          </ul>
          <!-- <div class="no-reply" v-else>暂无回复</div> -->
        </div>
      </div>
    </div>
    <Footer></Footer>
    <el-backtop :visibility-height="1400"></el-backtop>
  </div>
</template>
<script>
import TopBar from "@/components/common/TopbarView.vue";
import Footer from "@/components/common/FooterView.vue";
import http from "@/common/api/request.js";
import CommentEditorP from "@/components/common/CommentEditorView.vue";
import common from "@/assets/js/common.js";
import { mapState } from "vuex";
export default {
  name: "CommentView",
  components: { TopBar, Footer, CommentEditorP },
  data() {
    return {
      cover: "cover",
      isActiveLike: [{ isLike: false, likeNum: 0 }],
      replyActive: [],
      rate: 0,
      comment_info: {
        user_profile: "avatar-default.png", //用户默认头像
        profile: "avatar-default.png", //作者默认头像
      },
      textarea: "",
      replyLen: 0,
      cid: 0,
      mid: 0,
    };
  },
  computed: {
    ...mapState({
      loginStatus: (state) => state.user.loginStatus,
      userInfo: (state) => state.user.userInfo,
    }),
    isReleaseBtn() {
      return this.textarea.trim().length <= 0;
    },
  },
  created() {
    this.baseUrl = global.env.SERVER_BASE + "/public/images/avatar/";
    this.cid = this.$route.params.cid;
    this.mid = this.$route.params.mid;
    this.sign = this.$route.query.sign;
  },
  mounted() {
    this.getCommentInfo(this.cid, this.mid);
    setTimeout(() => {
      if (this.sign == "t1") {
        this.$refs.reply_sign.scrollIntoView();
      }
    }, 1000);
  },
  methods: {
    // 获取所有的评论信息
    getCommentInfo(cid, mid) {
      http
        .$axios({
          url: "/mtv/api/getCommentAndReplyInfo",
          method: "GET", //get请求对应 params  post请求的对应 data
          headers: {
            token: this.loginStatus,
          },
          params: {
            cid,
            mid,
          },
        })
        .then((res) => {
          if (res.success) {
            this.comment_info = res.data;
            this.comment_info.myScore = parseFloat(res.data.myScore).toFixed(1);
            this.rate = res.data.myScore;
            this.replyLen = this.comment_info.replyInfo.length;
            let val = this.comment_info.likeNum;
            let uid = this.comment_info.user_uid; //当前用户的uid
            if (val != "") {
              let tmp = this.comment_info.likeNum.split(",");
              this.$set(this.isActiveLike, 0, {
                isLike: tmp.indexOf(uid + "") != -1,
                likeNum: tmp.length,
              });
            } else {
              this.$set(this.isActiveLike, 0, {
                isLike: false,
                likeNum: 0,
              });
            }
            //更新回复的视图
            this.updateReplyView(uid);
          } else {
            this.$message.error("网络异常,请重试");
          }
        });
    },
    activeLike() {
      //点赞单击事件
      //调用防抖函数
      common.debounce(this.changeLikeStatus(), 500);
    },
    changeLikeStatus() {
      //改变点赞状态
      let LikeStatus = this.isActiveLike[0].isLike;
      let state = !LikeStatus;
      let arr = [],
        value = "";
      let uid = this.comment_info.user_uid + "";
      let v = this.isActiveLike[0];
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
      //向后端发送请求
      http
        .$axios({
          url: "/mtv/api/updateLikeStatus",
          method: "POST", //get请求对应 params  post请求的对应 data
          headers: {
            token: true,
          },
          data: {
            cid: this.cid,
            value,
          },
        })
        .then((res) => {
          if (res.success) {
            //改变点赞状态
            let LikeNum = parseInt(this.isActiveLike[0].likeNum);
            let sign = 1;
            if (LikeStatus) sign *= -1;
            let num = LikeNum + sign;
            this.$set(this.isActiveLike, 0, { isLike: state, likeNum: num });
          } else {
            this.$message.error("网络异常,请重试");
          }
        });
    },
    //回复作者的功能
    replyAuthor() {
      let reply = this.textarea;
      if (reply.trim() == "") {
        this.$message.error("回复内容不能为空");
        return;
      }
      //获取当前时间
      let date = common.getInsertTime();
      let uid = this.comment_info.user_uid;
      //向后端发送请求
      http
        .$axios({
          url: "/mtv/api/addReply",
          method: "POST", //get请求对应 params  post请求的对应 data
          headers: {
            token: true,
          },
          data: {
            date,
            reply,
            cid: this.cid,
          },
        })
        .then((res) => {
          if (res.success) {
            let oldArr = this.comment_info.replyInfo;
            oldArr.push({
              date,
              reply,
              replySet: [],
              uid,
              nickName: this.userInfo.nickName,
              profile: this.userInfo.profile,
            });
            this.$set(this.comment_info, "replyInfo", oldArr);
            this.updateReplyView(uid);
            this.textarea = "";
          } else {
            this.$message.error("网络异常,请重试");
          }
        });
    },
    //更新回复视图
    updateReplyView(uid) {
      this.comment_info.replyInfo.forEach((v, k) => {
        if (v.replySet.length > 0) {
          let tmp = v.replySet.indexOf(uid);
          this.$set(this.replyActive, k, {
            isLike: tmp != -1,
            likeNum: v.replySet.length,
          });
        } else {
          this.$set(this.replyActive, k, {
            isLike: false,
            likeNum: 0,
          });
        }
      });
      this.replyLen = this.comment_info.replyInfo.length;
    },
    //删除我的回复
    deleteThisReply(index) {
      this.$confirm("确定删除此条回复吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          //向后端发送请求
          let tmp = this.comment_info.replyInfo;
          tmp.splice(index, 1);
          http
            .$axios({
              url: "/mtv/api/UpdateReply",
              method: "POST", //get请求对应 params  post请求的对应 data
              headers: {
                token: true,
              },
              data: {
                reply: tmp,
                cid: this.cid,
              },
            })
            .then((res) => {
              if (res.success) {
                this.$set(this.comment_info, "replyInfo", tmp);
              } else {
                this.$message.error(res.data);
              }
            });
        })
        .catch(() => {});
    },
    //给当前的回复点赞
    likeThisReply(index) {
      let tmp = this.comment_info.replyInfo;
      let uid = this.comment_info.user_uid;
      let newArr = tmp.map((v, k) => {
        if (k === index) {
          let find = v.replySet.indexOf(uid);
          if (find == -1) {
            //找不到就放进去
            v.replySet.push(uid);
          } else {
            v.replySet.splice(find, 1);
          }
        }
        return v;
      });
      http
        .$axios({
          url: "/mtv/api/UpdateReply",
          method: "POST", //get请求对应 params  post请求的对应 data
          headers: {
            token: true,
          },
          data: {
            reply: newArr,
            cid: this.cid,
          },
        })
        .then((res) => {
          if (res.success) {
            this.$set(this.comment_info, "replyInfo", newArr);
            this.updateReplyView(uid);
          } else {
            this.$message.error(res.data);
          }
        });
    },
    //打开并初始化编辑器
    openEditor() {
      this.$refs.CE.initialEditor(this.cid);
    },
    //删除评论
    deleteComment() {
      let cid = this.cid;
      this.$confirm("您确定要永久删除此评论吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          http
            .$axios({
              url: "/mtv/api/deleteComment",
              method: "POST", //get请求对应 params  post请求的对应 data
              headers: {
                token: true,
              },
              data: {
                cid,
              },
            })
            .then((res) => {
              if (res.success) {
                //跳转到电影详情页
                //返回上一级
                this.$router.push("/movie/" + this.mid);
              } else {
                this.$message.error(res.data);
              }
            });
        })
        .catch(() => {});
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
.comment-wrapper {
  background-color: #00284e;
}
.activeLike {
  color: gold;
}
.comment-content {
  max-width: 2560px;
  width: 1400px;
  min-height: 90vh;
  position: relative;
  margin: 0 auto;
  background-color: #00284e;
  padding-top: 40px;
  .comment-header {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    padding: 10px;
    color: white;
    .comment-title {
      text-align: center;
      margin-bottom: 30px;
    }
    .comment-author {
      display: flex;
      justify-content: space-between;
      .left-holder {
        flex: 0.3;
      }
      .author-info {
        flex: 0.4;
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        .profile-wrapper {
          width: 75px;
          height: 75px;
          margin: 0 auto;
          border-radius: 50%;
          border: 1px solid #eee;
          img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
          }
        }
        p {
          font-size: 18px;
          padding: 5px 0;
          margin: 0;
        }
        .rate-box {
          margin: 0 auto;
          display: flex;
          align-items: center;
        }
      }
      .toolbar {
        flex: 0.3;
        .comment-edit {
          display: flex;
          height: 100%;
          flex-direction: column;
          align-items: flex-end;
          span {
            font-size: 20px;
            i {
              font-size: 20px;
            }
          }
          span:hover {
            color: gold;
            cursor: pointer;
            text-decoration: underline;
          }
        }
      }
    }
  }
  .comment-richText {
    width: 100%;
    padding: 10px;
    border-radius: 10px;
    margin-top: 10px;
    background-color: white;
    overflow: auto;
  }
  .comment-bottom {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .favor-btn {
      margin: 15px auto;
      width: 20px;
      height: 20px;
      color: white;
      i {
        font-size: 20px;
        cursor: pointer;
      }
    }
    .article-copyright {
      text-align: center;
      font-size: 17px;
      color: white;
    }
  }
  .comment-reply-wrapper {
    width: 100%;
    border-radius: 15px;
    margin-top: 50px;
    background-color: white;
    padding: 10px 0;
    .comment-reply-header-info {
      text-align: center;
      font-size: 20px;
      margin-bottom: 10px;
      font-weight: bolder;
    }
    .reply-box {
      width: 600px;
      margin: 10px auto;
      display: flex;
      background-color: #f0f0f0;
      border-radius: 5px;
      align-items: center;
      padding: 5px 0;
      .profile-wrapper {
        flex: 0.25;
        @include flexCenter();
        ::v-deep .el-image {
          border-radius: 50%;
          border: 1px solid #cccccc;
        }
      }
      .reply-content-wrapper {
        flex: 0.6;
      }
      .btn-wrapper {
        flex: 0.15;
        @include flexCenter();
      }
    }
    .reply-wrapper {
      width: 100%;
      .list {
        width: 100%;
        li {
          width: 600px;
          height: auto;
          padding: 10px 5px;
          display: flex;
          margin: 25px auto;
          justify-content: center;
          flex-direction: column;
          background-color: #f0f0f0;
          border-radius: 5px;
          .reply-info-header {
            display: flex;
            justify-content: space-around;
            align-items: center;
            ::v-deep .el-image {
              border-radius: 50%;
              border: 1px solid #cccccc;
            }
            .like-part {
              i {
                cursor: pointer;
              }
            }
          }
          hr {
            margin: 5px 0;
            border: 1px solid white;
          }
          p {
            margin-left: 5px;
          }
          .delete-wrapper {
            span {
              position: relative;
              top: 30px;
              right: -95%;
            }
            span:hover {
              color: gold;
              cursor: pointer;
              text-decoration: underline;
            }
          }
        }
      }
    }
  }
}
</style>
