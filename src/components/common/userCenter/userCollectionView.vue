<template>
  <div class="collection-contents">
    <p>我的收藏夹</p>
    <div class="collection-header">
      <div class="create-new-folder">
        <el-popover
          placement="right-end"
          width="500"
          v-model="newFolderPop"
          @after-leave="clearBox"
        >
          <div class="pop-wrapper">
            <el-form
              :model="ruleFormFolder"
              :rules="rulesFolder"
              ref="ruleFormFolder"
              class="popover-form"
              label-width="100px"
            >
              <el-form-item label="收藏夹名称" prop="name">
                <el-input
                  type="text"
                  placeholder="请输入收藏夹名称，名称不可重复且不超过20字"
                  v-model="ruleFormFolder.name"
                  maxlength="20"
                  show-word-limit
                >
                </el-input>
              </el-form-item>
              <el-form-item label="简介" prop="brief">
                <el-input
                  type="textarea"
                  placeholder="请输入简介，可选填，不超过50字"
                  v-model="ruleFormFolder.brief"
                  maxlength="50"
                  clearable
                  resize="none"
                  :rows="4"
                  :autosize="{ minRows: 4, maxRows: 5 }"
                  show-word-limit
                >
                </el-input>
              </el-form-item>
            </el-form>
            <div class="pop-btn-wrapper">
              <el-button size="medium" type="text" @click="createFolder(false)"
                >取消</el-button
              >
              <div class="holder"></div>
              <el-button
                type="primary"
                size="medium"
                @click="createFolder(true)"
                >确定</el-button
              >
            </div>
          </div>
          <el-button
            slot="reference"
            icon="icon iconfont icon-xinjianwenjianjia"
            >新建收藏夹</el-button
          >
        </el-popover>
      </div>
      <div class="search-bar">
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
    <hr />
    <!-- 收藏夹内容部分 -->
    <div class="folders-wrapper" v-if="!isShowSearchResult">
      <el-collapse
        v-model="activeName"
        v-for="(item, index) in userCollection"
        :key="index"
        accordion
      >
        <span class="folder-collects">{{ item.mtvInfo.length }}/100</span>
        <el-collapse-item :name="index + 1">
          <template slot="title">
            {{ item.name }}
            <el-menu
              default-active="0"
              :collapse="true"
              @select="handleSelect"
              v-show="item.mtvInfo.length > 0 || item.name != '默认收藏夹'"
            >
              <el-submenu :index="item.name">
                <template slot="title">
                  <i
                    class="icon iconfont icon-gengduo"
                    v-show="
                      item.mtvInfo.length > 0 || item.name != '默认收藏夹'
                    "
                  ></i>
                </template>
                <el-menu-item index="1" v-show="item.mtvInfo.length > 1"
                  >移动<i class="icon iconfont icon-yidongdao1"></i
                ></el-menu-item>
                <el-menu-item index="2" v-show="item.name != '默认收藏夹'"
                  >编辑<i class="icon iconfont icon-zhongmingming"></i
                ></el-menu-item>
                <el-menu-item index="3" v-show="item.name != '默认收藏夹'"
                  >删除<i class="icon iconfont icon-shanchuwenjianjia"></i
                ></el-menu-item>
              </el-submenu>
            </el-menu>
          </template>
          <p class="folder-description">
            <em>{{ item.des }}</em>
          </p>
          <!-- 收藏的内容 -->
          <ul>
            <UserCollectionBlock
              :list="item.mtvInfo"
              :FN="item.name"
              class="collection-wrapper"
              ref="myCollections"
            ></UserCollectionBlock>
          </ul>
        </el-collapse-item>
      </el-collapse>
    </div>
    <!-- 搜索结果的部分 -->
    <div class="search-result" v-else>
      <el-page-header @back="openResultBox(false)" content="搜索结果页面">
      </el-page-header>
      <p class="tip">
        搜索关于“<span>{{ staticInput.trim() }}</span
        >”的结果
      </p>
      <ul>
        <UserCollectionBlock
          class="collection-wrapper"
          :list="result_set"
        ></UserCollectionBlock>
      </ul>
    </div>
    <el-dialog
      title="提示"
      :visible.sync="isShowRenameBox"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :destroy-on-close="true"
      @closed="clearBox"
      center
    >
      <el-form
        :model="ruleFormFolder"
        :rules="rulesFolder"
        ref="ruleFormFolder"
        class="popover-form"
        label-width="100px"
      >
        <el-form-item label="收藏夹名称" prop="name">
          <el-input
            type="text"
            placeholder="请输入收藏夹名称，名称不可重复且不超过20字"
            v-model="ruleFormFolder.name"
            maxlength="20"
            show-word-limit
          >
          </el-input>
        </el-form-item>
        <el-form-item label="简介" prop="brief">
          <el-input
            type="textarea"
            placeholder="请输入简介，可选填，不超过50字"
            v-model="ruleFormFolder.brief"
            maxlength="50"
            clearable
            resize="none"
            :rows="4"
            :autosize="{ minRows: 4, maxRows: 5 }"
            show-word-limit
          >
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="openRenameBox(false)">取 消</el-button>
        <el-button type="primary" @click="editFolder">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import UserCollectionBlock from "./userCollectionView_collect.vue";
