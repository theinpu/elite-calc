class StationListItemView extends Backbone.View<Station> {

    model:Station;
    tempalte;
    app:Application;

    events() {
        return {
            'click a.overview': 'showOverview',
            'click a.addToRoute': 'addToRoute'
        }
    }

    constructor(options?:any) {
        this.tagName = 'li';
        this.className = 'list-group-item';
        this.app = options.app;
        super(options);
    }

    initialize(options?:any) {
        this.tempalte = _.template($('#station_item').html());
        this.model.on('change', this.render, this);
        this.app.tradeRouter.on('change', this.render, this);
        this.render();
    }

    render() {
        var bestRoute:any = this.app.tradeRouter.getBest(this.model, this.app.stations.models);
        var attributes = {
            id: this.model.id,
            station: this.model.attributes.station,
            system: this.model.attributes.system,
            count: this.model.items.length || 0,
            route: {
                resource: '',
                dest: '',
                profit: 0,
                cargo: 0
            }
        };
        if(bestRoute) {
            attributes.route = {
                resource: bestRoute.resource,
                    dest: bestRoute.dest.get('system') + ' - ' + bestRoute.dest.get('station'),
                    profit: bestRoute.totalProfit,
                    cargo: bestRoute.canBuy
            };
        }
        this.$el.html(this.tempalte(attributes));
        return this;
    }

    private showOverview(e:JQueryEventObject) {
        e.preventDefault();
        this.app.navigate('overview/' + this.model.id, {trigger: true});
    }

    private addToRoute(e:JQueryEventObject) {
        e.preventDefault();
        this.app.tradeRouteView.addStation(this.model);
    }


}