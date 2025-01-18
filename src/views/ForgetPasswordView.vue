<template>
  <div class="FPV">
    <TopBar></TopBar>
    <div class="operator-panel">
      <h2>{{ editType }}</h2>
      <div class="step-bar-wrapper">
        <el-steps :active="activeStep" v-if="setType == 'setPassword'">
          <el-step title="输入绑定的邮箱账号或手机号码"></el-step>
          <el-step title="获取验证码"></el-step>
          <el-step title="修改密码"></el-step>
          <el-step title="修改成功"></el-step>
        </el-steps>
        <el-steps :active="activeStepEmail" v-else>
          <el-step title="输入新邮箱账号"></el-step>
          <el-step title="获取验证码"></el-step>
          <el-step title="设置成功"></el-step>
        </el-steps>
      </div>
      <div class="setPass-wrapper" v-if="setType == 'setPassword'">
        <section class="input-value" v-if="activeStep == 1">
          <el-form :model="ruleForm" status-icon ref="ruleForm" :rules="rules">
            <el-form-item prop="value">
              <el-input
                v-model="ruleForm.value"
                placeholder="请输入绑定的邮箱账号或手机号码"
                clearable
              ></el-input>
            </el-form-item>
          </el-form>
        </section>
        <section class="verify-code" v-else-if="activeStep == 2">
          <VerifyBox></VerifyBox>
          <p>
            向{{ type == "account" ? "手机号码" : "邮箱账号" }}为<strong>{{
              ruleForm.value
            }}</strong
            >的用户发送验证码
          </p>
          <div class="verify-wrapper">
            <el-button
              type="primary"
              :disabled="btnStatus"
              @click="getVCode(ruleForm.value)"
              >{{ btnMsg }}</el-button
            >
            <el-input
              placeholder="请输入验证码"
              @input="isLightBtn(true)"
              v-model="inputCode"
            ></el-input>
          </div>
        </section>
        <section class="modify-password" v-else-if="activeStep == 3">
          <el-form
            :model="ruleFormPass"
            ref="ruleFormPass"
            status-icon
            :rules="rulesPass"
          >
            <el-form-item prop="password">
              <el-input
                v-model="ruleFormPass.password"
                placeholder="请输入新密码,密码由数字和字母组成，长度在6到15位之间"
                show-password
              ></el-input>
            </el-form-item>
            <el-form-item prop="password2">
              <el-input
                v-model="ruleFormPass.password2"
                @input="isEnableModify"
                placeholder="请重复新密码"
                show-password
              ></el-input>
            </el-form-item>
          </el-form>
        </section>
        <div class="modify-success" v-else-if="activeStep == 4">
          <p>恭喜您修改成功，您现在可以重新登录了！</p>
          <p>{{ countDownMsg }}</p>
        </div>
        <div class="next-wrapper" v-show="activeStep != 4">
          <el-button
            type="primary"
            @click="nextStep"
            :disabled="nextStepStatus"
            >{{ guideBtnMsg }}</el-button
          >
        </div>
      </div>
      <div class="setEmail-wrapper" v-else>
        <section class="setEmail-section" v-if="activeStepEmail == 1">
          <el-form
            :model="ruleFormEmail"
            ref="ruleFormEmail"
            status-icon
            :rules="rulesEmail"
            class="email-form"
          >
            <el-form-item prop="email">
              <el-input
                v-model="ruleFormEmail.email"
                placeholder="请输入邮箱"
              ></el-input>
            </el-form-item>
          </el-form>
        </section>
        <section class="get-email-code" v-else-if="activeStepEmail == 2">
          <VerifyBox></VerifyBox>
          <p>
            向邮箱账号为<strong>{{ ruleFormEmail.email }}</strong
            >的用户发送验证码
          </p>
          <div class="verify-wrapper">
            <el-button
              type="primary"
              :disabled="btnStatus"
              @click="getVCode(ruleFormEmail.email)"
              >{{ btnMsg }}</el-button
            >
            <el-input
              placeholder="请输入验证码"
              @input="isLightBtn(false)"
              v-model="bindCode"
            ></el-input>
          </div>
        </section>
        <div class="modify-success" v-else-if="activeStepEmail == 3">
          <p>恭喜您绑定成功</p>
          <p>{{ countDownMsg }}</p>
        </div>
        <div class="next-wrapper" v-if="activeStepEmail != 3">
          <el-button
            type="primary"
            @click="nextStepEmail"
            :disabled="nextStepStatusEmail"
            >{{ guideBtnMsgEmail }}</el-button
          >
        </div>
      </div>
    </div>
    <Footer></Footer>
  </div>
