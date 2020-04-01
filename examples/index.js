import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui';

import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI)

import ElFormMaker from './../lib/el-form-maker'

Vue.component('el-form-maker',ElFormMaker)
new Vue({
    el:'#app',
    render:(h)=>h(App)
})