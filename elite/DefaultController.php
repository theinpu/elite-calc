<?php
/**
 * User: anubis
 * Date: 08.02.2015
 * Time: 2:28
 */

namespace elite;

use bc\cmf\Controller;
use bc\Mongo\Mongo;

class DefaultController extends Controller {

    public function startPage() {
        $commodities = require_once('commodities.php');
        $this->addData(array(
                           'commodities'   => $commodities,
                           'commodityJSON' => json_encode($commodities)
                       ));
        $this->template('main');
    }

    public function import() {
        //$data = json_decode(file_get_contents('htdocs/data/stations.json'), true);
        //$collection = Mongo::getCollection('stations');

        /*foreach($data as $item) {
            $station = array(
                'name'   => $item['station'],
                'system' => $item['system']
            );

            $collection->save($station);
        }*/
    }

}