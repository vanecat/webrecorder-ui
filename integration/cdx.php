<?php

$url = str_replace('.', '-', preg_replace('@^https?://(.*)$@', '$1', $_GET['url']));
$data = json_decode(file_get_contents('../sample-data/'.$url.'.json'));
foreach($data as $item) {
    echo json_encode($item);
    echo "\n";
}