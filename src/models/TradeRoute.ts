class TradeRoute extends Backbone.Model {

    stations:Station[];
    routes:any[];
    localStorage;

    defaults() {
        return {
            cargo: 32,
            money: 100000
        }
    }

    constructor(attributes?:any, options?:any) {
        this.stations = [];
        this.routes = [];
        this.localStorage = new Store('trade-route');
        this.id = 'default-route';
        super(attributes, options);
    }

    public addStation(station:Station) {
        if (this.stations.indexOf(station) === -1 || this.stations.length == 2) {
            if (this.stations.length == 2) {
                this.stations = [];
            }
            this.stations.push(station);
            if (this.stations.length == 2) {
                this.recalculate();
            }
            this.trigger('change');
        }
    }

    public recalculate() {
        this.routes = [];

        if (this.stations.length != 2) return;

        var src = this.stations[0];
        var dest = this.stations[1];

        src.items.each(function (item:TradeItem) {
            var tradeItem = dest.items.getByRes(item.get('resource'));
            if (tradeItem) {
                var route = {
                    dir: 1,
                    resource: item.attributes.resource.get('name'),
                    profit: 0,
                    totalProfit: 0,
                    canBuy: 0,
                    source: src,
                    dest: dest
                };

                //check sell from src to dist
                if (item.attributes.buy > 0 && tradeItem.attributes.sell > 0) {
                    if (item.attributes.buy < tradeItem.attributes.sell) {
                        route.dir = 1;
                        route.profit = tradeItem.attributes.sell - item.attributes.buy;
                        route.canBuy = Math.floor(this.attributes.money / item.attributes.buy);
                        route.canBuy = route.canBuy > this.attributes.cargo ? this.attributes.cargo : route.canBuy;
                        route.totalProfit = route.profit * route.canBuy;
                        this.routes.push(route);
                    }
                }

                //check buy from dest to src
                if (item.attributes.sell > 0 && tradeItem.attributes.buy > 0) {
                    if (item.attributes.sell > tradeItem.attributes.buy) {
                        route.dir = -1;
                        route.profit = item.attributes.sell - tradeItem.attributes.buy;
                        route.canBuy = Math.floor(this.attributes.money / tradeItem.attributes.buy);
                        route.canBuy = route.canBuy > this.attributes.cargo ? this.attributes.cargo : route.canBuy;
                        route.totalProfit = route.profit * route.canBuy;
                        this.routes.push(route);
                    }
                }
            }
        }.bind(this))

        this.trigger('change');
    }

    public getRoutes(src:Station, dest:Station) {

        var result = [];

        src.items.each(function (item:TradeItem) {
            var tradeItem = dest.items.getByRes(item.get('resource'));
            if (tradeItem) {
                var route = {
                    dir: 1,
                    resource: item.attributes.resource.get('name'),
                    profit: 0,
                    totalProfit: 0,
                    canBuy: 0,
                    source: src,
                    dest: dest
                };

                //check sell from src to dist
                if (item.attributes.buy > 0 && tradeItem.attributes.sell > 0) {
                    if (item.attributes.buy < tradeItem.attributes.sell) {
                        route.dir = 1;
                        route.profit = tradeItem.attributes.sell - item.attributes.buy;
                        route.canBuy = Math.floor(this.attributes.money / item.attributes.buy);
                        route.canBuy = route.canBuy > this.attributes.cargo ? this.attributes.cargo : route.canBuy;
                        route.totalProfit = route.profit * route.canBuy;
                        result.push(route);
                    }
                }

                //check buy from dest to src
                if (item.attributes.sell > 0 && tradeItem.attributes.buy > 0) {
                    if (item.attributes.sell > tradeItem.attributes.buy) {
                        route.dir = -1;
                        route.profit = item.attributes.sell - tradeItem.attributes.buy;
                        route.canBuy = Math.floor(this.attributes.money / tradeItem.attributes.buy);
                        route.canBuy = route.canBuy > this.attributes.cargo ? this.attributes.cargo : route.canBuy;
                        route.totalProfit = route.profit * route.canBuy;
                        result.push(route);
                    }
                }
            }
        }.bind(this));

        return result;
    }

    public getBest(src:Station, others:Station[]):any {
        var result = undefined;
        var bestRoutes = [];

        others.forEach(function (item) {
            var routes = this.getRoutes(src, item);
            var max = 0;
            var maxId = -1;
            routes.forEach(function (route, id) {
                if (route.dir != -1) {
                    if (max < route.totalProfit) {
                        max = route.totalProfit;
                        maxId = id;
                    }
                }
            });
            if (maxId > -1) {
                bestRoutes.push(routes[maxId]);
            }
        }.bind(this));

        var bestMax = 0;
        var bestMaxId = -1;
        bestRoutes.forEach(function (route, id) {
            if (bestMax < route.totalProfit) {
                bestMax = route.totalProfit;
                bestMaxId = id;
            }
        });

        if (bestMaxId > -1) {
            result = bestRoutes[bestMaxId];
        }

        return result;
    }
}
