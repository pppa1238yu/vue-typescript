import Vue from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';
import ElementUI from 'element-ui';
import Constants from './Constans';
axios.defaults.baseURL = Constants.remoteHost;
Vue.use(ElementUI);
new Vue({
el: '#app',
    router,
    render: h => h(App, {})
});
