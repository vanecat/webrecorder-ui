<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Web archive UI</title>
    <link type="text/css" rel="stylesheet" href="main.css" />
    <script src="vue.js"></script>
    <script src="init.js"></script>
    <script src="model.js"></script>
    <meta content="width=device-width, initial-scale=1" name="viewport"/>
</head>
<body>
<?php if (!isset($_GET['data'])) { echo 'no data'; exit(); } ?>
<?php require_once('./components/timeline.html'); ?>
<?php require_once('./components/summary.html'); ?>
<?php require_once('./components/calendar-year.html'); ?>
<?php require_once('./components/calendar-month.html'); ?>
<?php require_once('./app.html'); ?>
<script>
    const url = `/sample-data/<?php echo preg_replace('@[^\w\-]@', '', $_GET['data']); ?>.json`;
    fetch(url, {mode: 'cors'}).then(r => r.json()).then(data => PywbVue.init({}, data));
</script>
</body>
</html>