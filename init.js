const Pywb = {
    data: {},
    vue: {app:{}, components:{}},
    init: (config) => {
        // components templates
        document.querySelectorAll('[data-template]').forEach((item) => {
            Pywb.vue.components[item.dataset.template].template = item.innerHTML;
            item.parentElement.removeChild(item);
        });

        // components
        Object.keys(Pywb.vue.components).forEach(function(componentId) {
            Vue.component(componentId, Pywb.vue.components[componentId]);
        });

        // main app
        Pywb.vue.app = new Vue(Pywb.vue.app);
    }
};