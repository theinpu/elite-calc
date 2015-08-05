<?php
/**
 * User: anubis
 * Date: 08.02.2015
 * Time: 2:17
 */

namespace elite;


use bc\cmf\Command;

class DefaultCommand extends Command {

    public function __construct($method) {
        parent::__construct('\elite\DefaultController', $method);
    }

    public static function startPage() {
        return new self('startPage');
    }

    public static function import() {
        return new self('import');
    }

}