/// <reference path="../../src/d.ts/backbone.d.ts"/>
/// <reference path="../../src/d.ts/bootstrap.d.ts"/>
/// <reference path="views/RaresView.ts"/>
/// <reference path="views/widgets/UserInfoView.ts"/>
/// <reference path="views/DefaultPageView.ts"/>
/// <reference path="views/EditStationView.ts"/>
/// <reference path="views/SingleStationView.ts"/>

/// <reference path="models/StationCollection.ts"/>
/// <reference path="models/StationIdCollection.ts"/>

class Application extends Backbone.Router {

    public userInfo:UserInfo;
    public stations:StationCollection;
    public userStations:StationIdCollection;

    routes() {
        return {
            '': 'defaultPage',
            'start': 'startPage',
            'edit(/:id)': 'editStation',
            'station/:id': 'showStation',
            'rares': 'showRares'
        }
    }

    constructor(options?:Backbone.RouterOptions) {
        super(options);
        Backbone.history.start();
    }

    initialize() {
        this.userInfo = new UserInfo({id: 'user-info'});
        var userInfoView = new UserInfoView({model: this.userInfo});
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
            success: function() {
                this.userStations.calcRoutes();
            }.bind(this)
        });

        this.userInfo.on('change', function () {
            this.stations.calcRoutes();
        }.bind(this));
    }

    defaultPage() {
        this.navigate("start", {trigger: true, replace: true});
    }

    startPage() {
        var view = new DefaultPageView({
            el: $('#content'),
            app: this
        });
        view.render();
    }

    editStation(id?) {
        if (id) {
            var view = new EditStationView({
                model: this.stations.get(id),
                el: $('#content'),
                app: this
            });
            view.render();

        } else {
            var view = new EditStationView({el: $('#content'), app: this});
            view.render();
        }
    }

    showStation(id) {
        var station = this.stations.get(id);
        if (!station) {
            this.navigate('', {trigger: true});
            return;
        }

        var view = new SingleStationView({
            el: $('#content'),
            app: this,
            model: station
        })
        view.render();
    }

    showRares() {
        var view = new RaresView();
        view.render();
    }

}