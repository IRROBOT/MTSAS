import {
  USER_LOGIN,
  INIT_USER,
  LOGIN_OUT,
  ALTER_USER,
  OPEN_VERIFY_BOX,
  GET_REAL_CODE,
  RANDOM_ANGLE,
  GET_RANDOM_VALUE,
  RESET_DRAG_ANGLE,
  COUNT_DOWN,
  SET_INPUT_VALUE,
  SET_USER_COLLECTION,
  ALTER_FOLDER,
  SET_UNREAD_MSG,
  SET_UNREAD_NUM,
} from "../mutations-types.js";
import CryptoJS from "../.././assets/js/crypt.js";
import common from "../.././assets/js/common.js";
import http from "@/common/api/request.js";
import { Message } from "element-ui";
export default {
  state: {
    /*用户*/
    loginStatus: false, //登录状态
    token: "", //token
    userInfo: {},
    /*图形验证码*/
    innerVisible: false, //验证框默认关闭
    requestUrl: "/api/login/code",
    inputValue: "",
    passport: "",
    initAngle: 0,
    randomVal: 0,
    dragAngle: 0, //用户拖动的角度
    btnMsg: "获取验证码",
    btnStatus: false, //获取验证码按钮默认状态
    functionType: 1, //默认是正常类型
    /*用户收藏*/
    userCollectionFolder: [],
    /*消息*/
    replyMsgList: [],
    sysNoticeList: [],
    total_unreadNum: 0,
    sys_unread:0,
    reply_unread:0,
  },
  getters: {},
  mutations: {
    //设置
    [USER_LOGIN](state, user) {
      //持久化存储==>本地存储
      let EUI = CryptoJS.encryptObject(user, "SL666");
      localStorage.setItem("mtsas", JSON.stringify(EUI));
      let DUI = CryptoJS.decryptObject(user, "SL666");
      state.token = DUI.token;
      state.userInfo = DUI;
      state.loginStatus = true;
    },
    //读取用户本地存储的信息
    [INIT_USER](state) {
      let rawData = JSON.parse(localStorage.getItem("mtsas"));
      if (rawData) {
        let DUI = CryptoJS.decryptObject(rawData, "SL666");
        state.loginStatus = true;
        state.token = DUI.token;
        state.userInfo = DUI;
      }
    },
    //更新用户某一条的信息
    [ALTER_USER](state, key) {
      //key为对象数组形如 [{key:"",value:""}],isNormal是否为普通键值对的修改
      state.loginStatus = true;
      let tmpArr = state.userCollectionFolder;
      if (key[0].isNormal) {
        //修改用户收藏夹 两种状态 1收藏 0取消收藏
        if (key[0].status == 1) {
          tmpArr.forEach((item) => {
            if (item.name == key[0].name) {
              let time = common.getInsertTime();
              item.mtvInfo.push({
                id: key[0].id,
                date: time,
                artType: key[0].artType,
                posterImg: key[0].posterImg,
                title: key[0].title,
              });
            }
          });
        } else {
          tmpArr.forEach((item) => {
            if (item.name == key[0].name) {
              item.mtvInfo = item.mtvInfo.filter((v) => v.id != key[0].id);
            }
          });
        }
      } else {
        key.forEach((v) => {
          state.userInfo[v.key] = v.value;
        });
      }
      //本地存储更新
      //持久化存储==>本地存储
      let EUI = CryptoJS.encryptObject(state.userInfo, "SL666");
      localStorage.setItem("mtsas", JSON.stringify(EUI));
      let DUI = CryptoJS.decryptObject(state.userInfo, "SL666");
      state.token = DUI.token;
      state.userInfo = DUI;
    },
    //退出登录，清除本地存储
    [LOGIN_OUT](state) {
      state.loginStatus = false;
      state.token = null;
      state.userInfo = {};
      state.total_unreadNum = 0;
      localStorage.removeItem("mtsas");
    },
    //打开验证框
    [OPEN_VERIFY_BOX](state, val) {
      state.innerVisible = val;
    },
    //拿到真实验证码
    [GET_REAL_CODE](state, val) {
      state.passport = val;
    },
    //设置放入的参数
    [SET_INPUT_VALUE](state, val) {
      state.inputValue = val.userVal;
      state.requestUrl = val.url;
      state.functionType = val.type;
    },
    //产生随机角度
    [RANDOM_ANGLE](state) {
      let random = Math.floor(Math.random() * (180 - 25 + 1)) + 25;
      let currentTime = new Date().getTime().toString().split("");
      let num = currentTime[currentTime.length - 1] % 2;
      let sign = num > 0 ? -1 : 1;
      state.initAngle = random * sign;
    },
    //获取随机值
    [GET_RANDOM_VALUE](state) {
      state.randomVal = Math.floor(Math.random() * 10) + 1;
    },
    //重置拖拽角度
    [RESET_DRAG_ANGLE](state, val) {
      state.dragAngle = val;
    },
    //
    //倒计时
    [COUNT_DOWN](state) {
      //按钮禁用，60秒倒计时
      state.btnStatus = true;
      let codeNum = 60;
      let timer = setInterval(() => {
        --codeNum;
        state.btnMsg = `重新发送 ${codeNum}`;
      }, 1000);
      setTimeout(() => {
        clearInterval(timer);
        codeNum = 60;
        state.btnStatus = false;
        state.btnMsg = "获取验证码";
      }, 60000);
    },
    //存放临时用户收藏
    [SET_USER_COLLECTION](state, val) {
      state.userCollectionFolder = val;
    },
    //修改收藏夹
    [ALTER_FOLDER](state, val) {
      if (val[1] == 1) {
        //1为添加 2为删除 3为修改
        state.userCollectionFolder.push({
          name: val[0].name,
          des: val[0].des,
          mtvInfo: [],
        });
      } else if (val[1] == 2) {
        let arr2 = state.userCollectionFolder;
        state.userCollectionFolder = arr2.filter((item) => {
          return item.name != val[0].name;
        });
      } else {
        let targetItem = state.userCollectionFolder.filter(
          (item) => item.name == val[0].oldName
        )[0];
        if (targetItem) {
          targetItem.name = val[0].name;
          targetItem.des = val[0].brief;
        }
      }
    },
    //设置未读消息
    [SET_UNREAD_MSG](state, val) {
      state.total_unreadNum = val.unread_num + val.sys_unread_num;
      state.replyMsgList = val.replyList;
      state.reply_unread = val.unread_num;
      state.sysNoticeList = val.sys_notice;
      state.sys_unread = val.sys_unread_num;
    },
    [SET_UNREAD_NUM](state) {
      state.unreadNum = 0;
    },
  },
  actions: {
    //获取验证码
    getVerifyCode({ commit }, typeVal) {
      commit("setInputValue", typeVal);
      commit("openVerifyBox", true);
      commit("getRandomValue");
      commit("randomAngle");
      commit("resetDragAngle", 0);
    },
    //初始化收藏夹
    initCollectionFolder({ state, commit }) {
      if (state.loginStatus) {
        http
          .$axios({
            url: "/mtv/api/getUserFolders",
            //get请求对应 params  post请求的对应 data
            headers: {
              token: true,
            },
          })
          .then((res) => {
            if (res.success) {
              commit("setUserCollection", res.data);
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
    //获取用户相关消息
    getUserMessage({ state, commit }) {
      if (state.loginStatus) {
        http
          .$axios({
            url: "/mtv/api/getUserMessage",
            //get请求对应 params  post请求的对应 data
            headers: {
              token: true,
            },
          })
          .then((res) => {
            if (res.success) {
              commit("setUnreadMsg", res.data);
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
