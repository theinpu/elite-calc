/**
 * Created by anubis on 06.02.2015.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../d.ts/backbone.d.ts"/>
var TradeItem = (function (_super) {
    __extends(TradeItem, _super);
    function TradeItem() {
        _super.apply(this, arguments);
    }
    TradeItem.prototype.defaults = function () {
        return {
            station_id: 0,
            resource: {},
            buy: 0,
            sell: 0
        };
    };
    return TradeItem;
})(Backbone.Model);
/**
 * Created by anubis on 06.02.2015.
 */
/// <reference path="../d.ts/backbone.d.ts"/>
/// <reference path="TradeItem.ts"/>
var ItemCollection = (function (_super) {
    __extends(ItemCollection, _super);
    function ItemCollection(models, options) {
        options = options || {};
        this.localStorage = new Store(options.store);
        _super.call(this, models, options);
    }
    ItemCollection.prototype.parse = function (response, options) {
        var result = [];
        response.forEach(function (item) {
            item.resource = new Resource(item.resource);
            result.push(new TradeItem(item));
        });
        return result;
    };
    ItemCollection.prototype.getByRes = function (resource) {
        var result = undefined;
        this.each(function (item) {
            if (result)
                return;
            if (item.attributes.resource.id == resource.id) {
                result = item;
            }
        }.bind(this));
        return result;
    };
    return ItemCollection;
})(Backbone.Collection);
/**
 * Created by anubis on 06.02.2015.
 */
/// <reference path="../d.ts/backbone.d.ts"/>
/// <reference path="ItemCollection.ts"/>
var Station = (function (_super) {
    __extends(Station, _super);
    function Station(attributes, options) {
        _super.call(this, attributes, options);
        this.items = new ItemCollection([], {
            store: 'st-items-' + this.id
        });
        if (attributes) {
            if (attributes.items) {
                this.items.reset(attributes.items, { parse: true });
            }
            else {
                this.items.fetch();
            }
        }
        this.items.on('add remove change', function (item) {
            this.trigger('change:items', this, item);
        }.bind(this));
    }
    Station.prototype.defaults = function () {
        return {
            system: '',
            station: ''
        };
    };
    return Station;
})(Backbone.Model);
/// <reference path="Station.ts"/>
/// <reference path="../d.ts/localStorage.d.ts"/>
var StationCollection = (function (_super) {
    __extends(StationCollection, _super);
    function StationCollection(models, options) {
        _super.call(this, models, options);
        this.firstRun = true;
        this.localStorage = new Store("elite-stations");
        this.on('sync', function () {
            this.firstRun = false;
        }.bind(this));
    }
    StationCollection.prototype.parse = function (response, options) {
        var result = [];
        response.forEach(function (item) {
            result.push(new Station(item));
        });
        return result;
    };
    return StationCollection;
})(Backbone.Collection);
var Resource = (function (_super) {
    __extends(Resource, _super);
    function Resource() {
        _super.apply(this, arguments);
    }
    Resource.prototype.defaults = function () {
        return {
            name: ''
        };
    };
    return Resource;
})(Backbone.Model);
/// <reference path="Resource.ts"/>
var ResourceCollection = (function (_super) {
    __extends(ResourceCollection, _super);
    function ResourceCollection(models, options) {
        _super.call(this, models, options);
        this.firstRun = true;
        this.localStorage = new Store("elite-resources");
        this.on('sync', function () {
            this.firstRun = false;
        }.bind(this));
    }
    ResourceCollection.prototype.parse = function (response, options) {
        var result = [];
        response.forEach(function (item) {
            result.push(new Resource(item));
        });
        return result;
    };
    return ResourceCollection;
})(Backbone.Collection);
var StationListItemView = (function (_super) {
    __extends(StationListItemView, _super);
    function StationListItemView(options) {
        this.tagName = 'li';
        this.className = 'list-group-item';
        this.app = options.app;
        _super.call(this, options);
    }
    StationListItemView.prototype.events = function () {
        return {
            'click a.overview': 'showOverview',
            'click a.addToRoute': 'addToRoute'
        };
    };
    StationListItemView.prototype.initialize = function (options) {
        this.tempalte = _.template($('#station_item').html());
        this.model.on('change', this.render, this);
        this.app.tradeRouter.on('change', this.render, this);
        this.render();
    };
    StationListItemView.prototype.render = function () {
        var bestRoute = this.app.tradeRouter.getBest(this.model, this.app.stations.models);
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
        if (bestRoute) {
            attributes.route = {
                resource: bestRoute.resource,
                dest: bestRoute.dest.get('system') + ' - ' + bestRoute.dest.get('station'),
                profit: bestRoute.totalProfit,
                cargo: bestRoute.canBuy
            };
        }
        this.$el.html(this.tempalte(attributes));
        return this;
    };
    StationListItemView.prototype.showOverview = function (e) {
        e.preventDefault();
        this.app.navigate('overview/' + this.model.id, { trigger: true });
    };
    StationListItemView.prototype.addToRoute = function (e) {
        e.preventDefault();
        this.app.tradeRouteView.addStation(this.model);
    };
    return StationListItemView;
})(Backbone.View);
/// <reference path="../../models/Resource.ts"/>
var ResourceListItemView = (function (_super) {
    __extends(ResourceListItemView, _super);
    function ResourceListItemView(options) {
        this.tagName = 'li';
        this.className = 'list-group-item';
        this.app = options.app;
        _super.call(this, options);
    }
    ResourceListItemView.prototype.initialize = function (options) {
        this.template = _.template($("#resource_item").html());
        this.model.on('change', this.render, this);
    };
    ResourceListItemView.prototype.render = function () {
        this.$el.html(this.template(this.model.attributes));
        return this;
    };
    return ResourceListItemView;
})(Backbone.View);
/// <reference path="views/StationListItemView.ts"/>
/// <reference path="views/ResourceListItemView.ts"/>
var DefaultPage = (function (_super) {
    __extends(DefaultPage, _super);
    function DefaultPage(options) {
        _super.call(this, options);
        this.app = options.app;
        this.setElement($('#content'));
        this.template = _.template($('#default_page').html());
        this.app.stations.on('sync', this.renderStations, this);
        this.app.resources.on('sync', this.renderResources, this);
    }
    DefaultPage.prototype.render = function () {
        this.$el.html(this.template());
        this.renderStations();
        this.renderResources();
        return this;
    };
    DefaultPage.prototype.renderStations = function () {
        var stationsEl = this.$el.find('#stations');
        stationsEl.empty();
        if (this.app.stations.length > 0) {
            this.app.stations.each(function (station) {
                if (station.id) {
                    var item = new StationListItemView({
                        app: this.app,
                        model: station
                    });
                    stationsEl.append(item.render().$el);
                }
            }.bind(this));
        }
    };
    DefaultPage.prototype.renderResources = function () {
        var resEl = this.$el.find('#resources');
        resEl.empty();
        if (this.app.resources.length > 0) {
            this.app.resources.each(function (resource) {
                if (resource.id) {
                    var item = new ResourceListItemView({
                        app: this.app,
                        model: resource
                    });
                    resEl.append(item.render().$el);
                }
            }.bind(this));
        }
    };
    return DefaultPage;
})(Backbone.View);
/**
 * Created by anubis on 06.02.2015.
 */
