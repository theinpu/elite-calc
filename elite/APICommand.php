<?php
/**
 * User: anubis
 * Date: 08.02.2015
 * Time: 16:31
 */

namespace elite;

use bc\cmf\Command;

class APICommand extends Command{

    public function __construct($method) {
        parent::__construct('\\elite\\APIController', $method);
    }

    public static function getStations() {
        return new self('getStations');
    }

    public static function updateStation() {
        return new self('updateStation');
    }

    public static function removeStation() {
        return new self('removeStation');
    }

    public static function saveCommodities() {
        return new self('saveCommodities');
    }

}