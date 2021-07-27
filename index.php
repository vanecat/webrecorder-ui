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
            init: (data) => {
                Pywb.data = Pywb.makeData(data);
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
            snapshots: [],
            currentPeriod: null,
            currentSnapshot: null,
            msgs: []
        },
        mounted: function() {
            try {
                this.snapshots = Pywb.data.linear;
                this.currentPeriod = Pywb.data.groupped;
            } catch(e) {
                this.msgs.push(e.message);
            }
        },
        methods: {
            gotoPeriod: function(newPeriod) {
                this.currentPeriod = newPeriod;
            },
            gotoSnapshot(snapshot) {
                this.currentSnapshot = snapshot;
            }
        }
    };
    fetch('/data-sample-medium.json').then(r => r.json()).then(data => Pywb.init(data));
</script>

<style>
    .iframe iframe {
        width: 100%;
        height: 100%;
    }
</style>
</body>
</html>