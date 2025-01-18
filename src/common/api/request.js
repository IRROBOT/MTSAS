import axios from "axios";
import store from "@/store";
import router from "@/router";
import { Loading } from "element-ui";
import { Message } from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
export default {
  //构造一个common对象，内置所需的参数
  common: {
    method: "GET",
    data: {},
    params: {},
    headers: {load:true},
    timeout: 10000,
  },
  $axios(options = {}) {
    //默认使用前端请求的数据,若没有则使用commen对象中的数据
    options.method = options.method || this.common.method;
    options.data = options.data || this.common.data;
    options.params = options.params || this.common.params;
    options.headers = options.headers || this.common.headers;
    options.timeout = options.timeout || this.common.timeout;
    //是否是登录状态
    if (options.headers.token) {
      options.headers.token = store.state.user.token;
      if (!options.headers.token || localStorage.getItem("mtsas") == null) {
        Message.warning({
          message: "请先登录",
          duration: 1500,
          center: true,
          type: "warning",
          iconClass: "el-icon-user-solid",
        });
        store.state.user.loginStatus = false;
        router.push("/home");
        return new Promise((resolve, reject) => {
          if (reject) return reject;
          return resolve;
        });
      }
    } else {
      options.headers.token = "";
    }
    let loading = null;
    if(options.headers.load){
      //请求前 ==> 显示加载中...
    loading = Loading.service({
      lock: true,
      text: "加载中...",
      spinner: "el-icon-loading",
      background: "rgba(0, 0, 0, 0.7)",
    });
    }
    
    return axios(options)
      .then((v) => {
        let data = v.data.data;
        return new Promise((res, rej) => {
          if (!v || v.data.status === 500) {
            if(options.headers.load)
            loading.close();
            rej([]);
          }
          setTimeout(() => {
            if(options.headers.load)
            loading.close();
          }, 300);
          res(data);
        });
      })
      .catch((err) => {
        Message.error({
          message: "请求超时，请检查网络",
          duration: 1500,
          center: true,
        });
        if(options.headers.load)
        loading.close();
        throw err;
      });
  },
};
