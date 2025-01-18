<template>
  <div class="topBar">
    <div class="logo" @click="goHome">
      <img :src="baseInfo.logo" alt="" />
    </div>
    <div class="search">
      <div class="search_box">
        <el-input
          placeholder="请输入影视剧关键字"
          v-model="search_input"
          @keyup.enter.native="goSearch"
        >
          <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
        <el-button icon="el-icon-right" @click="goSearch">搜索</el-button>
      </div>
    </div>
    <div class="menu">
      <i
        :class="
          act
            ? menuBar
              ? 'el-icon-s-fold activeA'
              : 'activeBackground el-icon-s-fold activeB'
            : 'el-icon-s-fold activeB'
        "
        @click="openMenu"
        @mouseenter="isActiveBack(true)"
        @mouseleave="isActiveBack(false)"
      ></i>

      <el-collapse-transition>
        <ul v-show="menuBar" @mouseleave="closeMenu">
          <li>
            <p>影视分类</p>
            <div class="mtvClass">
              <a
                @click="goClass(item.title)"
                v-for="(item, index) in mtv_Type_List"
                :key="index"
                >{{ item.title }}</a
              >
            </div>
          </li>
          <li class="middlePart">
            <p>榜单排名</p>
            <div class="mtvClass2">
              <router-link
                :to="{
                  path: '/Rank/movie',
                  query: {
                    m: 1,
                    page: 1,
                  },
                }"
                >MTSAS电影总排名 TOP 256</router-link
              >
              <router-link
                :to="{
                  path: '/Rank/tv',
                  query: {
                    m: 2,
                    page: 1,
                  },
                }"
                >MTSAS电视剧总排名 TOP 64</router-link
              >
            </div>
          </li>
          <!-- <li>
            <p>咨询&周边</p>
            <div class="mtvClass2">
              <a href="#" target="_blank">MTSAS新资讯</a>
              <a href="#" target="_blank">电影周边</a>
            </div>
          </li> -->
        </ul>
      </el-collapse-transition>
    </div>
    <div class="avatar">
      <el-dropdown placement="bottom" @command="handleUserDrop">
        <img
          :src="
            baseUrl +
            (loginStatus ? this.userInfo.profile : 'avatar-default.png')
          "
          @click="goUserCenter"
        />
        <el-dropdown-menu slot="dropdown">
          <!-- 登录显示的内容 -->
          <section v-if="loginStatus">
            <div class="user-Info">
              <p>
                <span>{{ userInfo.nickName }}</span>
              </p>
              <!-- <p>
                <i class="el-icon-s-ticket"></i> MTS券:
                <strong class="ticket-num">{{ userInfo.tickets }}</strong>
              </p> -->
            </div>
            <el-dropdown-item command="1"
              >个人中心 <i class="el-icon-arrow-right"></i
            ></el-dropdown-item>
            <el-dropdown-item command="2"
              >退出登录 <i class="el-icon-arrow-right"></i
            ></el-dropdown-item>
          </section>
          <!-- 不登录显示的内容 -->
          <section v-else>
            <div class="visitor-Info">
              <p>您当前还未登录</p>
              <p>
                <el-button type="primary" round @click="bounceBox(true)"
                  >登录账号</el-button
                >
              </p>
              <p>
                <el-button type="primary" round @click="bounceBox(false)"
                  >注册账号</el-button
                >
              </p>
            </div>
          </section>
        </el-dropdown-menu>
      </el-dropdown>
      <div class="funcList">
        <el-dropdown placement="bottom" @command="handleBellDrop">
          <span class="el-dropdown-link">
            <el-badge :is-dot="total_unreadNum > 0" class="item">
              <i class="el-icon-bell"></i>
            </el-badge>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              icon="icon iconfont icon-xitongtongzhi"
              command="3"
            >
              <el-badge :value="sys_unread" :max="99" :hidden="sys_unread == 0">
                系统通知<i class="el-icon-arrow-right"></i> </el-badge
            ></el-dropdown-item>
            <el-dropdown-item icon="icon iconfont icon-huifu1" command="4">
              <el-badge :value="reply_unread" :max="99" :hidden="reply_unread == 0">
                回复我的<i class="el-icon-arrow-right"></i>
              </el-badge>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <!-- <el-dropdown placement="bottom" @command="handleShopDrop">
          <span class="el-dropdown-link">
            <el-badge is-dot class="item">
              <i class="el-icon-shopping-bag-1"> </i>
            </el-badge>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item icon="el-icon-document-checked" command="5"
              >我的订单<i class="el-icon-arrow-right"></i
            ></el-dropdown-item>
            <el-dropdown-item icon="el-icon-present" command="6"
              >电影周边<i class="el-icon-arrow-right"></i
            ></el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown> -->
      </div>
    </div>
    <SignIn :pop="pop" @isRefresh="isRefresh"></SignIn>
  </div>
