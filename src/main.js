import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui';
// import ElFormMaker from '../packages/el-form-maker/index'
const ElFormMaker = require('../lib/el-form-maker.umd')['default']
console.log(ElFormMaker,'ElFormMaker')
// const ElFormMaker = require('../lib/el-validate-table.umd.js')['default']
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI)
Vue.config.productionTip = false
Vue.component('el-form-maker',ElFormMaker)

new Vue({
  render: h => h(App),
}).$mount('#app')
