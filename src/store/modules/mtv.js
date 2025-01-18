import {
  SET_CURRENT_MTV,
  SET_COMMENT_INFO,
  SET_COMMENT_ORDER,
} from "../mutations-types.js";
import http from "@/common/api/request.js";
import { Message } from "element-ui";
export default {
  state: {
    mtvInfo: {},
    commentInfo: [],
    orderType: "uc.comment_date",
    order: "desc",
  },
  getters: {},
  mutations: {
    //设置
    [SET_CURRENT_MTV](state, info) {
      state.mtvInfo = info;
    },
    //设置用户comment
    [SET_COMMENT_INFO](state, comment) {
      state.commentInfo = comment;
    },
    [SET_COMMENT_ORDER](state, val) {
      state.orderType = val.type;
      state.order = val.order;
    },
  },
  actions: {
    getMyComment({ state,rootState, commit }) {
      if(rootState.user.loginStatus){
        http
          .$axios({
            url: "/mtv/api/getMyComment",
            method: "GET", //get请求对应 params  post请求的对应 data
            headers: {
              token: true,
            },
            params: {
              orderType: state.orderType,
              order: state.order,
            },
          })
          .then((res) => {
          if (res.success) {
            commit("setCommentInfo", res.data);
          } else {
            Message.warning({
              message: res.data,
              duration: 1000,
              center: true,
              type: "warning",
            });
          }
        });
      }
    },
  },
};
