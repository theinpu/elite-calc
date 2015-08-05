<?php
/**
 * User: anubis
 * Date: 08.02.2015
 * Time: 2:03
 */

chdir(__DIR__.'/../');

require_once 'vendor/autoload.php';

$app = new \elite\Application();
$app->run();