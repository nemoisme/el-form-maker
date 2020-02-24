import Vue from 'vue'
import App from './app'
import vueRouer from "vue-router";
import ElFormMaker from '../package/el-form-maker.vue'
import demo1 from './demos/demo1.vue'
const routes = [
  {
    path: "/demos/demo1",
    component: demo1
  },
  // {
  //   path: "/demos/demo2",
  //   component: () => import("./demos/demo2.vue")
  // }
];
const router = new vueRouer({
  mode: "hash",
  routes
});

Vue.use(vueRouer)

Vue.component(ElFormMaker.name, ElFormMaker)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')