var AddNewPage = (function (_super) {
    __extends(AddNewPage, _super);
    function AddNewPage(options) {
        options = options || {};
        _super.call(this, options);
        this.app = options.app;
        this.setElement($('#content'));
        this.template = _.template($('#addNew_page').html());
        this.model = options.model || new Station();
        this.model.on('change', this.render, this);
        _.extend(this, Backbone.Events);
    }
    AddNewPage.prototype.events = function () {
        return {
            'submit #addNew_form': 'onFormSubmit'
        };
    };
    AddNewPage.prototype.render = function () {
        this.$el.html(this.template({
            station: this.model.attributes.station,
            system: this.model.attributes.system
        }));
        return this;
    };
    AddNewPage.prototype.onFormSubmit = function (e) {
        e.preventDefault();
        var form = $(e.target);
        var name = form.find('#st-name').val();
        if (name.length > 0) {
            this.model.set('station', name);
        }
        var system = form.find('#st-system').val();
        if (system.length > 0) {
            this.model.set('system', system);
        }
        if (name.length == 0 || system.length == 0) {
            alert('empty field');
        }
        else {
            this.trigger('add', this.model);
        }
    };
    return AddNewPage;
})(Backbone.View);
var AddNewResourcePage = (function (_super) {
    __extends(AddNewResourcePage, _super);
    function AddNewResourcePage(options) {
        _super.call(this, options);
        this.app = options.app;
        this.setElement($('#content'));
        this.template = _.template($('#addNewResource_page').html());
        this.model = new Resource();
    }
    AddNewResourcePage.prototype.events = function () {
        return {
            'submit #addNewRes_form': 'onFormSubmit'
        };
    };
    AddNewResourcePage.prototype.render = function () {
        this.$el.html(this.template());
        return this;
    };
    AddNewResourcePage.prototype.onFormSubmit = function (e) {
        e.preventDefault();
        this.model.set('name', $(e.target).find('#res-name').val());
        this.app.resources.add(this.model);
        this.model.save({}, {
            success: function () {
                this.navigate('', { trigger: true });
            }.bind(this.app)
        });
    };
    return AddNewResourcePage;
})(Backbone.View);
var StationsPage = (function (_super) {
    __extends(StationsPage, _super);
    function StationsPage(options) {
        _super.call(this, options);
        this.setElement($('#content'));
        this.template = _.template($('#stations_page').html());
    }
    StationsPage.prototype.events = function () {
        return {
            'click a.addItem': 'addItem'
        };
    };
    StationsPage.prototype.render = function () {
        this.$el.html(this.template());
        return this;
    };
    StationsPage.prototype.addItem = function (e) {
        e.preventDefault();
    };
    return StationsPage;
})(Backbone.View);
/// <reference path="../../models/TradeItem.ts"/>
var ItemListItemView = (function (_super) {
    __extends(ItemListItemView, _super);
    function ItemListItemView(options) {
        this.tagName = 'tr';
        _super.call(this, options);
        this.app = options.app;
    }
    ItemListItemView.prototype.events = function () {
        return {
            'click a.delete': 'deleteItem',
            'click a.routes': 'showRoutes',
            'focus input.resBuy': 'startEditBuy',
            'blur input.resBuy': 'stopEditBuy',
            'keypress input.resBuy': 'stopEditBuy',
            'focus input.resSell': 'startEditSell',
            'blur input.resSell': 'stopEditSell',
            'keypress input.resSell': 'stopEditSell'
        };
    };
    ItemListItemView.prototype.initialize = function (options) {
        this.template = _.template($("#trade_item").html());
    };
    ItemListItemView.prototype.render = function () {
        var name = this.model.get('resource').name || this.model.get('resource').get('name');
        this.$el.html(this.template({
            name: name,
            buy: this.model.attributes.buy,
            sell: this.model.attributes.sell
        }));
        return this;
    };
    ItemListItemView.prototype.deleteItem = function (e) {
        e.preventDefault();
        if (confirm('Delete?')) {
            this.model.destroy();
        }
    };
    ItemListItemView.prototype.startEditBuy = function (e) {
        e.preventDefault();
        $(e.target).select();
    };
    ItemListItemView.prototype.stopEditBuy = function (e) {
        if (e.which == 0 || e.which == 13) {
            var buy = parseInt(this.$el.find('input.resBuy').val()) || 0;
            this.model.set('buy', buy);
            this.model.save();
        }
    };
    ItemListItemView.prototype.startEditSell = function (e) {
        e.preventDefault();
        $(e.target).select();
    };
    ItemListItemView.prototype.stopEditSell = function (e) {
        if (e.which == 0 || e.which == 13) {
            var sell = parseInt(this.$el.find('input.resSell').val()) || 0;
            this.model.set('sell', sell);
            this.model.save();
        }
    };
    ItemListItemView.prototype.showRoutes = function (e) {
        e.preventDefault();
    };
    return ItemListItemView;
})(Backbone.View);
/// <reference path="views/ItemListView.ts"/>
var StationOverviewPage = (function (_super) {
    __extends(StationOverviewPage, _super);
    function StationOverviewPage(options) {
        _super.call(this, options);
        this.app = options.app;
        this.setElement($('#content'));
        this.template = _.template($('#station_overview').html());
        this.model.on('change:items', this.renderItems, this);
        this.app.resources.on('sync', this.renderResSelector, this);
    }
    StationOverviewPage.prototype.events = function () {
        return {
            "click .goBack": 'goBack',
            'click .deleteStation': 'deleteItem',
            'click a.addItem': 'addItem',
            'submit #addResourceItem_form': 'onFormSubmit',
            'reset #addResourceItem_form': 'onFormReset'
        };
    };
    StationOverviewPage.prototype.render = function () {
        this.$el.html(this.template(this.model.attributes));
        this.renderResSelector();
        this.renderItems();
        return this;
    };
    StationOverviewPage.prototype.renderItems = function () {
        var tbody = this.$el.find('#items tbody');
        if (this.model.items.length > 0) {
            tbody.empty();
            this.model.items.each(function (item) {
                var view = new ItemListItemView({ model: item, app: this.app });
                view.model.on('change', function () {
                    this.model.trigger('change');
                }.bind(this));
                tbody.append(view.render().$el);
            }.bind(this));
        }
    };
    StationOverviewPage.prototype.renderResSelector = function () {
        var selector = this.$el.find('select#resourceType');
        if (this.app.resources.length > 0) {
            this.app.resources.each(function (res) {
                selector.append('<option value="' + res.id + '">' + res.attributes.name + '</option>');
            }.bind(this));
        }
    };
    StationOverviewPage.prototype.goBack = function (e) {
        e.preventDefault();
        this.app.navigate('', { trigger: true });
    };
    StationOverviewPage.prototype.deleteItem = function (e) {
        e.preventDefault();
        if (confirm("Delete?")) {
            this.model.destroy();
            this.app.navigate('', { trigger: true, replace: true });
        }
    };
    StationOverviewPage.prototype.addItem = function (e) {
        e.preventDefault();
        this.$el.find('#resForm').slideDown(30);
    };
    StationOverviewPage.prototype.onFormSubmit = function (e) {
        e.preventDefault();
        var form = this.$el.find('form');
        var res = form.find('#resourceType').val();
        var buy = parseInt(form.find('#resBuy').val()) || 0;
        var sell = parseInt(form.find('#resSell').val()) || 0;
        var item = new TradeItem({
            station_id: this.model.id,
            resource: this.app.resources.get(res),
            buy: buy,
            sell: sell
        });
        this.model.items.add(item);
        item.save();
        this.$el.find('#resForm').slideUp(30);
    };
    StationOverviewPage.prototype.onFormReset = function (e) {
        e.preventDefault();
        this.$el.find('#resForm').slideUp(30);
    };
    return StationOverviewPage;
})(Backbone.View);
var TradeRoute = (function (_super) {
    __extends(TradeRoute, _super);
    function TradeRoute(attributes, options) {
        this.stations = [];
        this.routes = [];
        this.localStorage = new Store('trade-route');
        this.id = 'default-route';
        _super.call(this, attributes, options);
    }
    TradeRoute.prototype.defaults = function () {
        return {
            cargo: 32,
            money: 100000
        };
    };
    TradeRoute.prototype.addStation = function (station) {
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
    };
    TradeRoute.prototype.recalculate = function () {
        this.routes = [];
        if (this.stations.length != 2)
            return;
        var src = this.stations[0];
        var dest = this.stations[1];
        src.items.each(function (item) {
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
        }.bind(this));
        this.trigger('change');
    };
    TradeRoute.prototype.getRoutes = function (src, dest) {
        var result = [];
        src.items.each(function (item) {
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
    };
    TradeRoute.prototype.getBest = function (src, others) {
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
    };
    return TradeRoute;
})(Backbone.Model);
/// <reference path="../../models/TradeRoute.ts"/>
var TradeRoutesView = (function (_super) {
    __extends(TradeRoutesView, _super);
    function TradeRoutesView(options) {
        _super.call(this, options);
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
        this.$el.find('a.resetTrade').click(function (e) {
            e.preventDefault();
            this.model.stations = [];
            this.model.routes = [];
            this.model.trigger('change');
        }.bind(this));
        var selector = this.$el.find('#currentPlace');
        selector.off('change');
        this.app.stations.each(function (station) {
            selector.append('<option value="' + station.id + '">' + station.attributes.system + ' - ' + station.attributes.station + '</option>');
        }.bind(this));
        selector.on({ 'change': this.findBestRoute.bind(this) });
    }
    TradeRoutesView.prototype.render = function () {
        this.cargo.val(this.model.attributes.cargo);
        this.money.val(this.model.attributes.money);
        this.stationHolder.empty();
        this.routeHolder.empty();
        this.bestRouteHolder.find('.result').empty();
        this.findBestRoute();
        if (this.model.stations.length > 0) {
            this.model.stations.forEach(function (item) {
                this.stationHolder.append('<a href="#overview/' + item.id + '">' + item.attributes.system + ' - ' + item.attributes.station + '</a><br />');
            }.bind(this));
        }
        else {
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
                }
                else {
                    if (maxFrom < item.totalProfit) {
                        maxFrom = item.totalProfit;
                        maxFromId = id;
                    }
                }
                var element = $('<div>', { class: 'route-item' });
                var dir = $('<span>', {
                    class: item.dir == 1 ? 'glyphicon glyphicon-menu-right' : 'glyphicon glyphicon-menu-left'
                });
                element.append('<span>' + item.totalProfit + ': ' + item.canBuy + '</span>');
                element.append(dir);
                element.append('<span>' + item.resource + '</span>');
                this.routeHolder.append(element);
            }.bind(this));
            this.routeHolder.find('.route-item:eq(' + maxFromId + ')').addClass('text-primary');
            this.routeHolder.find('.route-item:eq(' + maxToId + ')').addClass('text-primary');
        }
        else {
            this.routeHolder.append('<div class="alert alert-info" role="alert">empty</div>');
        }
        return this;
    };
    TradeRoutesView.prototype.addStation = function (station) {
        station.off('change');
        this.model.addStation(station);
        station.on('change', this.model.recalculate, this.model);
    };
    TradeRoutesView.prototype.findBestRoute = function () {
        var current = this.$el.find('#currentPlace').val();
        var station = this.app.stations.get(current);
        this.bestRouteHolder.find('.result').empty();
        var profitables = [];
        this.app.stations.each(function (item) {
            if (station.id == item.id)
                return;
            var routes = this.model.getRoutes(station, item);
            var max = 0;
            var profitable = {};
            if (routes.length > 0) {
                routes.forEach(function (route) {
                    if (route.dir != 1)
                        return;
                    if (route.totalProfit > max) {
                        max = route.totalProfit;
                        profitable = route;
                    }
                }.bind(this));
                profitables.push(profitable);
            }
        }.bind(this));
        profitables.forEach(function (item) {
            var element = $('<div>', { class: 'route-item' });
            var dir = $('<span>', {
                class: item.dir == 1 ? 'glyphicon glyphicon-menu-right' : 'glyphicon glyphicon-menu-left'
            });
            element.append('<span>[' + item.totalProfit + ': ' + item.canBuy + ']</span>');
            element.append('<span> ' + item.resource + ' </span>');
            element.append(dir);
            element.append('<span>' + item.dest.get('system') + ' - ' + item.dest.get('station') + '</span>');
            this.bestRouteHolder.find('.result').append(element);
        }.bind(this));
    };
    return TradeRoutesView;
})(Backbone.View);
/// <reference path="d.ts/backbone.d.ts"/>
/// <reference path="models/StationCollection.ts"/>
/// <reference path="models/ResourceCollection.ts"/>
/// <reference path="pages/DefaultPage.ts"/>
/// <reference path="pages/AddNewPage.ts"/>
/// <reference path="pages/AddNewResourcePage.ts"/>
/// <reference path="pages/StationsPage.ts"/>
/// <reference path="pages/StationOverviewPage.ts"/>
/// <reference path="pages/views/TradeRoutesView.ts"/>
var Application = (function (_super) {
    __extends(Application, _super);
    function Application(options) {
        this.tradeRouter = new TradeRoute();
        this.stations = new StationCollection();
        this.resources = new ResourceCollection();
        _super.call(this, options);
        Backbone.history.start();
        this.stations.fetch({ parse: true });
        this.resources.fetch({ parse: true });
        this.tradeRouteView = new TradeRoutesView({ app: this, model: this.tradeRouter });
        this.tradeRouteView.render();
    }
    Application.prototype.routes = function () {
        return {
            '': 'startPage',
            'addNew': 'addNew',
            'overview/:id': 'stationOverview',
            'addResource': 'addResource'
        };
    };
    Application.prototype.startPage = function () {
        var page = new DefaultPage({ app: this });
        page.render();
    };
    Application.prototype.addNew = function () {
        var page = new AddNewPage({ app: this });
        page.on('add', function (station) {
            this.stations.add(station);
            station.save();
            this.navigate('', { trigger: true });
        }.bind(this));
        page.render();
    };
    Application.prototype.stationOverview = function (id) {
        if (this.stations.firstRun) {
            this.stations.on('sync', function () {
                var station = this.stations.get(id);
                var page = new StationOverviewPage({
                    app: this,
                    model: station
                });
                page.render();
            }.bind(this));
        }
        else {
            var station = this.stations.get(id);
            var page = new StationOverviewPage({
                app: this,
                model: station
            });
            page.render();
        }
    };
    Application.prototype.addResource = function () {
        var page = new AddNewResourcePage({ app: this });
        page.render();
    };
    return Application;
})(Backbone.Router);
