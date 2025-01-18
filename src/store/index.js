import Vue from "vue";
import Vuex from "vuex";
import user from "./modules/user.js";
import web from "./modules/web.js";
import mtv from "./modules/mtv.js";
Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    user,
    web,
    mtv,
  },
});