</template>
<script>
import TopBar from "@/components/common/TopbarView.vue";
import Footer from "@/components/common/FooterView.vue";
import { mapMutations, mapState, mapActions } from "vuex";
import VerifyBox from "@/components/common/VerifyUserView.vue";
import CryptoJS from 'crypto-js';  
import http from "@/common/api/request.js";
export default {
  name: "ForgetPassword",
  components: {
    TopBar,
    Footer,
    VerifyBox,
  },
  data() {
    //自定义验证规则
    const checkPhoneOrEmail = (rule, value, callback) => {
      const Regex =
        /^(?:1[3-9]\d{9}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
      if (!Regex.test(value)) {
        this.nextStepStatus = true;
        callback(new Error("手机号码或邮箱账号格式错误"));
      } else {
        this.nextStepStatus = false;
        callback();
      }
    };
    const checkPass = (rule, value, callback) => {
      if (this.ruleFormPass.password != this.ruleFormPass.password2) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    const checkEmail = (rule, value, callback) => {
      const Regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!Regex.test(value)) {
        this.nextStepStatusEmail = true;
        callback(new Error("邮箱账号格式错误"));
      } else {
        this.nextStepStatusEmail = false;
        callback();
      }
    };
    return {
      activeStep: 1,
      type: "手机号码",
      inputCode: "",
      countDownMsg: "3秒后自动跳转到首页",
      guideBtnMsg: "下一步",
      isCorrect: false, //获得授权的标志
      nextStepStatus: true, //默认下一步按钮的状态为禁用
      ruleForm: {
        value: "",
      },
      ruleFormPass: {
        password: "",
        password2: "",
      },
      rulesPass: {
        password: [
          {
            required: true,
            message: "请输入密码",
            trigger: "blur",
          },
          {
            type: "string",
            pattern: /^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z\d]{6,15}$/,
            trigger: "change",
            message: "密码由数字和字母组成，长度在6到15位之间",
          },
          {
            type: "string",
            pattern: /^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z\d]{6,15}$/,
            trigger: "blur",
            message: "密码由数字和字母组成，长度在6到15位之间",
          },
        ],
        password2: [
          {
            type: "string",
            validator: checkPass,
            message: "两次输入的密码不一致",
            trigger: "change",
          },
          {
            type: "string",
            validator: checkPass,
            message: "两次输入的密码不一致",
            trigger: "blur",
          },
        ],
      },
      rules: {
        value: [
          {
            required: true,
            message: "请输入绑定的邮箱账号或手机号码",
            trigger: "blur",
          },
          {
            type: "string",
            validator: checkPhoneOrEmail,
            trigger: "change",
          },
          {
            type: "string",
            validator: checkPhoneOrEmail,
            trigger: "blur",
          },
        ],
      },
      ruleFormEmail: {
        email: "",
      },
      rulesEmail: {
        email: [
          {
            required: true,
            message: "请输入邮箱账号",
            trigger: "blur",
          },
          {
            type: "string",
            validator: checkEmail,
            message: "请输入正确的邮箱账号",
            trigger: "change",
          },
          {
            type: "string",
            validator: checkEmail,
            message: "请输入正确的邮箱账号",
            trigger: "blur",
          },
        ],
      },
      editType: "重置密码",
      activeStepEmail: 1,
      bindCode: "",
      nextStepStatusEmail: true,
      guideBtnMsgEmail: "下一步",
    };
  },
  computed: {
    ...mapState({
      innerVisible: (state) => state.user.innerVisible,
      passport: (state) => state.user.passport,
      btnMsg: (state) => state.user.btnMsg,
      btnStatus: (state) => state.user.btnStatus,
    }),
  },
  created() {
    this.setType = this.$route.params.type;
    if (this.setType == "setPassword") {
      this.editType = "重置密码";
    } else if (this.setType == "setEmail") {
      this.editType = "绑定邮箱";
    } else {
      this.editType = "修改邮箱";
    }
  },
  mounted() {
    let _this = this;
    window.onbeforeunload = function (e) {
      if (_this.$route.name == "ForgetPassword") {
        e = e || window.event;
        // 兼容IE8和Firefox 4之前的版本
        if (e) {
          e.returnValue = "系统可能不会保存您所做的更改,确定关闭此页面吗?";
        }
        // Chrome, Safari, Firefox 4+, Opera 12+ , IE 9+
        return "系统可能不会保存您所做的更改,确定关闭此页面吗?";
      } else {
        window.onbeforeunload = null;
      }
    };
  },
  methods: {
    ...mapMutations(["openVerifyBox", "loginOut"]),
    ...mapActions(["getVerifyCode"]),
    isLightBtn(val) {
      //第二步控制下一步按钮使能的方法inputCode长度为4
      if (val) this.nextStepStatus = this.inputCode.length != 4;
      else this.nextStepStatusEmail = this.bindCode.length != 4;
    },
    isEnableModify() {
      this.$refs["ruleFormPass"].validate((valid) => {
        if (valid) {
          this.nextStepStatus = false; //打开修改开关
        } else {
          this.nextStepStatus = true;
        }
      });
    },
    async nextStep() {
      if (this.activeStep == 1) {
        this.$refs["ruleForm"].validate((valid) => {
          if (valid) {
            this.ruleForm.value.includes("@")
              ? (this.type = "email")
              : (this.type = "account");
          } else {
            this.$message.error("手机号码或邮箱账号格式错误");
            return false;
          }
        });
        let thisFlag = await this.confirmInput();
        if (!thisFlag) return false;
      } else if (this.activeStep == 2) {
        let param = this.inputCode.trim();
        //输入的验证码加密
      let encInputCode= CryptoJS.SHA256(param).toString();
        //验证验证码是否正确
        if (param.length == 0 || param.length != 4 || this.passport != encInputCode) {
          //相等就可以下一步
          this.isCorrect = false;
          this.$message.error("验证码错误");
          return false;
        }
        this.isCorrect = true;
        this.guideBtnMsg = "确定修改";
      } else if (this.activeStep == 3) {
        if (!this.isCorrect) {
          //验证验证码是否正确
          this.$message.error("请先验证验证码");
          this.activeStep = 2;
          return false;
        }
        //向后端发送修改用户密码的请求
        this.changeMyPass();
      }
      if (this.activeStep != 3) {
        this.nextStepStatus = false;
        this.activeStep += 1;
        this.nextStepStatus = true;
      }
    },
    // 邮箱设置下一步按钮
    async nextStepEmail() {
      if (this.activeStepEmail == 1) {
        this.$refs["ruleFormEmail"].validate((valid) => {
          if (valid) {
            this.type = "email";
          } else {
            this.$message.error("邮箱账号格式错误");
            return false;
          }
        });
        let thisFlag = await this.confirmInput();
        if (!thisFlag) return false;
      } else if (this.activeStepEmail == 2) {
        let param = this.bindCode.trim();
        //验证验证码是否正确
        if (param.length == 0 || param.length != 4 || this.passport != param) {
          //相等就可以下一步
          this.$message.error("验证码错误");
          return false;
        }
        this.guideBtnMsgEmail = "确认绑定";
        //向后端发送修改用户密码的请求
        this.changeMyEmail();
      }
      if (this.activeStepEmail != 2) {
        this.nextStepStatusEmail = false;
        this.activeStepEmail += 1;
        this.nextStepStatusEmail = true;
      }
    },
    confirmInput() {
      let way = this.type == "email" ? "邮箱账号" : "手机号码";
      let value = "";
      if (this.setType == "setEmail") {
        value = this.ruleFormEmail.email;
      } else {
        value = this.ruleForm.value;
      }
      const h = this.$createElement;
      let flag = this.$confirm(
        h("p", null, [
          `请确认,您的${way}为 `,
          h("strong", { style: "color:#00d2ff" }, `${value}`),
        ]),
        `提醒:同一邮箱只能绑定一个账号`,
        {
          confirmButtonText: "确认",
          cancelButtonText: "取消",
          type: "warning",
          center: true,
        }
      )
        .then(() => {
          return true;
        })
        .catch(() => {
          return false;
        });
      return flag;
    },
    //获取验证码按钮单击事件
    getVCode(val) {
      this.openVerifyBox(true);
      let url = this.type == "account" ? "/api/login/code" : "/api/email/code";
      let typeVal = { url, userVal: val };
      this.getVerifyCode(typeVal);
    },
    //倒计时提醒
    countDownAlet(isLogOut) {
      if (isLogOut) this.loginOut();
      let sec = 3;
      let timer = setInterval(() => {
        --sec;
        this.countDownMsg = `${sec}秒后自动跳转到首页`;
      }, 1000);
      setTimeout(() => {
        //3秒后回收timer,跳转
        clearInterval(timer);
        this.$router.push("/home");
      }, 3000);
    },
    //修改我的邮箱
    changeMyEmail() {
      http
        .$axios({
          url: "/users/api/updateUserEmail",
          method: "POST", //get请求对应 params  post请求的对应 data
          headers: {
            token: true,
          },
          data: {
            email: this.ruleFormEmail.email,
          },
        })
        .then((res) => {
          if (!res.success) {
            this.$notify.error({
              title: "提示",
              message: res.data,
              duration: 0,
            });
          } else {
            this.activeStepEmail = 3;
            //跳转提示
            this.countDownAlet(false);
          }
        });
    },
    //修改我的密码
    changeMyPass() {
      http
        .$axios({
          url: "/users/api/updateUserPassword",
          method: "POST", //get请求对应 params  post请求的对应 data
          data: {
            password: this.ruleFormPass.password, //用户的新密码
            value: this.ruleForm.value, //邮箱或用户的账号的值
            type: this.type, //字段类型
          },
        })
        .then((res) => {
          if (!res.success) {
            this.$message.error("网络异常,请重试");
            return;
          }
          this.activeStep = 4;
          //跳转提示，以及退出用户账号
          this.countDownAlet(true);
        });
    },
  },
};
</script>
<style scoped lang="scss">
.FPV {
  width: 100%;
  background-color: #00284e;
}
.operator-panel {
  max-width: 2560px;
  width: 80%;
  min-height: 90vh;
  margin: 0 auto;
  margin-top: 100px;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  .step-bar-wrapper {
    margin-top: 20px;
  }
  .input-value {
    width: 35%;
    margin: 40px auto;
    ::v-deep .el-input__inner {
      color: black !important;
    }
  }
  .next-wrapper {
    width: 30%;
    height: 50px;
    margin: 0 auto;
    margin-top: 100px;
    ::v-deep .el-button {
      width: 100%;
      height: 100%;
      font-size: 22px;
    }
  }
  .verify-code {
    display: flex;
    flex-direction: column;
    justify-content: center;
    p {
      text-align: center;
      font-size: 20px;
      strong {
        color: #00d2ff;
      }
    }
    .verify-wrapper {
      display: flex;
      width: 270px;
      margin: 0 auto;
      margin-top: 30px;
    }
  }
  .modify-password {
    margin: 0 auto;
    width: 550px;
    margin-top: 40px;
    ::v-deep .el-input__inner {
      color: black !important;
      font-size: 18px;
    }
  }
  .modify-success {
    width: max-content;
    margin: 0 auto;
    margin-top: 40px;
    p {
      font-size: 20px;
      text-align: center;
    }
  }
}
.email-form {
  width: 35%;
  margin: 20px auto;
}
.get-email-code {
  display: flex;
  flex-direction: column;
  align-items: center;
  .verify-wrapper {
    display: flex;
  }
}
</style>
