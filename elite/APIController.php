<?php
/**
 * User: anubis
 * Date: 08.02.2015
 * Time: 16:31
 */

namespace elite;

use bc\cmf\Controller;
use bc\Mongo\Mongo;

class APIController extends Controller {

    /**
     * @var \MongoCollection
     */
    private $stations;
    /**
     * @var \MongoCollection
     */
    private $commodities;

    public function beforeCall() {
        parent::beforeCall();
        $this->stations = Mongo::getCollection('stations');
        $this->commodities = Mongo::getCollection('commodities');
    }

    public function getStations() {
        $stationCursor = $this->stations->find();

        $stations = array();

        while($stationCursor->hasNext()) {
            $item = $this->stationToArray($stationCursor->getNext());

            $item['items'] = $this->getStationCommodities($item['id']);

            $stations[] = $item;
        }

        echo json_encode($stations);
    }

    public function updateStation($id = null) {
        $item = json_decode($this->getRequest()->getBody(), true);

        if(!is_null($id)) {
            $stored = $this->stations->findOne(array('_id' => new \MongoId($id)));
            if(!is_null($stored)) {
                $stored['name'] = $item['name'];
                $stored['system'] = $item['system'];
                $this->stations->save($stored);
                $item = $stored;
            }
        }
        else {
            $this->stations->save($item);
        }

        echo json_encode($this->stationToArray($item));
    }

    public function removeStation($id) {
        $this->stations->remove(array('_id' => new \MongoId($id)));
        $this->commodities->remove(array('station' => $id));
    }

    public function saveCommodities($id) {
        $commodities = json_decode($this->getRequest()->getBody(), true);
        $this->commodities->remove(array('station' => $id));

        $result = array();

        foreach($commodities as $commodity) {
            $item = array(
                'station' => $id,
                'item'    => $commodity['item'],
                'buy'     => $commodity['buy'],
                'sell'    => $commodity['sell']
            );
            $this->commodities->save($item);
            $result[] = $this->commodityToArray($item);
        }

        echo json_encode($result);
    }

    /**
     * @param $item
     *
     * @return array
     */
    private function stationToArray($item) {
        return array(
            'id'     => $item['_id']->{'$id'},
            'name'   => $item['name'],
            'system' => $item['system']
        );
    }

    private function commodityToArray($item) {
        return array(
            'id'   => $item['_id']->{'$id'},
            'item' => $item['item'],
            'buy'  => $item['buy'],
            'sell' => $item['sell']
        );
    }

    private function getStationCommodities($id) {
        $items = $this->commodities->find(array('station' => $id));
        $commodities = array();
        while($items->hasNext()) {
            $item = $items->getNext();
            $commodities[] = $this->commodityToArray($item);
        }

        usort($commodities, function($a, $b) {
            return $a['item'] > $b['item'];
        });

        return $commodities;
    }

}