/// <reference path="Station.ts"/>
/// <reference path="../d.ts/localStorage.d.ts"/>

class StationCollection extends Backbone.Collection<Station> {

    public firstRun:boolean = true;
    collection:Station[];

    localStorage = new Store("elite-stations");

    constructor(models?: Station[], options?: any) {
        super(models, options);

        this.on('sync', function() {
            this.firstRun = false;
        }.bind(this));
    }

    parse(response: any, options?: any) {
        var result = [];

        response.forEach(function(item) {
            result.push(new Station(item));
        });

        return result;
    }

}