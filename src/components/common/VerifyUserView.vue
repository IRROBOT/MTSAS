<template>
  <div class="verify">
    <el-dialog
      width="30%"
      ref="dialog"
      title="拖动进度条,将图片调整到正确角度"
      :visible.sync="innerVisible"
      :close-on-click-modal="false"
      :modal-append-to-body="false"
      @close="openVerifyBox(false)"
      :append-to-body="true"
    >
      <div class="verify-container">
        <div
          class="img-wrapper"
          :style="'transform: rotate(' + current_angle + 'deg)'"
        >
          <img :src="current_image" alt="验证图" />
        </div>
        <div class="drag-bar-wrapper">
          <el-slider
            v-model="offset"
            :show-tooltip="false"
            :max="maxAngle"
            @change="isCorrectAngle"
          ></el-slider>
        </div>
        <p><i class="el-icon-refresh" @click="resetVerify"></i></p>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { mapMutations, mapState } from "vuex";
import http from "@/common/api/request.js";
export default {
  data() {
    return {
      maxAngle: 360, //用户最大可拖动角度
      currentAngle: 0, //当前的总角度
      offset: 0, //用户拖动的偏移量
    };
  },
  computed: {
    ...mapState({
      requestUrl: (state) => state.user.requestUrl,
      inputValue: (state) => state.user.inputValue,
      functionType: (state) => state.user.functionType,
      initAngle: (state) => state.user.initAngle,
      randomVal: (state) => state.user.randomVal,
      dragAngle: (state) => state.user.dragAngle,
    }),
    innerVisible: {
      get() {
        return this.$store.state.user.innerVisible;
      },
      set() {},
    },
    //计算当前旋转角度
    current_angle() {
      let val = this.initAngle + this.offset;
      this.resetDragAngle(this.offset);
      return val;
    },
    //计算当前旋转图片
    current_image() {
      return (
        global.env.SERVER_BASE +
        "/public/images/verify/verify-00" +
        this.randomVal +
        ".jpg"
      );
    },
  },
  methods: {
    ...mapMutations([
      "openVerifyBox",
      "getRealCode",
      "getRandomValue",
      "randomAngle",
      "resetDragAngle",
      "countDown",
    ]),
    //刷新验证码
    resetVerify() {
      this.getRandomValue();
      this.randomAngle();
      this.resetDragAngle(0);
      this.offset = 0;
    },
    //判断是否是在误差范围内的角度
    isCorrectAngle() {
      let finalAngle = this.current_angle;
      let max = 355;
      let min = 5;
      if (
        (finalAngle <= min && finalAngle >= -5) ||
        (finalAngle >= max && finalAngle <= 365)
      ) {
        this.$message({
          message: "图形码验证成功",
          type: "success",
        });
        //关闭验证界面
        this.openVerifyBox(false);
        this.countDown();
        //发送验证码请求
        this.getLoginCode();
        let verifyBoxDom = document.querySelector(".v-modal");
        verifyBoxDom.style.display = "none";
      } else {
        this.$message.error("验证失败,请重新验证");
        this.resetVerify();
      }
    },
    //获取验证码
    getLoginCode() {
      //二次封装后的axios请求,详见common/api/request.js文件
      /*验证码请求 SDK*/
      http
        .$axios({
          url: this.requestUrl,
          method: "POST", //get请求对应 params  post请求的对应 data
          data: {
            userVal: this.inputValue.trim(),
            funcType: this.functionType,
          },
        })
        .then((res) => {
          if (!res.success) {
            this.$message.error(res.data);
            return;
          }
          this.getRealCode(res.data);
        });
    },
  },
};
</script>
<style scoped lang="scss">
::v-deep .el-dialog {
  text-align: center;
  .verify-container {
    width: 350px;
    height: 280px;
    margin: auto;
    .img-wrapper {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      margin: auto;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
    }
    .drag-bar-wrapper {
      margin-top: 50px;
      width: 100%;
      height: 50px;
    }
    p {
      i {
        font-size: 25px;
      }
    }
  }
}
</style>
