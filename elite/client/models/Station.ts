/// <reference path="CommodityCollection.ts"/>

class Station extends Backbone.Model {

    url = function () {
        var base = '/api/station';
        if (this.isNew()) {
            return base;
        }
        return base + '/' + this.id;
    };

    public items:CommodityCollection;
    public routes:Backbone.Collection<Backbone.Model>;

    defaults() {
        return {
            'name': '',
            'system': ''
        }
    }

    initialize() {
        if (!this.items) {
            this.items = new CommodityCollection();
            this.items.station = this.id;
        }
        if (!this.routes) {
            this.routes = new Backbone.Collection();
        }
        this.items.on('add remove change', function () {
            this.items.sync('update', this.items, {
                success: function (data) {
                    this.trigger('change:items');
                    this.items.reset(data);
                }.bind(this)
            });
        }.bind(this));
        this.on('change:items', this.calcRoutes, this);
    }

    public calcRoutes() {
        if (!this.collection) return;
        var routes = [];

        this.collection.each(function (station:Station) {
            if (station == this) return;
            var routesTo = this.getRoutesTo(station);
            if (routesTo.length > 0) {
                routesTo.forEach(function (route) {
                    routes.push(route);
                });
            }
        }.bind(this));

        if (routes.length > 0) {
            this.routes.reset(routes);
        }
    }

    public getRoutesTo(station:Station) {
        if (this.items.length == 0 || station.items.length == 0) return [];

        var routes = [];

        this.items.each(function (item:Commodity) {
            if (item.attributes.buy == 0) return;
            var tradeItem:Commodity = station.items.findWhere({item: item.attributes.item});
            if (!tradeItem) return;
            if (tradeItem.attributes.sell == 0) return;

            var profit = tradeItem.attributes.sell - item.attributes.buy;
            if (profit > 0) {
                var quantity = Math.floor(app.userInfo.attributes.money / item.attributes.buy);
                if (quantity > app.userInfo.attributes.cargo) quantity = app.userInfo.attributes.cargo;
                var totalProfit = quantity * profit;
                var target = station;
                var commodity = commodities[item.attributes.item];
                routes.push({
                    'profit': totalProfit,
                    'quantity': quantity,
                    'target': target,
                    'commodity': commodity
                });
            }
        }.bind(this));

        return routes;
    }

}

declare var app:Application;
declare var commodities;