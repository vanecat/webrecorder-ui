window.PywbVue = null;
function PywbVueInit() {
    let app = null;
    const components = {};
    const config = {};

    this.init = () => {
        // components templates
        document.querySelectorAll('[data-template]').forEach((item) => {
            components[item.dataset.template].template = item.innerHTML;
            item.parentElement.removeChild(item);
        });

        // components
        Object.keys(components).forEach(function(componentId) {
            Vue.component(componentId, components[componentId]);
        });

        // main app
        app.data.config = config;
        app = new Vue(app);
    };

    this.loadData = (data) => {
        app.$emit('data-loaded', data);
    };

    this.updateConfig = (config_) => {
        Object.assign(config, config_);
    };

    this.addAppConfig = (appConfig) => {
        if (app) {
            // allow only once
            throw Error('cannot init pywb vue app twice');
        }
        app = appConfig;
    };

    this.addComponentConfig = (name, componentConfig) => {
        if (components[name]) {
            throw Error('cannot init pywb vue component '+name+'twice');
        }
        components[name] = componentConfig;
    };
}

/**
 * @type {PywbVueInit}
 */
PywbVue = new PywbVueInit();
Object.freeze(PywbVue);