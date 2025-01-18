import Vue from "vue";
import VueRouter from "vue-router";
import store from "@/store";
Vue.use(VueRouter);

const originalPush = VueRouter.prototype.push;
const originalReplace = VueRouter.prototype.replace;
// push
VueRouter.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject)
    return originalPush.call(this, location, onResolve, onReject);
  return originalPush.call(this, location).catch((err) => err);
};
// replace
VueRouter.prototype.replace = function push(location, onResolve, onReject) {
  if (onResolve || onReject)
    return originalReplace.call(this, location, onResolve, onReject);
  return originalReplace.call(this, location).catch((err) => err);
};

const routes = [
  {
    path: "/home", //网页地址名
    name: "HomeView",
    meta: {
      keepAlive: true, //默认有页面缓存,不需要缓存则需要添加此参数
    },
    component: () => import("../views/Home/HomeView.vue"),
  },
  {
    path: "/",
    redirect: "/home", //重定向到home
  },
  {
    path: "/search", //网页地址名
    name: "SearchView",
    meta: {
      keepAlive: false, //默认有页面缓存,不需要缓存则需要添加此参数
    },
    component: () => import("../views/SearchView.vue"),
  },
  {
    path: "/userCenter/:section", //网页地址名
    name: "UserCenterView",
    meta: {
      keepAlive: false, //默认有页面缓存,不需要缓存则需要添加此参数
    },
    component: () => import("../views/UserCenterView.vue"),
  },
  {
    path: "/account/:type", //网页地址名
    name: "ForgetPassword",
    meta: {
      keepAlive: false, //默认有页面缓存,不需要缓存则需要添加此参数
    },
    component: () => import("../views/ForgetPasswordView.vue"),
  },
  {
    path: "/Rank/:tp", //网页地址名
    name: "RankView",
    meta: {
      keepAlive: false, //默认有页面缓存,不需要缓存则需要添加此参数
    },
    component: () => import("../views/Rank/RankView.vue"),
  },
  {
    path: "/explore", //网页地址名
    name: "SeekMTView",
    meta: {
      keepAlive: false, //默认有页面缓存,不需要缓存则需要添加此参数
    },
    component: () => import("../views/MTV/SeekMTView.vue"),
  },
  {
    path: "/movie/:mid", //网页地址名
    meta: {
      keepAlive: true, //默认有页面缓存,不需要缓存则需要添加此参数
    },
    children: [
      //子路由的配置,页面的子级
      {
        path: "/",
        name: "MovieView",
        component: () => import("../views/Film/FilmDetailView.vue"),
      },
      //子路由的配置,页面的子级
      {
        path: "/movie/comment/:mid/:cid",
        name: "CommentView",
        component: () => import("../views/Film/CommentView.vue"),
      },
    ],
    component: () => import("../views/Film/FilmView.vue"),
  },
  {
    path: "/404", //网页地址名
    name: "error",
    meta: {
      keepAlive: true, //默认有页面缓存,不需要缓存则需要添加此参数
    },
    component: () => import("../views/NotFoundView.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});
router.beforeEach((to, from, next) => {
  if (to.matched.length === 0) {
    next({ path: '/404' }); // 或者直接指定 404 页面的路径
  } else {
    next(); // 如果存在，则正常跳转
  }
  let nextRoute = ["UserCenterView"]; //需要导航拦截的页面名
  //是否是登录中
  let userInfo = JSON.parse(localStorage.getItem("mtsas"));
  //当前进入的页面，是不是需要验证哪些页面
  if (nextRoute.indexOf(to.name) >= 0) {
    if (!userInfo) {
      next({ path: from.path || "/" }); // 将路由重置为 from.path
      store.state.user.loginStatus = false;
      return;
    }
  }
  next();
});
export default router;
