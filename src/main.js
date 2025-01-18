import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "../public/assets/css/common.css";
import ElementUI from "element-ui";
//字体图标文件
import "@/assets/css/iconfont.css";
import "normalize.css/normalize.css";
import "element-ui/lib/theme-chalk/index.css";
//import VueQuillEditor from "vue-quill-editor"; //引入富文本编译器

Vue.config.productionTip = false;
Vue.use(ElementUI);
//Vue.use(VueQuillEditor);
new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
