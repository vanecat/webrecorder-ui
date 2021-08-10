<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Test App</title>
    <script src="../init.js"></script>
    <script src="../model.js"></script>
    <script src="../data.js"></script>
    <script src="../vue.js"></script>
</head>
<body>
<?php require_once '../components/calendar-month.html'; ?>
<div id="test-app">
    <div v-for="msg in msgs">{{msg}}</div>
    <calendar-month v-for="month in year.children" :key="month.id" :month="month"></calendar-month>
</div>
<script>
    Pywb.vue.app = {
        el: '#test-app',
        data: {
            msgs: [],
            year: {}
        },
        mounted() {
            this.addMsg('test app is loaded');
            this.loadData();
        },
        methods: {
            loadData() {
                fetch('/sample-data/uk-gov.json').then(r => r.json()).then(data => this.onLoadData(data));
            },
            onLoadData(data_) {
                try {
                    const data = Pywb.makeData(data_);
                    this.year = data.timeline.getChildById(2020);
                } catch(e) {
                    this.addMsg(e.message);
                }
            },
            addMsg(msg) {
                this.msgs.push(msg);
            }
        }
    };
    Pywb.init();
</script>
</body>
</html>