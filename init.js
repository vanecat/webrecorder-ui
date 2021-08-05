const Pywb = {
    data: {},
    vue: {app:{}, components:{} },
    init: () => {
        Object.keys(Pywb.vue.components).forEach(function(componentId) {
            Vue.component(componentId, Pywb.vue.components[componentId]);
        });
        Pywb.vue.app = new Vue(Pywb.vue.app);
    }
};