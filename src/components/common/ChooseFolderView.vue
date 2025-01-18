<template>
  <div>
    <el-dialog
      title="请选择收藏夹"
      :visible.sync="isShowFolder"
      width="500px"
      @closed="openFolderDialog(false)"
      center
    >
      <div class="folder-wrapper">
        <el-radio-group v-model="defaultFolder" size="medium">
          <el-radio
            v-for="(item, index) in userCollection"
            :label="index + 1 + ''"
            :border="true"
            :key="index"
            >{{ item.name }}</el-radio
          >
        </el-radio-group>
      </div>
      <div class="folder-btn-wrapper">
        <el-button @click="openFolderDialog(false)">取消</el-button>

        <el-button type="primary" @click="collectTheMovie(true)"
          >确定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { mapMutations, mapState } from "vuex";

import http from "@/common/api/request.js";
export default {
  props: ["mid", "state", "index"],
  data() {
    return {
      isShowFolder: false,
      defaultFolder: "1",
      isConfirmFolder: false,
    };
  },
  computed: {
    ...mapState({
      loginStatus: (state) => state.user.loginStatus,
      userCollection: (state) => state.user.userCollectionFolder,
      mtvInfo: (state) => state.mtv.mtvInfo,
    }),
  },
  methods: {
    ...mapMutations(["alterUser", "setCurrentMtv", "setUserCollection"]),
    openFolderDialog(val) {
      this.isShowFolder = val;
      if (!val) {
        //关闭窗口后自动恢复到默认状态
        this.defaultFolder = "1";
      }
    },
    //收藏此电影
    collectTheMovie(type) {
      //type为true用户登录且需要修改,false未登录
      let state = this.mtvInfo.state;
      let mid = this.mtvInfo.mid;
      let artType = this.mtvInfo.artType;
      let posterImg = this.mtvInfo.posterImg;
      let title = this.mtvInfo.title;
      let index = this.mtvInfo.index;
      //找到需要进行操作的文件夹名称,此名称具有唯一性
      let name = "默认收藏夹";
      if (type)
        name = this.userCollection[parseInt(this.defaultFolder) - 1].name;
      http
        .$axios({
          url: "/mtv/api/updateMovieMark",
          method: "POST", //get请求对应 params  post请求的对应 data
          headers: {
            token: true,
          },
          data: {
            id: mid,
            state,
            folderIndex: name,
          },
        })
        .then((res) => {
          if (res.success) {
            /*父组件所需的操作,返回一个参数提醒父组件进行相应的操作*/
            this.returnUpdateResult({ success: true, index, state });
            //还需要更改收藏夹里面的状态
            this.alterUser([
              {
                name,
                id: mid,
                posterImg,
                artType,
                title,
                isNormal: true,
                status: state,
              },
            ]);
            let nextState = state == 1 ? 0 : 1;
            this.setCurrentMtv({
              state: nextState,
              mid: mid,
              index: null,
            });
          } else {
            this.returnUpdateResult({
              sucess: false,
              index: null,
              state: null,
            });
            this.$message.error(res.data);
          }
          this.openFolderDialog(false);
        });
    },
    //返回结果
    returnUpdateResult(result) {
      this.$emit("markResult", result);
    },
  },
};
</script>
<style scoped lang="scss">
.folder-wrapper {
  width: 100%;
  height: 230px;
  overflow-y: auto;
}
.folder-btn-wrapper {
  display: flex;
  justify-content: center;
}
::v-deep .el-radio-group {
  display: flex;
  flex-direction: column;
  label {
    margin-left: 0 !important;
    margin: 5px;
    padding: 0px;
    padding-left: 5px;
    display: flex;
    align-items: center;
    span {
      font-size: 18px;
    }
  }
}
</style>
