<template>
  <div class="comment-contents">
    <p class="part-title">影评列表</p>
    <div class="tool-bar">
      <div class="order-list">
        <span>排序:</span>
        <div class="tool">
          <span
            :class="orderType == 'uc.comment_date' ? 'time activeText' : 'time'"
          >
            发表时间
            <i
              :class="
                orderType == 'uc.comment_date' && order == 'asc'
                  ? 'el-icon-caret-top activeItem'
                  : 'el-icon-caret-top default-color'
              "
              @click="chooseOrder('uc.comment_date', 'asc')"
            ></i>
            <i
              :class="
                orderType == 'uc.comment_date' && order == 'desc'
                  ? 'el-icon-caret-bottom activeItem'
                  : 'el-icon-caret-bottom default-color'
              "
              @click="chooseOrder('uc.comment_date', 'desc')"
            ></i>
          </span>
          <span :class="orderType == 'amount' ? 'amount activeText' : 'amount'">
            回复数量
            <i
              :class="
                orderType == 'amount' && order == 'asc'
                  ? 'el-icon-caret-top activeItem'
                  : 'el-icon-caret-top default-color'
              "
              @click="chooseOrder('amount', 'asc')"
            ></i>
            <i
              :class="
                orderType == 'amount' && order == 'desc'
                  ? 'el-icon-caret-bottom activeItem'
                  : 'el-icon-caret-bottom default-color'
              "
              @click="chooseOrder('amount', 'desc')"
            ></i>
          </span>
        </div>
      </div>
    </div>
    <ul class="comment-wrapper" v-if="commentList.length > 0">
      <li
        v-for="(item, index) in commentList"
        :key="index"
        @click="checkMyComment(item.id, item.mid)"
      >
        <div class="left-title">
          <el-tooltip
            :content="item.comment_title"
            placement="top-start"
            effect="light"
          >
            <p>{{ item.comment_title }}</p>
          </el-tooltip>
          <el-tooltip
            :content="item.movie_title"
            placement="bottom-start"
            effect="light"
          >
            <p>《{{ item.movie_title }}》</p>
          </el-tooltip>
        </div>
        <div class="right-info">
          <span> 回复数量: {{ item.replyInfo }}</span>
          <span> 发表于: {{ item.comment_date }}</span>
        </div>
      </li>
    </ul>
    <el-empty v-else class="empty" description="暂无影评"> </el-empty>
  </div>
</template>
<script>
// import http from "@/common/api/request.js";
import { mapState, mapMutations, mapActions } from "vuex";
export default {
  data() {
    return {};
  },
  computed: {
    ...mapState({
      commentList: (state) => state.mtv.commentInfo,
      orderType: (state) => state.mtv.orderType,
      order: (state) => state.mtv.order,
    }),
  },
  created() {},
  mounted() {},
  methods: {
    ...mapMutations(["setCommentOrder"]),
    ...mapActions(["getMyComment"]),
    //查看评论详情
    checkMyComment(cid, mid) {
      //查看我的评论
      this.$router.push({
        name: "CommentView",
        params: { cid, mid },
      });
    },
    //进行排序
    chooseOrder(type, order) {
      if (type == this.orderType && order == this.order) return;
      this.setCommentOrder({ type, order });
      this.getMyComment();
    },
  },
};
</script>
<style scoped lang="scss">
/*评论部分*/
.comment-contents {
  
  width: 90%;
  margin: auto;
  height: 100%;
  background-color: white;
}
.part-title {
  text-align: center;
  margin: 0;
  padding-top: 30px;
  font-size: 22px;
}
.tool-bar {
  width: 100%;
  height: 65px;
  display: flex;
  justify-content: flex-end;
  margin: 10px 0;
  padding-right: 50px;
  font-size: 20px;
  .order-list {
    width: max-content;
    height: 100%;
    display: flex;
    align-items: center;
    line-height: 55px;
    .tool {
      display: flex;
      flex-direction: column;
      margin-left: 20px;
      justify-content: space-between;
      align-items: center;
      span {
        i {
          display: inline-block;
          font-size: 30px;
          cursor: pointer;
          margin-left: 10px;
          transition: all 0.3s;
        }
        i:hover {
          background-color: skyblue;
          border-radius: 50%;
          color: white;
        }
      }
    }
  }
}
.comment-wrapper {
  width: 80%;
  height: 900px;
  overflow: auto;
  margin: 0 auto;
  padding: 15px;
  li {
    width: 100%;
    height: 120px;
    background-color: rgb(223, 255, 255);
    border-radius: 5px;
    display: flex;
    padding-left: 15px;
    margin-top: 15px;
    justify-content: space-between;
    transition: ease-out 0.3s;
    border: 1px solid #e5e5e5;
    cursor: pointer;
    .left-title {
      display: flex;
      flex: 0.6;
      height: 100%;
      flex-direction: column;
      justify-content: space-around;
      p:first-child {
        margin: 0;
        max-width: 600px;
        min-width: 450px;
        font-size: 18px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      p:last-child {
        margin: 0;
        max-width: 600px;
        min-width: 450px;
        font-size: 18px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        color: rgba(128, 128, 128, 0.668);
      }
    }
    .right-info {
      flex: 0.3;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      span {
        font-size:16px;
      }
    }
  }
  li:hover {
    box-shadow: 2px 4px 8px rgba(0, 0, 0, 0.362);
  }
}
.activeItem {
  color: gold;
}
.activeText {
  color: skyblue;
}
.default-color {
  color: gray;
}
</style>
