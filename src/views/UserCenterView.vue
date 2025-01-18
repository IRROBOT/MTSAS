<template>
  <div class="userCenter">
    <TopBar @isRefresh="reloadUserInfo"></TopBar>
    <div class="page-header-part">
      <div class="header-bar">
        <h1>
          个人中心<el-divider direction="vertical"></el-divider
          ><span>{{ brief[funcIndex].text }}</span>
        </h1>
      </div>
    </div>
    <div class="user-info">
      <div class="left-menu">
        <el-menu :default-active="activeName" @select="chooseOne">
          <el-menu-item index="0">
            <i class="icon iconfont icon-zhanghushezhi"></i>
            <span slot="title">账户设置</span>
          </el-menu-item>
          <el-menu-item index="1">
            <i class="icon iconfont icon-wodeshoucang"></i>
            <span slot="title">我的收藏</span>
          </el-menu-item>
          <el-menu-item index="2">
            <i class="el-icon-s-comment"></i>
            <span slot="title">我的评论</span>
          </el-menu-item>
          <el-menu-item index="3">
            <i class="el-icon-message-solid"></i>
            <span slot="title">消息中心</span>
          </el-menu-item>
        </el-menu>
      </div>
      <div class="right-content">
        <section v-if="brief[0].show">
          <UserInfo ref="userInfo"></UserInfo>
        </section>
        <section v-else-if="brief[1].show">
          <UserCollection ref="userCollection"></UserCollection>
        </section>
        <section v-else-if="brief[2].show">
          <UserComment ref="userComment"></UserComment>
        </section>
        <section v-else-if="brief[3].show">
          <UserNotification></UserNotification>
        </section>
      </div>
    </div>
    <Footer></Footer>
  </div>
</template>
<script>
import TopBar from "@/components/common/TopbarView.vue";
import Footer from "@/components/common/FooterView.vue";
import UserInfo from "@/components/common/userCenter/userInfoView.vue";
import UserCollection from "@/components/common/userCenter/userCollectionView.vue";
import UserComment from "@/components/common/userCenter/userCommentView.vue";
import UserNotification from "@/components/common/userCenter/userNotificationView.vue";
import { mapState, mapMutations } from "vuex";
import http from "@/common/api/request.js";
export default {
  name: "UserCenterView",
  data() {
    return {
      brief: [
        { path: "user", text: "管理个人账户信息", show: false },
        { path: "collection", text: "管理收藏的影视剧", show: false },
        { path: "comment", text: "管理我的评论信息", show: false },
        { path: "notice", text: "管理通知和消息", show: false },
      ],
      funcIndex: 0,
      activeName: "0",
    };
  },
  computed: {
    ...mapState({
      userInfo: (state) => state.user.userInfo,
      unreadNum: (state) => state.user.unreadNum,
    }),
  },
  created() {
    let section = this.$route.params.section;

    if (section == "user") {
      this.brief[0].show = true;
      this.activeName = "0";
    } else if (section == "collection") {
      this.brief[1].show = true;
      this.activeName = "1";
    } else if (section == "comment") {
      this.brief[2].show = true;
      this.activeName = "2";
    } else if (section == "notice") {
      this.brief[3].show = true;
      this.activeName = "3";
    }
  },
  mounted() {
    if (this.$route.params.section == "comment")
      this.$refs.userComment.getMyComment("uc.comment_date", "desc");
  },
  methods: {
    ...mapMutations(["setUserCollection", "setCommentInfo", "setUnreadNum"]),
    chooseOne(index) {
      //选择需要展示的功能
      this.funcIndex = index;
      this.brief.forEach((v) => {
        v.show = false;
      });
      this.brief[index].show = true;
      // 切换页面地址
      let param = {
        name: "UserCenterView",
        params: { section: this.brief[index].path },
      };
      if (index == 3)
        param = {
          name: "UserCenterView",
          params: { section: this.brief[index].path },
          query: { tar: 0 },
        };
      this.$router.replace(param);
      //判断是否需要更新未读消息
      if (index == 3 && this.unreadNum > 0) {
        this.updateUnread();
      }
    },
    reloadUserInfo() {
      this.$refs.userInfo.reloadData();
    },
    updateUnread() {
      //先更新数据库,全部设为已读状态
      http
        .$axios({
          url: "/mtv/api/updateNotification",
          method: "POST",
          headers: {
            token: true,
          },
        })
        .then((res) => {
          if (res.success) {
            //更新vuex中的未读消息状态
            this.setUnreadNum();
          } else {
            this.$message.error(res.data);
          }
        });
    },
  },
  components: {
    TopBar,
    Footer,
    UserInfo,
    UserCollection,
    UserComment,
    UserNotification,
  },
};
</script>
<style scoped lang="scss">
@import "@/assets/css/userCenter.scss";
</style>