import http from "@/common/api/request.js";
import { mapState, mapMutations } from "vuex";

export default {
  components: {
    UserCollectionBlock,
  },
  data() {
    return {
      activeName: 1,
      newFolderPop: false,
      search_input: "",
      staticInput: "",
      isShowSearchResult: false, //默认不显示搜索结果
      isShowRenameBox: false, //默认不显示重命名框
      ruleFormFolder: {
        name: "",
        brief: "",
      },
      rulesFolder: {
        name: [
          { required: true, message: "请输入收藏夹名称", trigger: "blur" },
          { required: true, message: "请输入收藏夹名称", trigger: "change" },
        ],
      },
      collectionList: [],
      oldName: "",
      oldBrief: "",
    };
  },
  computed: {
    ...mapState({
      loginStatus: (state) => state.user.loginStatus,
      userCollection: (state) => state.user.userCollectionFolder,
    }),
  },
  created() {},
  mounted() {},
  methods: {
    ...mapMutations(["alterFolder"]),
    //新建收藏夹
    createFolder(val) {
      this.newFolderPop = val;
      if (!val) return;
      //先进行数据校验
      this.$refs["ruleFormFolder"].validate((valid) => {
        if (valid) {
          //获取到收藏夹名称和简介
          let newFolderName = this.ruleFormFolder.name;
          let newFolderBrief = this.ruleFormFolder.brief;
          //进行数据提交
          http
            .$axios({
              url: "/users/api/addNewFolder",
              method: "POST", //get请求对应 params  post请求的对应 data
              headers: {
                token: true,
              },
              data: {
                folderName: newFolderName,
                folderBrief: newFolderBrief,
              },
            })
            .then((res) => {
              if (res.success) {
                //修改state中的folder状态,userCollection使其重新渲染
                this.alterFolder([
                  {
                    name: newFolderName,
                    des: newFolderBrief,
                    set: [],
                  },
                  1,
                ]);
              } else {
                this.$message.error(res.data);
              }
            });
        } else {
          //校验不通过，提示用户
          return false;
        }
      });
    },
    handleSelect(key, keyPath) {
      let folderName = keyPath[0];
      if (key == 1) {
        let isExists = this.userCollection.some(
          (item) => item.name == folderName && item.mtvInfo.length > 0
        );
        if (!isExists) {
          this.$message.error("当前收藏夹为空，无法进行操作");
          return false;
        }
        //移动到
        //将当前选中的folderName传给子组件
        console.log(folderName);
        this.$refs.myCollections[0].openFolderDialog(true, true,folderName);
      } else if (key == 2) {
        //判断一下当前文件夹中是否有内容
        // let isExists = this.userCollection.some(
        //   (item) => item.name == folderName && item.mtvInfo.length > 0
        // );
        // if (!isExists) {
        //   this.$message.error("当前收藏夹为空，无法进行操作");
        //   return false;
        // }
        //重命名
        // 获取到收藏夹名称和简介
        this.ruleFormFolder.name = folderName;
        this.oldName = folderName;
        let tmp = this.userCollection.filter((item) => item.name == folderName);
        this.ruleFormFolder.brief = tmp[0].des;
        this.oldBrief = tmp[0].des;
        this.openRenameBox(true);
      } else {
        //提醒是否删除
        this.$confirm("此操作将永久删除该收藏夹及其取消此收藏夹中的所有内容, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            this.deleteFolder(folderName);
          })
          .catch(() => {});
      }
    },
    //删除收藏夹
    deleteFolder(name) {
      //1、获取到文件夹名称
      //2、发送请求
      http
        .$axios({
          url: "/users/api/deleteFolder",
          method: "POST", //get请求对应 params  post请求的对应 data
          headers: {
            token: true,
          },
          data: {
            folderName: name,
          },
        })
        .then((res) => {
          if (res.success) {
            //修改state中的folder状态,userCollection使其重新渲染
            this.alterFolder([
              {
                name,
              },
              2,
            ]);
          } else {
            this.$message.error(res.data);
          }
        });
    },
    //打开重命名框
    openRenameBox(val) {
      this.isShowRenameBox = val;
    },
    //清空多余内容
    clearBox() {
      this.ruleFormFolder.name = "";
      this.ruleFormFolder.brief = "";
    },
    //编辑收藏夹
    editFolder() {
      if (
        this.oldName == this.ruleFormFolder.name.trim() &&
        this.oldBrief == this.ruleFormFolder.brief.trim()
      ) {
        this.$message({
          message: "修改成功",
          type: "success",
        });
        return;
      }
      //先验证,发送请求
      this.$refs["ruleFormFolder"].validate((valid) => {
        if (valid) {
          http
            .$axios({
              url: "/users/api/editUserFolder",
              method: "POST", //get请求对应 params  post请求的对应 data
              headers: {
                token: true,
              },
              data: {
                oldName: this.oldName,
                folderName: this.ruleFormFolder.name,
                brief: this.ruleFormFolder.brief,
              },
            })
            .then((res) => {
              if (res.success) {
                //修改state中的folder状态,userCollection使其重新渲染
                this.alterFolder([
                  {
                    oldName: this.oldName,
                    name: this.ruleFormFolder.name,
                    brief: this.ruleFormFolder.brief,
                  },
                  3,
                ]);
                this.openRenameBox(false);
              } else {
                this.$message.error(res.data);
              }
            });
        } else {
          return false;
        }
      });
    },
    //搜索
    goSearch() {
      let input = this.search_input.trim();
      if (input.length == 0) {
        this.$message.error("请输入关键字");
        return false;
      }
      if (input.length > 12) {
        input = input.substring(0, 12);
      }
      //向后端请求
      http
        .$axios({
          url: "/users/api/searchCollections",
          method: "POST", //get请求对应 params  post请求的对应 data
          headers: {
            token: true,
          },
          data: {
            keywords: input,
          },
        })
        .then((res) => {
          if (res.success) {
            //打开结果框
            this.staticInput = input;
            this.result_set = res.data;
            this.openResultBox(true);
          } else {
            this.$message.error(res.data);
          }
        });
    },
    //搜索结果框控制
    openResultBox(val) {
      this.isShowSearchResult = val;
    },
  },
};
</script>
<style scoped lang="scss">
/*收藏部分专用*/
//创建按钮
.create-new-folder {
  ::v-deep .el-popover__reference-wrapper {
    .el-button {
      font-size: 18px;
      i {
        font-size: 22px;
      }
    }
  }
}
.collection-contents {
  width: 90%;
  margin: auto;
  height: 100%;
  background-color: white;
  p:first-child {
    font-size: 18px;
    text-align: center;
    padding-top: 30px;
    margin: 0;
  }
  .collection-header {
    display: flex;
    justify-content: space-between;
    padding: 0 50px;
    margin: 20px 0;
    align-items: center;
    .search-bar {
      display: flex;
    }
  }
  .folders-wrapper {
    width: 100%;
    margin: 10px 0;
    ::v-deep .el-collapse-item__header {
      position: relative;
      font-size: 20px;
      padding-left: 50px;
      .icon-gengduo {
        position: absolute;
        right: 0;
        font-size: 20px;
      }
      .el-icon-arrow-right {
        margin: 0;
      }
      .el-menu--collapse {
        width: 0 !important;
        position: absolute;
        right: 20px;
        border: none;
        .el-submenu {
          .el-submenu__title {
            padding: 0;
          }
        }
      }
    }
  }
}
.pop-wrapper {
  width: 100%;
  height: 100%;
  background-color: white;
  padding: 5px;
  .pop-btn-wrapper {
    text-align: center;
    justify-content: center;
    display: flex;
    .holder {
      width: 50px;
    }
  }
}
.collection-wrapper {
  height: 500px;
 
}
.folders-wrapper .el-collapse {
  position: relative;
  .folder-collects {
    position: absolute;
    display: inline-block;
    right: 35%;
    color: #0000006b;
    font-size: 25px;
    line-height: 50px;
    z-index: 100;
  }
}
.folder-description {
  margin-bottom: 30px !important;
  em {
    color: #000000b1;
  }
}
.folders-wrapper {
  width: 100%;
  margin: 10px 0;
}
.el-menu--vertical {
  .el-menu--popup {
    .el-menu-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
    }
  }
}
.tip {
  text-align: center;
  font-size: 18px;
  span {
    color: gold;
  }
}
</style>
