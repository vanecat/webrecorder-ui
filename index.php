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
<?php echo file_get_contents('./components/summary.html'); ?>

<div id="app">
    <div class="short-nav">
        <div class="logo"><img src="/static/webarch-logo.png" /></div>
        <timeline-summary
                v-if="currentPeriod"
                :period="currentPeriod"
                :current-snapshot="currentSnapshot"
                @goto-period="gotoPeriod"
        ></timeline-summary>
        <div class="url-and-timeline">
            <div class="url">
                <select v-model="url">
                    <option>url</option>
                    <option v-for="sample in sampleData" :value="sample">{{sample}}</option>
                </select>
                <span @click="loadUrl">&#x21d2;</span>
            </div>
            <timeline
                    v-if="currentPeriod"
                    :period="currentPeriod"
                    @goto-period="gotoPeriod"
                    @goto-snapshot="gotoSnapshot"
            ></timeline>
        </div>
        <span class="full-view-toggle" @click="showFullView = !showFullView"><template v-if="!showFullView">&DownArrowBar;</template><template v-else>&UpArrowBar;</template></span>
    </div>

    <div class="full-view" v-if="showFullView && currentPeriod">
        Full View
        <timeline
                v-for="period in currentPeriod.children"
                :key="period.id"
                :period="period"
                @goto-period="gotoPeriod"
                @goto-snapshot="gotoSnapshot"
        ></timeline>
    </div>
    <div class="iframe" v-if="currentSnapshot">
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
            sampleData: ['bbc-com', 'uk-gov'],
            showFullView: false
        },
        mounted: function() {
            // DEVELOPMENT ONLY (TODO: remove when deploying app)
            // make initial sample data appear on "mounted" (faster for development)
            this.url = this.sampleData[0];
            this.loadUrl();
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
    #app {
        border-bottom: 1px solid lightcoral;
        height: 110px;
    }
    .iframe iframe {
        width: 100%;
        height: 80vh;
    }
    .logo {
        float: left;
        margin-right: 30px;
    }
    .short-nav {
        position: relative;
        display: flex;
        justify-content: flex-start;
    }
    .short-nav .logo {
        flex-shrink: initial;
    }

    .short-nav .url {
        text-align: left;
        margin: 0 25px;
    }
    .short-nav .url input, .short-nav .url select {
        width: 50%;
    }

    .full-view-toggle {
        position: absolute;
        bottom: 0;
        right: 50px;
        width: 80px;
        background-color: lightgray;
        border: 1px solid gray;
        border-bottom-right-radius: 5px;
        border-bottom-left-radius: 5px;
    }
    .full-view {
        position: absolute;
        top: 100px;
        left: 0;
        height: 80vh;
        width: 100%;
    }
</style>
</body>
</html>