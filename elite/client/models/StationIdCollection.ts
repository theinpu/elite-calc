
class StationIdCollection extends Backbone.Collection<Backbone.Model> {

    localStorage = new Store("station-props");

    app:Application;

    listedStations: Backbone.Collection<Station>;

    initialize(options?:any) {
        this.app = options.app;
        this.listedStations = new Backbone.Collection<Station>();
    }

    /*each(iterator: (element: Station, index: number, list?: any) => void, context?: any) {
        return super.each(function(item:any, index:number) {
            console.log(item, this);
            iterator(this.getStation(item.attributes.sid), index);
        }, this);
    }*/

    public calcRoutes() {
        this.listedStations.reset();
        this.each(function(item) {
            var station = this.getStation(item.attributes.sid);
            this.listedStations.add(station);
        }.bind(this));
        this.listedStations.each(function(station:Station) {
            station.calcRoutes();
        });
    }

    public getStation(id:string):Station {
        return this.app.stations.get(id);
    }

    public getStations(): Backbone.Collection<Station> {
        return this.listedStations;
    }

}