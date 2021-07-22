<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Web archive UI</title>
    <link type="text/css" rel="stylesheet" href="main.css" />
    <script src="vue.js"></script>
    <script>
        const Pywb = {
            vue: {app:{}, components:{} },
            init: () => {
                Object.keys(Pywb.vue.components).forEach(function(componentId) {
                    Vue.component(componentId, Pywb.vue.components[componentId]);
                });
                Pywb.vue.app = new Vue(Pywb.vue.app);
            }
        };
    </script>
</head>
<body>
<?php echo file_get_contents('./components/test.html'); ?>
<div id="app">
    <div class="banner">Banner</div>
    <div class="iframe">
        <iframe></iframe>
    </div>
    {{test}}
    {{testProp}}
    <test
            v-model="test"
            v-bind:test-prop="testProp"
    />
</div>
<script>
    Pywb.vue.app = {
        el: '#app',
        data: {
            test: {a:1, b:2},
            testProp: {a:3, b:4}
        }
    };
    Pywb.init();
</script>
</body>
</html>