<template>
    <simplebar data-simplebar-auto-hide="false">
          <!-- 移动到选择框 -->
    <el-dialog
      v-if="isShowFolder"
      title="请选择收藏夹"
      :visible.sync="isShowFolder"
      width="500px"
      @close="openFolderDialog(false)"
      :modal="false"
      :show-close="false"
      append-to-body
      center
    >
      <div class="folder-wrapper">
        <el-radio-group v-model="defaultFolder" size="medium">
          <el-radio
            v-for="(item, index) in otherFolders"
            :label="index + 1 + ''"
            :border="true"
            :key="index"
            >{{ item.name }}</el-radio
          >
        </el-radio-group>
      </div>
      <div class="folder-btn-wrapper">
        <el-button @click="openFolderDialog(false)">取消</el-button>
        <el-button type="primary" @click="moveCollections()">确定</el-button>
      </div>
    </el-dialog>
    <!-- 收藏内容部分 -->
    <li
      v-for="(item, index) in list"
      :key="index"
      class="collection-body"
      @click="goMovieDetail(item.id)"
    >
      <div class="left-wrapper">
        <div class="left-collect">
          <img :src="baseUrl + 'posters/' + item.posterImg" :alt="item.title" />
        </div>
      </div>
      <div class="middle-collect">
        <p :title="item.title">{{ item.title }}</p>
        <span>收藏于：{{ item.date }}</span>
      </div>
      <div class="right-collect" @click.stop="stopParentEvent">
        <el-menu default-active="0" @select="handleSelect" :collapse="true">
          <el-submenu :index="FN == undefined ? '搜索结果' : FN">
            <template slot="title">
              <i class="el-icon-s-tools"></i>
            </template>
            <el-menu-item :index="'1-' + item.id"
              >移动<i class="icon iconfont icon-yidongdao1"></i
            ></el-menu-item>
            <el-menu-item :index="'2-' + item.id"
              >取消收藏<i class="icon iconfont icon-xinsui"></i
            ></el-menu-item>
          </el-submenu>
        </el-menu>
      </div>
    </li>
    <el-empty v-show="list.length == 0" class="empty" description="暂无收藏">
    </el-empty>
  </simplebar>