</template>
<script>
import SignIn from "./SignInView.vue";
import { mapState, mapMutations } from "vuex";
import http from "@/common/api/request.js";
export default {
  data() {
    return {
      pop: {
        signInOrUp: "",
        dialogFormVisible: 0,
      },
      search_input: "",
      menuBar: false,
      act: false,
      cnt: 0,
      mtv_Type_List: [
        { id: 0, title: "全部" },
        { id: 1, title: "动作" },
        { id: 2, title: "爱情" },
        { id: 3, title: "恐怖" },
        { id: 4, title: "科幻" },
        { id: 5, title: "战争" },
        { id: 6, title: "悬疑" },
        { id: 7, title: "动画" },
        { id: 8, title: "喜剧" },
        { id: 9, title: "犯罪" },
        { id: 10, title: "剧情" },
        { id: 11, title: "惊悚" },
        { id: 12, title: "冒险" },
        { id: 13, title: "传记" },
      ],
    };
  },
  created() {
    this.baseUrl = global.env.SERVER_BASE + "/public/images/avatar/";
    if (this.isNull) this.getWebInfo();
  },
  mounted() {
    if (!this.loginStatus) {
      this.bounceBox(true);
    }
  },
  computed: {
    ...mapState({
      loginStatus: (state) => state.user.loginStatus,
      userInfo: (state) => state.user.userInfo,
      baseInfo: (state) => state.web.baseInfo,
      isNull: (state) => state.web.isNull,
      total_unreadNum: (state) => state.user.total_unreadNum,
      sys_unread: (state) => state.user.sys_unread,
      reply_unread: (state) => state.user.reply_unread,
    }),
  },
  methods: {
    ...mapMutations(["loginOut", "webInfo"]), //调用loginOut和getWebInfo方法
    //获取网站基本信息
    getWebInfo() {
      http
        .$axios({
          url: "/api/web/baseInfo",
          method: "GET", //get请求对应 params  post请求的对应 data
        })
        .then((res) => {
          if (res.success) {
            //放到vuex中
            this.webInfo(res.data);
          } else {
            this.$message.error(res.data);
          }
        });
    },
    //根据分类查找电影
    goClass(title) {
      this.$emit("path", title);
      let param = btoa(encodeURIComponent(JSON.stringify(title)));
      this.$router.push({
        path: "/explore",
        query: {
          type: param,
          page: 1,
        },
      });
    },
    openMenu() {
      this.menuBar = !this.menuBar;
    },
    closeMenu() {
      this.menuBar = false;
    },
    isActiveBack(val) {
      this.act = val;
    },
    goHome() {
      //如果是首页就无需跳转到首页
      if (this.$router.history.current.name != "HomeView") {
        this.$router.push("/home");
      }
    },
    goUserCenter() {
      if (this.$route.path == "/userCenter") return;
      window.open(global.env.DOMAIN_NAME + "/userCenter/user");
      // this.$router.push("/userCenter/user");
    },
    bounceBox(val) {
      /*判断用户点击的是注册还是登录按钮*/
      //val为true是密码登录,false为注册
      this.pop.dialogFormVisible = this.cnt++;
      this.cnt = this.cnt > 10 ? 0 : this.cnt;
      this.pop.signInOrUp = val ? "one" : "two";
    },
    handleUserDrop(n) {
      if (n == 1) {
        //跳转到个人中心
        this.goUserCenter(); //这里用导航守卫
      } else {
        //退出登录
        this.loginOut();
        this.isRefresh();
      }
    },
    handleShopDrop(n) {
      if (n == 5) {
        //进入我的订单页面
        // this.$router.push({
        // });
      } else {
        //进入电影周边
      }
    },
    //通知界面
    handleBellDrop(n) {
      if (n == 3) {
        //进入系统通知界面
        window.open(global.env.DOMAIN_NAME + "/userCenter/notice?tar=1");
      } else {
        //进入我的消息界面
        window.open(global.env.DOMAIN_NAME + "/userCenter/notice?tar=0");
      }
    },
    isRefresh() {
      this.$emit("isRefresh", true);
    },
    goSearch() {
      let search = this.search_input;
      if (search.trim().length == 0) {
        this.$message.error("请输入搜索内容");
        return;
      }
      let clean_search = this.searchFilter(search);
      //先判断当前路径是否是搜索页面
      if (this.$route.name == "SearchView") {
        //触发父组件中的搜索方法
        this.$emit("searchMovie", clean_search);
        return;
      }
      this.$router.push({
        name: "SearchView",
        query: {
          keyword: clean_search,
          page: 1,
        },
      });
    },
    //特殊字符转义及过滤
    searchFilter(str) {
      // 转义特殊字符
      let escapedStr = str.replace(/[\\"'\\\n\r\t]/g, function (char) {
        switch (char) {
          case "\\":
            return "\\\\";
          case '"':
            return '\\"';
          case "'":
            return "\\'";
          case "\n":
            return "\\n";
          case "\r":
            return "\\r";
          case "\t":
            return "\\t";
        }
        return char;
      });
      // 限制字符串长度
      if (escapedStr.length > 25) {
        escapedStr = escapedStr.substring(0, 25);
      }
      return escapedStr;
    },
  },
  components: {
    SignIn,
  },
};
</script>
<style lang="scss" scoped>
@import "@/assets/css/topBar.scss";
</style>
