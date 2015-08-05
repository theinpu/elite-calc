<?php
/**
 * User: anubis
 * Date: 08.02.2015
 * Time: 2:12
 */

namespace elite;

use bc\cmf\Command;

class Application extends \bc\cmf\Application {

    protected function initRoutes() {
        $this->addRouteGroup(new DefaultRouter($this));
        $this->addRouteGroup(new APIRouter($this));
    }

    /**
     * @param $pattern
     * @param Command $command
     *
     * @return \Slim\Route
     */
    public function addPutCommand($pattern, Command $command) {
        $command->setApp($this);

        return $this->getSlim()->put($pattern, $command->getCallback());
    }

    /**
     * @param $pattern
     * @param Command $command
     *
     * @return \Slim\Route
     */
    public function addDeleteCommand($pattern, Command $command) {
        $command->setApp($this);

        return $this->getSlim()->delete($pattern, $command->getCallback());
    }

}