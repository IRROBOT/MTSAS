<template>
  <div class="section1">
    <el-form :model="ruleForm" ref="ruleForm" status-icon :rules="rules">
      <div class="info-contents">
        <el-divider><span>基本信息</span></el-divider>
        <div class="nick-name">
          <el-form-item label="昵称" prop="nickName">
            <el-input
              placeholder="请输入昵称,长度在3-15位之间"
              v-model="ruleForm.nickName"
            ></el-input>
          </el-form-item>
        </div>
        <el-form-item label="用户头像">
          <div class="avatar-group">
            <div class="user-avatar">
              <el-empty
                description="暂未上传头像"
                v-if="!loginStatus"
              ></el-empty>
              <img v-else :src="ruleForm.profile" alt="上传的图片" />
            </div>
            <el-button @click="isOpenUpAvatarBox(true)"
              >上传<i class="el-icon-upload el-icon--right"></i
            ></el-button>
          </div>
        </el-form-item>
        <!-- <el-form-item label="收货人姓名" style="width: 600px" prop="realName">
          <el-input
            placeholder="收货人姓名位数在1-25位之间"
            v-model="ruleForm.realName"
          ></el-input>
        </el-form-item> -->
        <el-form-item label="手机号" style="width: 600px" prop="phone">
          <el-input
            placeholder="请输入手机号"
            v-model="ruleForm.phone"
          ></el-input>
        </el-form-item>
        <!-- <el-form-item label="收货地址" style="width: 600px" prop="address">
          <el-cascader v-model="ruleForm.address" :options="options_address" />
        </el-form-item> -->
        <!-- <el-form-item label="详细地址" prop="detail" style="width: 600px">
          <el-input
            type="textarea"
            placeholder="收货地址字符在5到50位之间"
            v-model="ruleForm.detail"
          ></el-input>
        </el-form-item> -->
        <el-form-item>
          <el-button @click="updateData('ruleForm')">保存</el-button>
        </el-form-item>
        <el-divider><span>账户安全</span></el-divider>
        <div class="account-security">
          <div class="set-password">
            <span class="password-label">设置密码</span>
            <span class="password-status">{{
              userInfo.isSetPass == "false" ? "未设置" : "已设置"
            }}</span>
            <el-button type="text" @click="setAccount('setPassword')">{{
              userInfo.isSetPass == "false" ? "立即设置" : "修改密码"
            }}</el-button>
          </div>
          <div class="set-email">
            <span class="email-label">绑定邮箱</span>
            <span class="email-status">{{
              isSetEmail ? userInfo.email : "未绑定"
            }}</span>
            <el-button
              type="text"
              @click="setAccount(isSetEmail ? 'changeEmail' : 'setEmail')"
              >{{ isSetEmail ? "修改邮箱" : "立即绑定" }}</el-button
            >
          </div>
        </div>
      </div>
    </el-form>

    <el-dialog
      title="上传头像"
      :visible.sync="upAvatarVisible"
      width="50%"
      :close-on-click-modal="false"
      @close="isOpenUpAvatarBox(false)"
    >
      <div class="avatar-wrapper">
        <el-upload
          class="upload-demo"
          drag
          :before-upload="beforeUp"
          :show-file-list="false"
          :auto-upload="false"
          :on-change="changeUp"
          :action="'/users/api/uploadAvatar'"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">
            <p>将文件拖到此处，或<em>点击上传</em></p>
            <p>只能上传jpg/png文件，且不超过2MB</p>
          </div>
        </el-upload>

        <el-image
          style="width: 180px; height: 180px"
          :preview-src-list="upImgUrl"
          :src="upImgUrl[0]"
          fit="cover"
        >
          <div slot="error" class="img-holder">
            <i class="el-icon-picture-outline"></i>
          </div>
        </el-image>
      </div>
      <el-button @click="uploadAvatarImg" round>上传并保存</el-button>
    </el-dialog>
  </div>
