<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Web archive UI</title>
    <link type="text/css" rel="stylesheet" href="main.css" />
    <script src="vue.js"></script>
    <script>
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
    </script>
    <script src="model.js"></script>
    <script src="data.js"></script>
</head>
<body>
<?php echo file_get_contents('./components/timeline.html'); ?>

<div id="app">
    <select v-model="url">
        <option>url</option>
        <option v-for="sample in sampleData" :value="sample">{{sample}}</option></select> <input type="button" value="Go" @click="loadUrl"/>
    <timeline
            v-if="currentPeriod"
            :period="currentPeriod"
            @goto-period="gotoPeriod"
            @goto-snapshot="gotoSnapshot"
    ></timeline>
    <div class="iframe" v-if="currentSnapshot">
        {{currentSnapshot.getTimeDateFormatted()}}
        <iframe :src="currentSnapshot.load_url"></iframe>
    </div>
</div>
<script>
    Pywb.vue.app = {
        el: '#app',
        data: {
            url: '',
            snapshots: [],
            currentPeriod: null,
            currentSnapshot: null,
            msgs: [],
            sampleData: ['bbc-com', 'uk-gov']
        },
        mounted: function() {
        },
        methods: {
            loadUrl() {
                // https://www.webarchive.org.uk/wayback/en/archive/cdx?
                const url = `/sample-data/${this.url}.json?output=json&url=${encodeURIComponent(this.url)}`;
                fetch(url, {mode: 'cors'}).then(r => r.json()).then(data => this.initData(data));
            },
            initData(data) {
                try {
                    const {groupped, linear} = Pywb.makeData(data);
                    this.snapshots = linear;
                    this.currentPeriod = groupped;
                } catch(e) {
                    this.msgs.push(e.message);
                }
            },
            gotoPeriod: function(newPeriod) {
                this.currentPeriod = newPeriod;
            },
            gotoSnapshot(snapshot) {
                this.currentSnapshot = snapshot;
            }
        }
    };
    Pywb.init();
</script>

<style>
    .iframe iframe {
        width: 100%;
        height: 100%;
    }
</style>
</body>
</html>