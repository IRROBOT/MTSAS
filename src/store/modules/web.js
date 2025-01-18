import { WEB_INFO, WEB_INIT } from "../mutations-types.js";

export default {
  state: {
    baseInfo: {},
    isNull: true,
  },
  getters: {},
  mutations: {
    //设置
    [WEB_INFO](state, web) {
      //持久化存储==>本地存储
      localStorage.setItem("mtb", JSON.stringify(web));
      state.baseInfo = web;
      state.isNull = false;
    },
    //读取用户本地存储的信息
    [WEB_INIT](state) {
      let rawData = JSON.parse(localStorage.getItem("mtb"));
      if (rawData) {
        state.baseInfo = rawData;
        state.isNull = false;
      } else {
        state.isNull = true;
      }
    },
  },
  actions: {},
};
