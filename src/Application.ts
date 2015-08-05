/// <reference path="d.ts/backbone.d.ts"/>
/// <reference path="models/StationCollection.ts"/>
/// <reference path="models/ResourceCollection.ts"/>
/// <reference path="pages/DefaultPage.ts"/>
/// <reference path="pages/AddNewPage.ts"/>
/// <reference path="pages/AddNewResourcePage.ts"/>
/// <reference path="pages/StationsPage.ts"/>
/// <reference path="pages/StationOverviewPage.ts"/>
/// <reference path="pages/views/TradeRoutesView.ts"/>

class Application extends Backbone.Router {

    public stations:StationCollection;
    public resources:ResourceCollection;

    public tradeRouter:TradeRoute;
    public tradeRouteView:TradeRoutesView;

    routes() {
        return {
            '': 'startPage',
            'addNew': 'addNew',
            'overview/:id': 'stationOverview',
            'addResource': 'addResource'
        }
    }

    constructor(options?:Backbone.RouterOptions) {
        this.tradeRouter = new TradeRoute();
        this.stations = new StationCollection();
        this.resources = new ResourceCollection();
        super(options);
        Backbone.history.start();
        this.stations.fetch({parse: true});
        this.resources.fetch({parse: true});
        this.tradeRouteView = new TradeRoutesView({app: this, model: this.tradeRouter});
        this.tradeRouteView.render();
    }

    private startPage() {
        var page = new DefaultPage({app: this});
        page.render();
    }

    private addNew() {
        var page = new AddNewPage({app: this});
        page.on('add', function (station:Station) {
            this.stations.add(station);
            station.save();
            this.navigate('', {trigger: true});
        }.bind(this));
        page.render();
    }

    private stationOverview(id:string) {
        if (this.stations.firstRun) {
            this.stations.on('sync', function () {
                var station = this.stations.get(id);
                var page = new StationOverviewPage({
                    app: this,
                    model: station
                });
                page.render();
            }.bind(this));
        } else {
            var station = this.stations.get(id);
            var page = new StationOverviewPage({
                app: this,
                model: station
            });
            page.render();
        }
    }

    private addResource() {
        var page = new AddNewResourcePage({app: this});
        page.render();
    }

}