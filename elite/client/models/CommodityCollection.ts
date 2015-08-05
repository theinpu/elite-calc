/// <reference path="Commodity.ts"/>

class CommodityCollection extends Backbone.Collection<Commodity> {

    url = function () {
        var base = '/api/commodity';
        if(!this.station) return '';
        return base + '/' + this.station;
    };
    models:Commodity[];

    public station;

}