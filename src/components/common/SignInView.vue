<template>
  <div class="signIn">
    <el-dialog
      title="用户隐私协议"
      :visible.sync="centerDialogVisible"
      width="max-content"
      center
    >
      <div v-html="baseInfo.privacyPolicy"></div>
    </el-dialog>
    <!-- 登录注册的弹框 -->
    <el-dialog
      :visible.sync="isPopBox"
      :close-on-click-modal="false"
      @close="resetPopVal"
    >
      <el-tabs type="card" v-model="isTabSwitch">
        <el-tab-pane label="密码登录" name="one">
          <div class="login-panel">
            <el-form
              :model="ruleForm"
              status-icon
              :rules="rules"
              @keyup.enter.native="login"
            >
              <el-form-item prop="phone">
                <el-input
                  placeholder="请输入账号"
                  prefix-icon="el-icon-user"
                  v-model="ruleForm.phone"
                >
                </el-input>
              </el-form-item>
              <el-form-item prop="pwd">
                <el-input
                  placeholder="请输入密码"
                  prefix-icon="el-icon-lock"
                  v-model="ruleForm.pwd"
                  show-password
                ></el-input>
              </el-form-item>
              <p class="forgetPwd" @click="goForget">忘记密码？</p>
              <div class="btn-wrapper">
                <el-button type="primary" @click="login">立即登录</el-button>
              </div>
            </el-form>
          </div>
        </el-tab-pane>

        <el-tab-pane label="短信登录/注册" name="two">
          <div class="register-panel">
            <el-form
              :model="ruleForm"
              status-icon
              :rules="rules"
              @keyup.enter.native="signInOrUpBtn"
            >
              <el-form-item prop="phone">
                <el-input
                  placeholder="请输入手机号"
                  prefix-icon="el-icon-phone-outline"
                  v-model="ruleForm.phone"
                >
                </el-input>
              </el-form-item>

              <el-form-item prop="code">
                <div class="getCode">
                  <el-input
                    placeholder="请输入验证码"
                    prefix-icon="el-icon-key"
                    v-model="ruleForm.code"
                    class="input-code"
                  >
                  </el-input>
                  <el-button
                    type="primary"
                    :disabled="btnStatus"
                    @click="getVCode"
                    >{{ btnMsg }}</el-button
                  >
                </div>
              </el-form-item>
              <div class="btn-wrapper">
                <el-button type="primary" @click="signInOrUpBtn"
                  >登录/注册</el-button
                >
              </div>
            </el-form>
            <p>未注册过MT影界指南的手机号，我们将自动帮你注册账号</p>
            <p>
              <span>登录或完成注册即代表你同意</span
              ><em @click="openPrivacyPolicy">隐私协议</em>
            </p>
          </div>
          <VerifyBox></VerifyBox>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>
