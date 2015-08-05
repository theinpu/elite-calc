class StationListView extends Backbone.View<Station> {

    model:Station;
    template;
    profitTpl;

    initialize() {
        this.template = _.template($('#stationListItem').html());
        this.profitTpl = _.template($('#bestProfitItem').html());
        this.model.on('all', this.render, this);
    }

    render() {
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
    }

}
