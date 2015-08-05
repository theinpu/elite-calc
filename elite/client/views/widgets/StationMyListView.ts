/// <reference path="../../models/StationCollection.ts"/>
/// <reference path="StationListView.ts"/>

class StationMyListView extends Backbone.View<Backbone.Model> {

    collection:StationCollection;
    app:Application;

    initialize(options?:any) {
        this.app = options.app;
        this.collection.on('add remove sync reset change', this.render, this);
        this.render();
    }

    render() {
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
    }

    private onToMyListClick(e:any) {
        e.preventDefault();
        var id = $(e.target).attr('data-id');
        var st = this.app.userStations.findWhere({sid: id});
        if(!st) {
            this.app.userStations.add(new Backbone.Model({sid: id}));
        } else {
            this.app.userStations.remove(st);
        }
    }

}
