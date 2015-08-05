class RoutesView extends Backbone.View<Backbone.Model> {

    template;

    initialize() {
        this.template = _.template($('#routeItem').html());
    }

    render() {
        this.$el.empty();
        if (this.collection) {
            if (this.collection.length > 0) {
                var maxItem = {};
                var maxes = {};
                this.collection.each(function(item) {
                    var key = item.attributes.target.id;
                    if(!maxes[key]) maxes[key] = 0;
                    if(item.attributes.profit > maxes[key]) {
                        maxes[key] = item.attributes.profit;
                        maxItem[key] = item;
                    }
                });
                this.collection.each(function (item) {
                    var data = item.attributes;
                    data.max = false;
                    if(maxItem[item.attributes.target.id]) {
                        data.max = item == maxItem[item.attributes.target.id];
                    }
                    this.$el.append(this.template(item.attributes));
                }.bind(this));
            }
        }
        return this;
    }

}