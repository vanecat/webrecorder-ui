<?php
/**
 * @param $path
 *
 * @return false|string
 * @throws Exception
 */
function getResource($path) {
    if (file_exists($path)) {
        return file_get_contents($path);
    }
    $error = 'file does not exist '.$path;
    $error .= "\n";
    error_log($error);
    echo $error;
    exit(0);
}

$css = [];
$css[] = getResource('main.css');

$js = [];
$js[] = getResource('vue.min.js');
$js[] = getResource('init.js');
$js[] = getResource('model.js');

$vue = [];
$vue[] = getResource('./components/timeline.html');
$vue[] = getResource('./components/summary.html');
$vue[] = getResource('./components/calendar-year.html');
$vue[] = getResource('./components/calendar-month.html');
$vue[] = getResource('./app.html');


$html = [];
foreach($vue as $item) {
    $nl = '(:~:)';
    $withoutNewLines = preg_replace('@[\n\r]@', $nl, $item);

    preg_match('@<script>(.+?)</script>@', $withoutNewLines, $jsMatch);
    $js[] = str_replace($nl, "\n", $jsMatch[1]);

    preg_match('@<style>(.+?)</style>@', $withoutNewLines, $cssMatch);
    $css[] = str_replace($nl, "\n", $cssMatch[1]);

    preg_match('@<div data-(template|app)="[\w\-]+">.+</div>@', $withoutNewLines, $templateMatch);
    $html[] = str_replace($nl, "\n", $templateMatch[0]);
}


file_put_contents('./dist/main.js', implode("\n", $js));
file_put_contents('./dist/main.css', implode("\n", $css));
file_put_contents('./dist/main.html', implode("\n", $html));