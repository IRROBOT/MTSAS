<template>
  <div class="notify-contents">
    <el-dialog
      title="提示"
      :visible.sync="showNotice"
      width="30%"
      center>
      <span>{{ noticeContent }}</span>
    </el-dialog>
    <el-tabs type="border-card" v-model="activeName" @tab-click="switchTab">
      <el-tab-pane name="0">
        <span slot="label"
          ><i class="icon iconfont icon-huifu1"></i>影评回复</span
        >
        <div class="comment-reply-wrapper" v-if="replyList.length>0">
          <!-- 放置用户回复列表 --simplebar插件-->
          <simplebar class="user-reply-list" data-simplebar-auto-hide="false">
            <li
              v-for="(item, index) in replyList"
              :key="index"
              @click="checkMyReply(item.cid, item.mid)"
            >
              <div class="top-reply">
                <span>{{ item.nickName }}</span>
                <span>回复我的</span>
                <span>{{ item.title }}</span>
              </div>
              <div class="bottom-reply">
                <span>{{ item.reply }}</span>
                <span>回复于: {{ item.date }}</span>
              </div>
            </li>
          </simplebar>
        </div>
        <el-empty v-else description="暂无回复"></el-empty>
      </el-tab-pane>
      <el-tab-pane name="1">
        <span slot="label"
          ><i class="icon iconfont icon-xitongtongzhi"></i>系统通知</span
        >
        <div class="system-notify">
            <simplebar class="notice-wrapper" v-if="noticeList.length > 0"  data-simplebar-auto-hide="false">
                <li v-for="(item,index) in noticeList" :key="index" @mouseenter="showButtons = true" @mouseleave="showButtons = false">
                  <div class="notice-left">
                    <span class="title">{{item.title}}</span>
                    <span class="time">{{item.send_time}}</span>
                  </div>
                  <div  class="notice-right">
                    
                    <transition name="el-fade-in-linear">
                      <span v-if="showButtons">
                        <span class="button-i" @click="checkNotice(item.id)"><i class="el-icon-view" ></i>查看</span>
                        <span class="button-i" @click="deleteNotice(item.id)"><i class="el-icon-circle-close" ></i>移除</span>
                      </span>
                    </transition>
                  </div>
                </li>
            </simplebar>
            <el-empty v-else description="暂无通知"></el-empty>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import simplebar from "simplebar-vue";
import "simplebar-vue/dist/simplebar.min.css";
import http from "@/common/api/request.js";
import { mapState } from "vuex";
export default {
  components: { simplebar },
  data() {
    return {
      activeName: "0",
      showButtons: false,
      showNotice: false,
      noticeList:[],
      noticeContent:''
    };
  },
  created() {
    if (this.$route.query.tar) {
      this.activeName = this.$route.query.tar;
    }
    this.getNoticeList();
  },
  computed: {
    ...mapState({
      replyList: (state) => state.user.replyMsgList,
    }),
  },
  methods: {
    // 跳转至评论详情页
    checkMyReply(cid, mid) {
      this.$router.push({
        name: "CommentView",
        params: { cid, mid },
        query: {
          sign: "t1",
        },
      });
    },
    // 切换tab
    switchTab(tab) {
      this.$router.replace({
        name: "UserCenterView",
        params: { section: "notice" },
        query: {
          tar: tab.index,
        },
      });
    },
    //获取通知列表
    getNoticeList(){
      http.$axios({
        url:'/users/api/getNoticeList',
        method:'GET',
        headers: {
            token:true,
        }
      }).then(res=>{
        if(res.success){
          this.noticeList = res.data;
          console.log(res.data);
        }
      });
    },
    checkNotice(id){
      this.showNotice = true;
      let target = this.noticeList.find(item=>item.id === id);
      this.noticeContent = target.content;
      // 标记已读,后端发送请求
      http
        .$axios({
          url: "/users/api/updateReadStatus",
          method: "POST", //get请求对应 params  post请求的对应 data
          headers: {
            token: true,
            load:false
          },
          data: {
            id,
          }
        });
    },
    deleteNotice(id){
      this.$confirm('删除该条通知后将无法恢复，是否继续?', '删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
               
         http.$axios({
          url: "/users/api/deleteNotice",
          method: "POST", //get请求对应 params  post请求的对应 data
          headers: {
            token: true,
            load:false
          },
          data: {
            id,
          }
        }).then(res=>{
          if(res.success){
            // this.getNoticeList();
            this.noticeList = this.noticeList.filter(item=>item.id !== id);
          }else{
            this.$message.error(res.data);
          }
        })
        }).catch(() => {
                  
      });

    }
  },
};
</script>
<style scoped lang="scss">
.system-notify{
  height: 100%;
  .notice-wrapper{
    width:calc(100% - 100px);
    margin:0 auto;
    height: 900px;
    li{
      height:100px;
      width:100%;
      background-color: rgb(223, 255, 255);
      border-radius: 5px;
      margin-bottom: 10px;
      box-shadow: 0 2px 4px 0 rgba(121,146,185,0.54);
      display: flex;
      justify-content: space-between;
      padding:0 20px;
      align-items: center;
      .notice-left{
        flex:0.2;
        height:100%;
        display: flex;
        justify-content:space-evenly;
        flex-direction: column;
        .title{
            font-size: 18px;
            font-weight: bold;
        }
        .time{
          font-size:16px;
          color:#a1a1a1;
        }
      }
      .notice-right{
        flex:0.8;
        display: flex;
        justify-content: flex-end;
        
      }
      
    }
  }
}
.button-i{
  display: inline-block;
  margin-right:10px;
}
.button-i:hover{
   text-decoration: underline;
   color:rgb(94, 94, 94);
   cursor: pointer;
 }
.notify-contents {
  border-radius: 10px;
  width: 90%;
  margin: auto;
  height: 100%;
  background-color: white;
}
.comment-reply-wrapper {
  width: 100%;
  .user-reply-list {
    width:calc(100% - 100px);
    height: 900px;
    margin: 0 auto;
    padding: 20px;
    li {
      width: 100%;
      padding: 15px 10px;
      display: flex;
      background-color: rgb(223, 255, 255);
      flex-direction: column;
      justify-content: space-between;
      border-bottom: 1px solid rgb(236, 236, 236);
      box-shadow:0 2px 4px 0 rgba(121,146,185,0.54);
      cursor: pointer;
      .top-reply {
        display: flex;
        font-size: 18px;
        span:first-child {
          margin-right: 15px;
          font-weight: bolder;
        }
        span:last-child {
          color: gray;
          margin-left: 15px;
        }
      }
      .bottom-reply {
        display: flex;
        flex-direction: column;
        span:first-child {
          font-size: 18px;
          display: inline-block;
          margin: 20px;
        }
        span:last-child {
          color: gray;
          font-size: 16px;
        }
      }
    }
  }
}
::v-deep .simplebar-vertical {
  .simplebar-scrollbar::before {
    background: rgba(0, 0, 0, 0.21) !important;
  }
}
::v-deep .el-tabs__content{
  height:100vh;
}
</style>
