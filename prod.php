<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Web archive UI</title>
    <link type="text/css" rel="stylesheet" href="/dist/main.css" />
    <script src="/dist/main.js"></script>
    <meta content="width=device-width, initial-scale=1" name="viewport"/>
</head>
<body>
<?php if (!isset($_GET['data'])) { echo 'no data'; exit(); } ?>
<?php require_once('./dist/main.html'); ?>
<script>PywbVue.init({});</script>
<script>
    const url = `/sample-data/<?php echo preg_replace('@[^\w\-]@', '', $_GET['data']); ?>.json`;
    fetch(url, {mode: 'cors'}).then(r => r.json()).then(data => PywbVue.loadData(data));
</script>
</body>
</html>