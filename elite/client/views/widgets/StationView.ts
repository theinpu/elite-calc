/// <reference path="CommodityView.ts"/>
/// <reference path="RoutesView.ts"/>

class StationView extends Backbone.View<Station> {

    model:Station;
    template;
    app:Application;

    events() {
        return {
            'click .addItem': 'addCommodity',
            'click .removeStation': 'removeStation'
        }
    }

    initialize(options?:any) {
        this.app = options.app;
        this.template = _.template($('#stationItem').html());
        this.model.on('all', this.render, this);
        this.render();
    }

    render() {
        this.$el.html(this.template(this.model.attributes));
        var commodityView = new CommodityView({
            el: this.$el.find('#items tbody'),
            collection: this.model.items
        });
        commodityView.render();

        var routeView = new RoutesView({
            el: this.$el.find('#routes tbody'),
            collection: this.model.routes
        });

        routeView.render();
        return this;
    }

    private addCommodity(e:JQueryEventObject) {
        e.preventDefault();

        var data = {
            item: this.$el.find('#addCommodityDialog').find('#commodityId').val(),
            buy: this.$el.find('#addCommodityDialog').find('#commodityBuy').val(),
            sell: this.$el.find('#addCommodityDialog').find('#commoditySell').val()
        };
        this.model.items.add(new Commodity(data));

        this.$el.find('#addCommodityDialog').modal('hide');
    }

    private removeStation(e:JQueryEventObject) {
        e.preventDefault();
        if (confirm('Remove?') && !this.model.isNew()) {
            this.model.destroy();
            this.$el.empty();
        }
    }

}