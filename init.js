window.PywbVue = null;
function PywbVueInit() {
    let app = null;
    const components = {};
    let data = null;
    this.init = (config, data) => {
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
        data = new PywbData(data);
        app.data.snapshots = data.snapshots;
        app.data.currentPeriod = data.timeline;
        app = new Vue(app);
        app.$on('show-snapshot', this.showSnapshotTrigger.bind(this));
    };


    this.onShowSnapshotCallbacks = [];
    this.onShowSnapshot = function(callbackFn, context) {
        this.onShowSnapshotCallbacks.push(callbackFn.bind(context || this));
        return this; // for chain calls
    };
    this.showSnapshotTrigger = function(snapshot) {
        this.onShowSnapshotCallbacks.forEach(fn => fn(snapshot));
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