<script>
import { mapMutations, mapState, mapActions } from "vuex";
import http from "@/common/api/request.js";
import VerifyBox from "./VerifyUserView.vue";
import CryptoJS from 'crypto-js';  
export default {
  props: {
    pop: Object,
  },
  components: {
    VerifyBox,
  },
  data() {
    return {
      current_image: "",
      isPopBox: false,
      isTabSwitch: "",
      centerDialogVisible: false, //用户协议框默认不显示s
      ruleForm: {
        //用户输入的数据
        phone: "",
        code: "",
        pwd: "",
      },
      rules: {
        phone: [
          {
            type: "string",
            pattern: /^1[3456789]\d{9}$/,
            trigger: "blur",
            message: "请输入正确的手机号码",
          },
          {
            required: true,
            trigger: "blur",
            message: "手机号不为空",
          },
        ],
        code: [{ required: true, length: 4, message: "验证码错误" }],
        pwd: [{ required: true, message: "密码不为空" }],
      },
    };
  },
  watch: {
    pop: {
      //监听从父组件Topbar传过来的属性
      handler(n) {
        this.isPopBox = n.dialogFormVisible > -1 ? true : false;
        this.isTabSwitch = n.signInOrUp;
      },
      deep: true, // 深度监听父组件传过来对象变化
    },
  },
  computed: {
    ...mapState({
      loginStatus: (state) => state.user.loginStatus,
      baseInfo: (state) => state.web.baseInfo,
      innerVisible: (state) => state.user.innerVisible,
      passport: (state) => state.user.passport,
      btnMsg: (state) => state.user.btnMsg,
      btnStatus: (state) => state.user.btnStatus,
    }),
  },
  methods: {
    ...mapMutations(["userLogin", "openVerifyBox"]),
    ...mapActions(["getVerifyCode", "getMyComment"]),
    goForget() {
      this.$router.push("/account/setPassword");
    },
    //校验表单
    validate(key, val) {
      let bool = true;
      if (!this.rules[key][0].pattern.test(val)) {
        this.$message.error(this.rules[key][0].message);
        bool = false;
        return false;
      }
      return bool;
    },
    resetPopVal() {
      this.closeLoginWindow();
      this.isTabSwitch = "";
    },
    //关闭登录窗口
    closeLoginWindow() {
      this.isPopBox = false;
      let modal = document.querySelector(".v-modal");
      modal.style.display = "none";
    },
    //打开隐私协议
    openPrivacyPolicy() {
      this.centerDialogVisible = true;
    },
    //获取验证码按钮单击事件
    getVCode() {
      //判断手机号是否符合基本匹配规则
      let validate = !this.validate("phone", this.ruleForm.phone);
      if (validate) return;
      let typeVal = {
        url: "/api/login/code",
        userVal: this.ruleForm.phone,
        type: 1,
      }; //type:1是新用户注册或正常登录,type:2是找回密码
      this.getVerifyCode(typeVal);
    },
    login() {
      //单击登录按钮事件
      //先判断手机号和密码是否通过验证规则
      let formVal = this.ruleForm;
      if (!this.validate("phone", formVal.phone)) {
        this.$message.error(this.rules["phone"][0].message);
        return;
      }
      if (formVal.pwd.trim().length <= 0) {
        this.$message.error("密码不为空");
        return;
      }
      //都通过规则了,向后端发送请求
      http
        .$axios({
          url: "/users/api/signIn",
          method: "POST", //get请求对应 params  post请求的对应 data
          data: {
            userTel: this.ruleForm.phone,
            userPwd: this.ruleForm.pwd,
          },
        })
        .then((res) => {
          if (res.success) {
            //用户信息保存到localstorage
            this.userLogin(res.data);
            this.$store.commit("webInit");
            this.$store.dispatch("initCollectionFolder");
            this.$store.dispatch("getMyComment");
            this.isRefresh();
            //关闭登录弹窗
            this.closeLoginWindow();
          } else {
            this.$message.error(res.data);
            return;
          }
        });
    },
    //验证码登录或注册单击事件
    signInOrUpBtn() {
      //先判断手机号和验证码是否通过验证规则
      let formVal = this.ruleForm;
      if (!this.validate("phone", formVal.phone)) {
        this.$message.error(this.rules["phone"][0].message);
        return;
      }
      //输入的验证码加密
      let encInputCode= CryptoJS.SHA256(formVal.code).toString();
      if (formVal.code.length != 4 ||  encInputCode != this.passport) {
        this.$message.error(this.rules["code"][0].message);
        return;
      }
      //都通过了,向后端发送请求
      http
        .$axios({
          url: "/users/api/signInOrUp",
          method: "POST", //get请求对应 params  post请求的对应 data
          data: {
            userTel: this.ruleForm.phone,
          },
        })
        .then((res) => {
          if (!res.success) {
            this.$message.error(res.data);
            return;
          }
          //用户信息保存到localstorage
          this.userLogin(res.data);
          this.$store.commit("webInit");
          this.$store.dispatch("initCollectionFolder");
          this.$store.commit("getMyComment");
          this.isRefresh();
          //关闭登录弹窗
          this.closeLoginWindow();
          window.location.reload();
        });
    },
    //刷新
    isRefresh() {
      this.$emit("isRefresh", true); // 触发自定义事件，传递值给父组件
    },
  },
};
</script>
<style scoped lang="scss">
@import "@/assets/css/sign.scss";
</style>