</template>
<script>
import { pcaTextArr } from "element-china-area-data";
import { mapState, mapMutations } from "vuex";
import http from "@/common/api/request.js";
export default {
  data() {
    //自定义验证规则
    var checkNickName = (rule, value, callback) => {
      const regex = /[\s~`!@#$%^&*()\\-_=+[\]{}|;:'",<.>/?]/;
      const result = regex.test(value);
      if (result) {
        callback(new Error("昵称包含特殊字符"));
      } else {
        callback();
      }
    };

    return {
      isSetEmail: false,
      myEmail: "",
      dir: "left",
      options_address: pcaTextArr,
      upImgUrl: [],
      upAvatarVisible: false,
      fileObj: {},
      tmpImg: "",
      ruleForm: {
        //用户输入的数据
        nickName: "",
        profile: "",
        realName: "",
        phone: "",
        address: "",
        detail: "",
      },
      rules: {
        nickName: [
          {
            required: true,
            message: "请输入昵称",
            trigger: "blur",
          },
          {
            type: "string",
            validator: checkNickName,
            trigger: "change",
            message: "昵称包含特殊字符",
          },
          {
            type: "string",
            min: 3,
            max: 15,
            trigger: "blur",
            message: "昵称位数在3-15位",
          },
        ],
        realName: [
          {
            required: true,
            message: "请输入姓名",
            trigger: "blur",
          },
          {
            type: "string",
            pattern: /^([\u4e00-\u9fa5]+|[a-zA-Z]+)$/,
            trigger: "change",
            message: "包含非法字符,只支持中文和英文名称",
          },
          {
            type: "string",
            min: 1,
            max: 25,
            trigger: "blur",
            message: "收货人姓名位数在1-25位之间,只支持中文和英文名称",
          },
        ],
        phone: [
          {
            required: true,
            trigger: "blur",
            message: "请输入手机号",
          },
          {
            type: "string",
            pattern: /^1[3456789]\d{9}$/,
            message: "手机号码填写错误",
          },
        ],
        address: [
          {
            required: true,
            trigger: "blur",
            message: "请选择收货地址",
          },
        ],
        detail: [
          {
            type: "string",
            required: true,
            min: 5,
            max: 50,
            message: "收货地址字符在5到50位之间",
            trigger: "change",
          },
        ],
      },
      selectedAddress: [],
    };
  },
  computed: {
    ...mapState({
      loginStatus: (state) => state.user.loginStatus,
      userInfo: (state) => state.user.userInfo,
    }),
  },
  created() {
    this.reloadData();
   // this.getUserAddress();
  },
  mounted() {
    this.isSetEmail = this.userInfo.email != null && this.userInfo.email != "";
  },
  methods: {
    ...mapMutations(["alterUser"]),
    reloadData() {
      //服务器网址
      this.ruleForm.profile =
        global.env.SERVER_BASE +
        "/public/images/avatar/" +
        this.userInfo.profile;
      this.ruleForm.nickName = this.userInfo.nickName;
      this.ruleForm.phone = this.userInfo.contact;
    },
    //设置用户的账户信息
    setAccount(val) {
      this.$router.push("/account/" + val);
    },
    getUserAddress() {
      http
        .$axios({
          url: "/users/api/getUserAddress",
          //get请求对应 params  post请求的对应 data
          headers: {
            token: true,
          },
        })
        .then((res) => {
          if (res.success) {
            this.ruleForm.phone = res.data.phone;
            this.ruleForm.realName = res.data.realName;
            this.ruleForm.address = res.data.address.split(",");
            this.ruleForm.detail = res.data.detail;
          }
        });
    },
    updateData(formName) {
      //保存并更新数据
      this.$refs[formName].validate((valid) => {
        if (valid) {
          //全部通过校验，发送请求
          http
            .$axios({
              url: "/users/api/updateUserInfo",
              method: "POST", //get请求对应 params  post请求的对应 data
              headers: {
                token: true,
              },
              data: {
                userInfo: this.ruleForm,
              },
            })
            .then((res) => {
              if (!res.success) {
                this.$message.error("网络异常,请重试");
                return;
              }
              this.alterUser([
              {
                key: "nickName",
                value: this.ruleForm.nickName,
                isNormal: false,
                status: null,
              },
            ]);
            this.alterUser([
              {
                key: "contact",
                value: this.ruleForm.phone,
                isNormal: false,
                status: null,
              },
            ]);
              this.$message({
                message: "更新成功",
                type: "success",
              });
            });
        } else {
          this.$message.error("请正确填写必要信息");
          return false;
        }
      });
    },
    imgbase(file) {
      // new 一个Promise实例
      return new Promise((resolve) => {
        // 对文件对象的处理
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
          resolve(this.result);
        };
      });
    },
    async changeUp(file, fileList) {
      //预览头像
      this.upImgUrl.length = 0;
      fileList.length = 0;
      this.tmpImg = await this.imgbase(file.raw); //转换为base64格式以便预览
      this.upImgUrl.push(this.tmpImg);
      this.fileObj = file.raw;
    },
    isOpenUpAvatarBox(val) {
      this.upImgUrl.length = 0;
      this.upAvatarVisible = val;
    },
    uploadAvatarImg() {
      let ImgShow = this.tmpImg;
      //上传图片
      http
        .$axios({
          url: "/users/api/uploadAvatar",
          method: "POST", //get请求对应 params  post请求的对应 data
          headers: {
            token: true,
            "Content-Type": "multipart/form-data", //支付请求必带参数
          },
          data: {
            files: this.fileObj,
          },
        })
        .then((res) => {
          if (res.success) {
            this.$message({
              message: "上传成功",
              type: "success",
            });
            this.alterUser([
              {
                key: "profile",
                value: res.data,
                isNormal: false,
                status: null,
              },
            ]);
            this.ruleForm.profile = ImgShow;
            this.isOpenUpAvatarBox(false);
          }
        });
    },
    beforeUp(file) {
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isLt2M;
    },
    successUp(response, file, fileList) {
      console.log(response, file, fileList);
    },
    progressUp(event, file, fileList) {
      console.log(event, file, fileList);
    },
  },
};
</script>
<style scoped lang="scss">
.section1 {
  height: 100%;
  .el-form {
    height: 100%;
  }
}
::v-deep .el-dialog__body {
  display: flex;
  flex-direction: column;
  height: 300px;

  align-items: center;
  justify-content: space-around;
}
.info-contents {
 
  width: 90%;
  margin: auto;
  height: 100%;
  padding-top: 10px;
  background-color: white;
  ::v-deep .el-form-item__label {
    width: 100px !important;
  }
  ::v-deep .el-form-item__content {
    margin-left: 100px !important;
  }
  .avatar-group {
    display: flex;
    .user-avatar {
      width: 180px;
      height: 180px;
      border: 1px dashed gray;
      ::v-deep .el-empty {
        padding: 0;
        .el-empty__description {
          margin-top: -20px;
        }
      }
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      overflow: hidden;
    }
  }
  .nick-name {
    width: 45%;
    height: max-content;
    padding-top: 50px;
  }
  ::v-deep .el-cascader {
    width: 100%;
  }
  ::v-deep .el-textarea {
    .el-textarea__inner {
      max-height: 100px;
    }
  }
}
.avatar-wrapper {
  width: 80%;
  display: flex;
  ::v-deep .el-image {
    border: 1px dashed gray;
    border-radius: 50%;
    i {
      font-size: 180px;
    }
  }
}
.account-security {
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  div {
    font-size: 18px;
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
}
.set-password {
  .password-label {
    flex: 0.2;
  }
  .password-status {
    flex: 0.6;
  }
}
.set-email {
  .email-label {
    flex: 0.2;
  }
  .email-status {
    flex: 0.6;
  }
}
.el-divider span {
  font-size: 18px;
}
</style>
