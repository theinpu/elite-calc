<?php
/**
 * User: anubis
 * Date: 08.02.2015
 * Time: 2:26
 */

namespace elite;

use bc\cmf\RouteGroup;

class DefaultRouter extends RouteGroup {

    protected function getBaseUrl() {
        return '';
    }

    public function initRoutes() {
        $this->addRoute('/', DefaultCommand::startPage(), array('get'));
        $this->addRoute('/import', DefaultCommand::import(), array('get'));
    }
}