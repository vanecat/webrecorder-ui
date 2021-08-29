<?php

$data = json_decode(file_get_contents('../sample-data/bbc-com.json'));
foreach($data as $item) {
    echo json_encode($item);
    echo "\n";
}