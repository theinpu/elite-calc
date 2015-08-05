/// <reference path="widgets/StationCollectionView.ts"/>
/// <reference path="widgets/StationMyListView.ts"/>
/// <reference path="widgets/StationView.ts"/>

class DefaultPageView extends Backbone.View<Backbone.Model> {

    app:Application;
    template;

    constructor(options?:any) {
        this.app = options.app;
        super(options);
        this.template = _.template($('#defaultPage').html());
        this.app.userInfo.on('change', this.render, this);
    }

    render() {
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
    }

}
