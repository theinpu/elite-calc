/// <reference path="../../models/TradeRoute.ts"/>

class TradeRoutesView extends Backbone.View<TradeRoute> {

    model:TradeRoute;

    stationHolder:JQuery;
    routeHolder:JQuery;

    cargo:JQuery;
    money:JQuery;

    bestRouteHolder:JQuery;

    app:Application;

    constructor(options?:any) {
        super(options);
        this.setElement($('#routesHolder'));
        this.app = options.app;
        this.stationHolder = this.$el.find('#stationList');
        this.routeHolder = this.$el.find('#routeList');
        this.cargo = this.$el.find('#cargoSize');
        this.money = this.$el.find('#money');
        this.bestRouteHolder = this.$el.find('#bestRoute');
        this.model.fetch();
        this.model.on('change', this.render, this);
        this.cargo.on('change', function () {
            this.model.set('cargo', this.cargo.val());
            this.model.recalculate();
            this.model.save();
        }.bind(this));
        this.money.on('change', function () {
            this.model.set('money', this.money.val());
            this.model.recalculate();
            this.model.save();
        }.bind(this));
        this.$el.find('a.resetTrade').click(function (e:JQueryEventObject) {
            e.preventDefault();
            this.model.stations = [];
            this.model.routes = [];
            this.model.trigger('change');
        }.bind(this));

        var selector = this.$el.find('#currentPlace');
        selector.off('change');
        this.app.stations.each(function (station:Station) {
            selector.append('<option value="'
            + station.id + '">'
            + station.attributes.system + ' - '
            + station.attributes.station + '</option>');
        }.bind(this));
        selector.on({'change': this.findBestRoute.bind(this)});
    }

    render() {
        this.cargo.val(this.model.attributes.cargo);
        this.money.val(this.model.attributes.money);

        this.stationHolder.empty();
        this.routeHolder.empty();

        this.bestRouteHolder.find('.result').empty();


        this.findBestRoute();

        if (this.model.stations.length > 0) {
            this.model.stations.forEach(function (item:Station) {
                this.stationHolder.append('<a href="#overview/' + item.id + '">'
                + item.attributes.system + ' - ' + item.attributes.station + '</a><br />');
            }.bind(this));
        } else {
            this.stationHolder.append('<div class="alert alert-info" role="alert">empty</div>');
        }

        if (this.model.routes.length > 0) {
            var maxTo = 0;
            var maxFrom = 0;
            var maxToId = -1;
            var maxFromId = -1;
            this.model.routes.forEach(function (item, id) {
                if (item.dir == 1) {
                    if (maxTo < item.totalProfit) {
                        maxTo = item.totalProfit;
                        maxToId = id;
                    }
                } else {
                    if (maxFrom < item.totalProfit) {
                        maxFrom = item.totalProfit;
                        maxFromId = id;
                    }
                }
                var element = $('<div>', {class: 'route-item'});
                var dir = $('<span>', {
                    class: item.dir == 1
                        ? 'glyphicon glyphicon-menu-right'
                        : 'glyphicon glyphicon-menu-left'
                });

                element.append('<span>' + item.totalProfit + ': ' + item.canBuy + '</span>');
                element.append(dir);
                element.append('<span>' + item.resource + '</span>');
                this.routeHolder.append(element);
            }.bind(this));
            this.routeHolder.find('.route-item:eq(' + maxFromId + ')').addClass('text-primary');
            this.routeHolder.find('.route-item:eq(' + maxToId + ')').addClass('text-primary');
        } else {
            this.routeHolder.append('<div class="alert alert-info" role="alert">empty</div>');
        }

        return this;
    }

    public addStation(station:Station) {
        station.off('change');
        this.model.addStation(station);
        station.on('change', this.model.recalculate, this.model);
    }

    private findBestRoute() {
        var current = this.$el.find('#currentPlace').val();
        var station = this.app.stations.get(current);
        this.bestRouteHolder.find('.result').empty();

        var profitables = [];

        this.app.stations.each(function (item) {
            if (station.id == item.id) return;

            var routes = this.model.getRoutes(station, item);
            var max = 0;
            var profitable = {};
            if(routes.length > 0) {
                routes.forEach(function (route) {
                    if(route.dir != 1) return;
                    if (route.totalProfit > max) {
                        max = route.totalProfit;
                        profitable = route;
                    }
                }.bind(this));
                profitables.push(profitable);
            }
        }.bind(this));

        profitables.forEach(function(item) {
            var element = $('<div>', {class: 'route-item'});
            var dir = $('<span>', {
                class: item.dir == 1
                    ? 'glyphicon glyphicon-menu-right'
                    : 'glyphicon glyphicon-menu-left'
            });

            element.append('<span>[' + item.totalProfit + ': ' + item.canBuy + ']</span>');
            element.append('<span> ' + item.resource + ' </span>');
            element.append(dir);
            element.append('<span>' + item.dest.get('system') + ' - ' + item.dest.get('station') + '</span>');

            this.bestRouteHolder.find('.result').append(element);
        }.bind(this));
    }

}
