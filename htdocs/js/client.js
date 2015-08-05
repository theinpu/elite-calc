/**
 * Created by anubis on 08.02.2015.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var RaresView = (function (_super) {
    __extends(RaresView, _super);
    function RaresView(options) {
        _super.call(this, options);
        this.setElement($('#content'));
        this.rareTpl = _.template($('#rares').html());
        this.rareItemTpl = _.template($('#rare-item').html());
        this.collection = new RareCollection(Rares);
        this.collection = this.collection.sort();
    }
    RaresView.prototype.render = function () {
        this.$el.empty();
        this.$el.append($(this.rareTpl()));
        var rareHolder = this.$el.find('.list-group');
        this.collection.each(function (item) {
            rareHolder.append(this.rareItemTpl(item.attributes));
        }.bind(this));
        return this;
    };
    return RaresView;
})(Backbone.View);
var RareCollection = (function (_super) {
    __extends(RareCollection, _super);
    function RareCollection() {
        _super.apply(this, arguments);
    }
    RareCollection.prototype.comparator = function (first, second) {
        return parseInt(first.get('buy')) > parseInt(second.get('buy')) ? -1 : 1;
    };
    return RareCollection;
})(Backbone.Collection);
/// <reference path="../../../src/d.ts/localStorage.d.ts"/>
var UserInfo = (function (_super) {
    __extends(UserInfo, _super);
    function UserInfo(attributes, options) {
        _super.call(this, attributes, options);
        this.localStorage = new Store('local');
        this.on('change', function () {
            this.save();
        }, this);
    }
    UserInfo.prototype.defaults = function () {
        return {
            cargo: 0,
            money: 0
        };
    };
    return UserInfo;
})(Backbone.Model);
/// <reference path="../../models/UserInfo.ts"/>
var UserInfoView = (function (_super) {
    __extends(UserInfoView, _super);
    function UserInfoView(options) {
        this.setElement($('div.userInfoWidget'));
        _super.call(this, options);
    }
    UserInfoView.prototype.events = function () {
        return {};
    };
    UserInfoView.prototype.initialize = function () {
        this.template = _.template($('#user-info').html());
        this.model.on('change', this.render, this);
        this.render();
    };
    UserInfoView.prototype.render = function () {
        this.$el.html(this.template(this.model.attributes));
        this.$el.find('input').off('change');
        this.$el.find('input').on('change', this.updateModel.bind(this));
        return this;
    };
    UserInfoView.prototype.updateModel = function (e) {
        var item = $(e.target).attr('id');
        if (item == "dec") {
            this.model.set("money", this.model.attributes.money - parseInt($(e.target).val()));
        }
        else if (item == "inc") {
            this.model.set("money", this.model.attributes.money + parseInt($(e.target).val()));
        }
        else {
            this.model.set(item, $(e.target).val());
        }
    };
    return UserInfoView;
})(Backbone.View);
var Commodity = (function (_super) {
    __extends(Commodity, _super);
    function Commodity() {
        _super.apply(this, arguments);
    }
    //url = '/api/commodity';
    Commodity.prototype.defaults = function () {
        return {
            item: 0,
            buy: 0,
            sell: 0
        };
    };
    Commodity.prototype.getName = function () {
        return commodities[this.attributes.item];
    };
    return Commodity;
})(Backbone.Model);
/// <reference path="Commodity.ts"/>
var CommodityCollection = (function (_super) {
    __extends(CommodityCollection, _super);
    function CommodityCollection() {
        _super.apply(this, arguments);
        this.url = function () {
            var base = '/api/commodity';
            if (!this.station)
                return '';
            return base + '/' + this.station;
        };
    }
    return CommodityCollection;
})(Backbone.Collection);
/// <reference path="CommodityCollection.ts"/>
var Station = (function (_super) {
    __extends(Station, _super);
    function Station() {
        _super.apply(this, arguments);
        this.url = function () {
            var base = '/api/station';
            if (this.isNew()) {
                return base;
            }
            return base + '/' + this.id;
        };
    }
    Station.prototype.defaults = function () {
        return {
            'name': '',
            'system': ''
        };
    };
    Station.prototype.initialize = function () {
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
    };
    Station.prototype.calcRoutes = function () {
        if (!this.collection)
            return;
        var routes = [];
        this.collection.each(function (station) {
            if (station == this)
                return;
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
    };
    Station.prototype.getRoutesTo = function (station) {
        if (this.items.length == 0 || station.items.length == 0)
            return [];
        var routes = [];
        this.items.each(function (item) {
            if (item.attributes.buy == 0)
                return;
            var tradeItem = station.items.findWhere({ item: item.attributes.item });
            if (!tradeItem)
                return;
            if (tradeItem.attributes.sell == 0)
                return;
            var profit = tradeItem.attributes.sell - item.attributes.buy;
            if (profit > 0) {
                var quantity = Math.floor(app.userInfo.attributes.money / item.attributes.buy);
                if (quantity > app.userInfo.attributes.cargo)
                    quantity = app.userInfo.attributes.cargo;
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
    };
    return Station;
})(Backbone.Model);
/// <reference path="Station.ts"/>
var StationCollection = (function (_super) {
    __extends(StationCollection, _super);
    function StationCollection() {
        _super.apply(this, arguments);
        this.url = '/api/station/';
    }
    StationCollection.prototype.parse = function (responce, options) {
        var result = [];
        responce.forEach(function (item) {
            var station = new Station(item);
            if (item.items) {
                station.items.reset(item.items);
            }
            result.push(station);
        });
        return result;
    };
    StationCollection.prototype.calcRoutes = function () {
        this.each(function (station) {
            station.calcRoutes();
        });
    };
    return StationCollection;
})(Backbone.Collection);
var StationListView = (function (_super) {
    __extends(StationListView, _super);
    function StationListView() {
        _super.apply(this, arguments);
    }
    StationListView.prototype.initialize = function () {
        this.template = _.template($('#stationListItem').html());
        this.profitTpl = _.template($('#bestProfitItem').html());
        this.model.on('all', this.render, this);
    };
    StationListView.prototype.render = function () {
        var data = {
            id: this.model.id,
            name: this.model.attributes.name,
            system: this.model.attributes.system,
            count: this.model.items.length
        };
        this.$el.html(this.template(data));
        if (this.model.routes.length > 0) {
            var maxItem = this.model.routes.max(function (item) {
                return item.attributes.profit;
            });
            if (maxItem) {
                this.$el.find('div.bestProfit').html(this.profitTpl(maxItem.attributes));
            }
        }
        return this;
    };
    return StationListView;
})(Backbone.View);
/// <reference path="../../models/StationCollection.ts"/>
/// <reference path="StationListView.ts"/>
var StationCollectionView = (function (_super) {
    __extends(StationCollectionView, _super);
    function StationCollectionView() {
        _super.apply(this, arguments);
    }
    StationCollectionView.prototype.events = function () {
        return {
            'click .toMyList': 'onToMyListClick'
        };
    };
    StationCollectionView.prototype.initialize = function (options) {
        this.app = options.app;
        this.collection.on('add remove sync reset change', this.render, this);
        this.render();
    };
    StationCollectionView.prototype.render = function () {
        this.$el.empty();
        this.collection.each(function (item) {
            var view = new StationListView({
                model: item,
                tagName: 'li',
                className: 'list-group-item inline-list-item'
            });
            this.$el.append(view.render().$el);
        }.bind(this));
        return this;
    };
    StationCollectionView.prototype.onClickShowStation = function (e) {
        e.preventDefault();
        this.trigger('showStation', $(e.target).attr('data-id'));
    };
    StationCollectionView.prototype.onToMyListClick = function (e) {
        e.preventDefault();
        var id = $(e.target).attr('data-id');
        var st = this.app.userStations.findWhere({ sid: id });
        if (!st) {
            this.app.userStations.add(new Backbone.Model({ sid: id }));
        }
        else {
            this.app.userStations.remove(st);
        }
    };
    return StationCollectionView;
})(Backbone.View);
/// <reference path="../../models/StationCollection.ts"/>
/// <reference path="StationListView.ts"/>
var StationMyListView = (function (_super) {
    __extends(StationMyListView, _super);
    function StationMyListView() {
        _super.apply(this, arguments);
    }
    StationMyListView.prototype.initialize = function (options) {
        this.app = options.app;
        this.collection.on('add remove sync reset change', this.render, this);
        this.render();
    };
    StationMyListView.prototype.render = function () {
        this.$el.empty();
        this.collection.each(function (item) {
            var station = this.app.stations.get(item.attributes.sid);
            var view = new StationListView({
                model: station,
                tagName: 'li',
                className: 'list-group-item inline-list-item'
            });
            this.$el.append(view.render().$el);
        }.bind(this));
        return this;
    };
    StationMyListView.prototype.onToMyListClick = function (e) {
        e.preventDefault();
        var id = $(e.target).attr('data-id');
        var st = this.app.userStations.findWhere({ sid: id });
        if (!st) {
            this.app.userStations.add(new Backbone.Model({ sid: id }));
        }
        else {
            this.app.userStations.remove(st);
        }
    };
    return StationMyListView;
})(Backbone.View);
var CommodityView = (function (_super) {
    __extends(CommodityView, _super);
    function CommodityView() {
        _super.apply(this, arguments);
    }
    CommodityView.prototype.events = function () {
        return {
            'click .delete': 'deleteItem',
            'change input': 'updateCommodity'
        };
    };
    CommodityView.prototype.initialize = function () {
        this.itemTpl = _.template($('#commodityItem').html());
        this.collection.on('add remove reset', this.render, this);
    };
    CommodityView.prototype.render = function () {
        this.$el.empty();
        if (this.collection.length > 0) {
            this.collection.each(function (item) {
                this.$el.append(this.itemTpl({
                    id: item.id,
                    name: commodities[item.attributes.item],
                    buy: item.attributes.buy,
                    sell: item.attributes.sell
                }));
            }.bind(this));
        }
        return this;
    };
    CommodityView.prototype.deleteItem = function (e) {
        e.preventDefault();
        var id = $(e.target).parent().parent().parent().attr('data-id');
        var item = this.collection.get(id);
        this.collection.remove(item);
    };
    CommodityView.prototype.updateCommodity = function (e) {
        var tr = $(e.target).parent().parent();
        var id = tr.attr('data-id');
        var item = this.collection.get(id);
        item.set('buy', tr.find('.resBuy').val());
        item.set('sell', tr.find('.resSell').val());
    };
    return CommodityView;
})(Backbone.View);
var RoutesView = (function (_super) {
    __extends(RoutesView, _super);
    function RoutesView() {
        _super.apply(this, arguments);
    }
    RoutesView.prototype.initialize = function () {
        this.template = _.template($('#routeItem').html());
    };
    RoutesView.prototype.render = function () {
        this.$el.empty();
        if (this.collection) {
            if (this.collection.length > 0) {
                var maxItem = {};
                var maxes = {};
                this.collection.each(function (item) {
                    var key = item.attributes.target.id;
                    if (!maxes[key])
                        maxes[key] = 0;
                    if (item.attributes.profit > maxes[key]) {
                        maxes[key] = item.attributes.profit;
                        maxItem[key] = item;
                    }
                });
                this.collection.each(function (item) {
                    var data = item.attributes;
                    data.max = false;
                    if (maxItem[item.attributes.target.id]) {
                        data.max = item == maxItem[item.attributes.target.id];
                    }
                    this.$el.append(this.template(item.attributes));
                }.bind(this));
            }
        }
        return this;
    };
    return RoutesView;
})(Backbone.View);
/// <reference path="CommodityView.ts"/>
/// <reference path="RoutesView.ts"/>
var StationView = (function (_super) {
    __extends(StationView, _super);
    function StationView() {
        _super.apply(this, arguments);
    }
    StationView.prototype.events = function () {
        return {
            'click .addItem': 'addCommodity',
            'click .removeStation': 'removeStation'
        };
    };
    StationView.prototype.initialize = function (options) {
        this.app = options.app;
        this.template = _.template($('#stationItem').html());
        this.model.on('all', this.render, this);
        this.render();
    };
    StationView.prototype.render = function () {
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
    };
    StationView.prototype.addCommodity = function (e) {
        e.preventDefault();
        var data = {
            item: this.$el.find('#addCommodityDialog').find('#commodityId').val(),
            buy: this.$el.find('#addCommodityDialog').find('#commodityBuy').val(),
            sell: this.$el.find('#addCommodityDialog').find('#commoditySell').val()
        };
        this.model.items.add(new Commodity(data));
        this.$el.find('#addCommodityDialog').modal('hide');
    };
    StationView.prototype.removeStation = function (e) {
        e.preventDefault();
        if (confirm('Remove?') && !this.model.isNew()) {
            this.model.destroy();
            this.$el.empty();
        }
    };
    return StationView;
})(Backbone.View);
/// <reference path="widgets/StationCollectionView.ts"/>
/// <reference path="widgets/StationMyListView.ts"/>
/// <reference path="widgets/StationView.ts"/>
var DefaultPageView = (function (_super) {
    __extends(DefaultPageView, _super);
    function DefaultPageView(options) {
        this.app = options.app;
        _super.call(this, options);
        this.template = _.template($('#defaultPage').html());
        this.app.userInfo.on('change', this.render, this);
    }
    DefaultPageView.prototype.render = function () {
        this.$el.html(this.template());
        var list = new StationCollectionView({
            el: this.$el.find('ul.allStations'),
            collection: this.app.stations,
            app: this.app
        });
        var myList = new StationMyListView({
            el: this.$el.find('ul.myStations'),
            collection: this.app.userStations,
            app: this.app
        });
        return this;
    };
    return DefaultPageView;
})(Backbone.View);
var EditStationView = (function (_super) {
    __extends(EditStationView, _super);
    function EditStationView(options) {
        this.app = options.app;
        _super.call(this, options);
        this.template = _.template($('#stationForm').html());
        if (!this.model) {
            this.model = new Station();
        }
    }
    EditStationView.prototype.events = function () {
        return {
            'submit form': 'onSubmitForm'
        };
    };
    EditStationView.prototype.render = function () {
        this.$el.html(this.template(this.model.attributes));
        return this;
    };
    EditStationView.prototype.onSubmitForm = function (e) {
        e.preventDefault();
        var name = $(e.target).find('#st-name').val();
        var system = $(e.target).find('#st-system').val();
        if (name.length == 0 || system.length == 0) {
            alert('Can`t be empty');
            return;
        }
        this.model.set('name', name);
        this.model.set('system', system);
        if (this.model.isNew()) {
            this.model.save();
            this.app.stations.add(this.model);
        }
        else {
            this.model.save();
        }
        this.app.navigate('', { trigger: true });
    };
    return EditStationView;
})(Backbone.View);
var SingleStationView = (function (_super) {
    __extends(SingleStationView, _super);
    function SingleStationView(options) {
        this.app = options.app;
        _super.call(this, options);
        this.app.userInfo.on('change', this.render, this);
    }
    SingleStationView.prototype.render = function () {
        this.$el.empty();
        var view = new StationView({
            app: this.app,
            el: this.$el,
            model: this.model
        });
        return this;
    };
    return SingleStationView;
})(Backbone.View);
var StationIdCollection = (function (_super) {
    __extends(StationIdCollection, _super);
    function StationIdCollection() {
        _super.apply(this, arguments);
        this.localStorage = new Store("station-props");
    }
    StationIdCollection.prototype.initialize = function (options) {
        this.app = options.app;
        this.listedStations = new Backbone.Collection();
    };
    /*each(iterator: (element: Station, index: number, list?: any) => void, context?: any) {
        return super.each(function(item:any, index:number) {
            console.log(item, this);
            iterator(this.getStation(item.attributes.sid), index);
        }, this);
    }*/
    StationIdCollection.prototype.calcRoutes = function () {
        this.listedStations.reset();
        this.each(function (item) {
            var station = this.getStation(item.attributes.sid);
            this.listedStations.add(station);
        }.bind(this));
        this.listedStations.each(function (station) {
            station.calcRoutes();
        });
    };
    StationIdCollection.prototype.getStation = function (id) {
        return this.app.stations.get(id);
    };
    StationIdCollection.prototype.getStations = function () {
        return this.listedStations;
    };
    return StationIdCollection;
})(Backbone.Collection);
/// <reference path="../../src/d.ts/backbone.d.ts"/>
/// <reference path="../../src/d.ts/bootstrap.d.ts"/>
/// <reference path="views/RaresView.ts"/>
/// <reference path="views/widgets/UserInfoView.ts"/>
/// <reference path="views/DefaultPageView.ts"/>
/// <reference path="views/EditStationView.ts"/>
/// <reference path="views/SingleStationView.ts"/>
/// <reference path="models/StationCollection.ts"/>
/// <reference path="models/StationIdCollection.ts"/>
var Application = (function (_super) {
    __extends(Application, _super);
    function Application(options) {
        _super.call(this, options);
        Backbone.history.start();
    }
    Application.prototype.routes = function () {
        return {
            '': 'defaultPage',
            'start': 'startPage',
            'edit(/:id)': 'editStation',
            'station/:id': 'showStation',
            'rares': 'showRares'
        };
    };
    Application.prototype.initialize = function () {
        this.userInfo = new UserInfo({ id: 'user-info' });
        var userInfoView = new UserInfoView({ model: this.userInfo });
        this.userInfo.fetch({
            success: function () {
                this.attributes.average = 0;
            }.bind(this.userInfo)
        });
        this.stations = new StationCollection();
        this.stations.fetch({
            success: function () {
                this.stations.calcRoutes();
            }.bind(this)
        });
        this.userStations = new StationIdCollection([], {
            app: this
        });
        this.userStations.fetch({
            success: function () {
                this.userStations.calcRoutes();
            }.bind(this)
        });
        this.userInfo.on('change', function () {
            this.stations.calcRoutes();
        }.bind(this));
    };
    Application.prototype.defaultPage = function () {
        this.navigate("start", { trigger: true, replace: true });
    };
    Application.prototype.startPage = function () {
        var view = new DefaultPageView({
            el: $('#content'),
            app: this
        });
        view.render();
    };
    Application.prototype.editStation = function (id) {
        if (id) {
            var view = new EditStationView({
                model: this.stations.get(id),
                el: $('#content'),
                app: this
            });
            view.render();
        }
        else {
            var view = new EditStationView({ el: $('#content'), app: this });
            view.render();
        }
    };
    Application.prototype.showStation = function (id) {
        var station = this.stations.get(id);
        if (!station) {
            this.navigate('', { trigger: true });
            return;
        }
        var view = new SingleStationView({
            el: $('#content'),
            app: this,
            model: station
        });
        view.render();
    };
    Application.prototype.showRares = function () {
        var view = new RaresView();
        view.render();
    };
    return Application;
})(Backbone.Router);
