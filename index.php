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
<?php echo file_get_contents('./components/timeline.html'); ?>
<?php echo file_get_contents('./components/summary.html'); ?>
<?php echo file_get_contents('./components/calendar-year.html'); ?>
<?php echo file_get_contents('./components/calendar-month.html'); ?>
<?php echo file_get_contents('./app.html'); ?>
<script>Pywb.init();</script>
</body>
</html>