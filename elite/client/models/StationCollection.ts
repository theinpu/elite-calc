/// <reference path="Station.ts"/>

class StationCollection extends Backbone.Collection<Station> {

    models:Station[];
    url = '/api/station/';

    parse(responce, options) {
        var result = [];
        responce.forEach(function(item) {
            var station = new Station(item);
            if(item.items) {
                station.items.reset(item.items);
            }
            result.push(station);
        });
        return result;
    }

    public calcRoutes() {
        this.each(function(station: Station) {
            station.calcRoutes();
        });
    }
}