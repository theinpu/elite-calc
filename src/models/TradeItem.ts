/**
 * Created by anubis on 06.02.2015.
 */

/// <reference path="../d.ts/backbone.d.ts"/>

class TradeItem extends Backbone.Model {

    defaults() {
        return {
            station_id: 0,
            resource: {},
            buy: 0,
            sell: 0
        }
    }

}