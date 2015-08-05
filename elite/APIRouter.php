<?php
/**
 * User: anubis
 * Date: 08.02.2015
 * Time: 16:32
 */

namespace elite;

use bc\cmf\Command;
use bc\cmf\RouteGroup;
use elite\Application;

/**
 * Class APIRouter
 * @package elite
 */
class APIRouter extends RouteGroup {

    protected function getBaseUrl() {
        return '/api';
    }

    public function initRoutes() {
        $this->addRoute('/station/', APICommand::getStations(), array('get'));
        $this->addRoute('/station(/:id)', APICommand::updateStation(), array('post', 'put'));
        $this->addRoute('/station/:id', APICommand::removeStation(), array('delete'));

        $this->addRoute('/commodity/:id', APICommand::saveCommodities(), array('post', 'put'));
    }

    protected function addRoute($pattern, Command $command, $methods) {
        /** @var Application $app */
        $app = $this->GetApp();
        if(in_array('put', $methods)) {
            $app->addPutCommand($this->getBaseUrl().$pattern, $command);
        }
        if(in_array('delete', $methods)) {
            $app->addDeleteCommand($this->getBaseUrl().$pattern, $command);
        }
        parent::addRoute($pattern, $command, $methods);
    }

}