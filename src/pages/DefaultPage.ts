/// <reference path="views/StationListItemView.ts"/>
/// <reference path="views/ResourceListItemView.ts"/>

class DefaultPage extends Backbone.View<Backbone.Model> {

    template;
    app:Application;

    constructor(options?:any) {
        super(options);
        this.app = options.app;
        this.setElement($('#content'));
        this.template = _.template($('#default_page').html());
        this.app.stations.on('sync', this.renderStations, this);
        this.app.resources.on('sync', this.renderResources, this);
    }

    render() {
        this.$el.html(this.template());
        this.renderStations();
        this.renderResources();
        return this;
    }

    private renderStations() {
        var stationsEl = this.$el.find('#stations');
        stationsEl.empty();
        if (this.app.stations.length > 0) {
            this.app.stations.each(function (station:Station) {
                if (station.id) {
                    var item = new StationListItemView({
                        app: this.app,
                        model: station
                    });
                    stationsEl.append(item.render().$el);
                }
            }.bind(this));
        }
    }

    private renderResources() {
        var resEl = this.$el.find('#resources');
        resEl.empty();
        if (this.app.resources.length > 0) {
            this.app.resources.each(function (resource:Resource) {
                if (resource.id) {
                    var item = new ResourceListItemView({
                        app: this.app,
                        model: resource
                    });
                    resEl.append(item.render().$el);
                }
            }.bind(this));
        }
    }

}