</template>
<script>
import { mapState, mapMutations, mapActions } from "vuex";
import http from "@/common/api/request.js";
import simplebar from "simplebar-vue";
import "simplebar-vue/dist/simplebar.min.css";
export default {
  props: ["list", "FN", "result"],
  components:{
    simplebar
  },
  data() {
    return {
      otherFolders: [], //其他文件夹
      isShowFolder: false,
      defaultFolder: "1",
      currentFolderName: "默认收藏夹",
      mid: 0, //当前的mid
      operationType: null,
    };
  },
  created() {
    this.baseUrl = global.env.SERVER_BASE + "/public/images/";
  },
  computed: {
    ...mapState({
      userCollection: (state) => state.user.userCollectionFolder,
    }),
  },
  mounted() {},
  methods: {
    ...mapMutations(["alterUser"]),
    ...mapActions(["initCollectionFolder"]),
    //移动收藏夹内容框开关
    openFolderDialog(val, OT,folderName="默认收藏夹") {
      this.currentFolderName = folderName;
      this.operationType = OT;
      if (!val) {
        //关闭窗口后自动恢复到默认状态
        this.defaultFolder = "1";
      } else {
        //获取其他收藏夹
        this.otherFolders = this.userCollection.filter(
          (item) => item.name !== this.currentFolderName
        );
      }
      this.isShowFolder = val;
    },
    //对收藏品选择对应的操作
    handleSelect(key, keyPath) {
      let folderName = keyPath[0];
      this.currentFolderName = folderName;
      let arr = key.split("-");
      let mid = parseInt(arr[1]);
      this.mid = mid;
      let type = arr[0];
      if (type == 1) {
        //移动到
        this.openFolderDialog(true,false,folderName);
      } else {
        //提醒是否删除
        this.$confirm("此操作将永久删除此收藏, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            this.deleteCollection(folderName, mid);
          })
          .catch(() => {});
      }
    },
    //将收藏夹内容移动到其他收藏夹
    moveCollections() {
      //operationType为true是移动全部,false是移动单个
      let question = this.operationType
        ? "确定将此收藏夹中的收藏移动到目标收藏夹中?"
        : "确定将此收藏移动到目标收藏夹中?";
      //先询问是否将此收藏夹中的所有内容移动到其他文件夹
      this.$confirm(question, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true,
      })
        .then(() => {
          //当前选中的文件名
          let targetFolderName =
            this.otherFolders[parseInt(this.defaultFolder) - 1].name;
          let sourceFolderName = this.currentFolderName;
          if (this.operationType) {
            this.submitCollections(null, sourceFolderName, targetFolderName); //sourceFolderName,targetFolderName
          } else {
            this.submitCollections(
              this.mid,
              sourceFolderName,
              targetFolderName
            );
          }
        })
        .catch(() => {});
    },
    goMovieDetail(mid) {
      window.open(global.env.DOMAIN_NAME + "/movie/" + mid);
    },
    //向后端请求移动
    submitCollections(mid, SFN, TFN) {
      //mid为null为全部移动,否则单条移动,SFN:源文件夹名,TFN:目标文件夹名
      http
        .$axios({
          url: "/users/api/moveUserCollections",
          method: "POST", //get请求对应 params  post请求的对应 data
          headers: {
            token: true,
          },
          data: {
            source: SFN,
            target: TFN,
            mid,
          },
        })
        .then((res) => {
          if (res.success) {
            //修改state中的folder中状态,userCollection使其重新渲染
            // 直接查询新的数据库
            this.initCollectionFolder();
            this.openFolderDialog(false);
          } else {
            this.$message.error(res.data);
          }
        });
    },
    //阻止父元素时间冒泡
    stopParentEvent() {
      event.stopPropagation();
    },

    //删除收藏
    deleteCollection(name, mid) {
      //向后端发送请求
      http
        .$axios({
          url: "/mtv/api/updateMovieMark",
          method: "POST", //get请求对应 params  post请求的对应 data
          headers: {
            token: true,
          },
          data: {
            id: mid,
            state: 0,
            folderIndex: name,
          },
        })
        .then((res) => {
          if (res.success) {
            //修改state中的folder中状态,userCollection使其重新渲染
            this.alterUser([
              {
                name,
                id: mid,
                isNormal: true,
                status: 0,
              },
            ]);
          } else {
            this.$message.error(res.data);
          }
        });
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
.collection-body:hover {
  box-shadow: 0 2px 8px #00000087;
}
.collection-body {
  width: 420px;
  margin-left: 30px;
  margin-bottom: 10px;
  height: 206px;
  display: flex;
  justify-content: space-between;
  padding-right: 10px;
  align-items: center;
  border: 1px solid #eaeaea;
  transition: ease-out 0.3s;

  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  cursor: pointer;
  .left-wrapper {
    width: max-content;
    height: 100%;
    display: flex;
    align-items: center;
    background: url(data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAAeAAD/4QMvaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzEzOCA3OS4xNTk4MjQsIDIwMTYvMDkvMTQtMDE6MDk6MDEgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE3IChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpFNDNCQzI4N0I2QzcxMUVFQjQxNzhBODkxOUMyMTFFOCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpFNDNCQzI4OEI2QzcxMUVFQjQxNzhBODkxOUMyMTFFOCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkU0M0JDMjg1QjZDNzExRUVCNDE3OEE4OTE5QzIxMUU4IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkU0M0JDMjg2QjZDNzExRUVCNDE3OEE4OTE5QzIxMUU4Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+/+4ADkFkb2JlAGTAAAAAAf/bAIQAEAsLCwwLEAwMEBcPDQ8X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)
      no-repeat;
    .left-collect {
      width: 135px;
      min-height: 190px;
      max-height: 200px;
      display: flex;
      align-items: center;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
  .middle-collect {
    flex-basis: 260px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-left:5px;
    p {
      margin: 0;
      padding: 0 !important;
      width: 230px;
      text-align: left !important;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      font-size: 17px;
    }
    span {
      font-size: 15px;
    }
  }
  .right-collect {
    flex-basis: 40px;
    ::v-deep .el-menu--collapse {
      width: 40px;
      border: none;
      .el-submenu {
        .el-submenu__title {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0 !important;
        }
      }
    }
    i {
      font-size: 22px;
    }
  }
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
.el-empty {
  height: 100%;
  width: 300%;
}
::v-deep .simplebar-content{
  display:grid;
  grid-template-columns: repeat(2,1fr);
}
::v-deep .simplebar-content:before {
    content:none !important;
    display: table;
}
</style>
