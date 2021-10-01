<?php

header('connection: keep-alive');
for($i=0; $i<10; $i++) {
    echo 1;
    usleep(1000 * 500);
}
