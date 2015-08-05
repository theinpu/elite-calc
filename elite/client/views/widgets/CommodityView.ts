class CommodityView extends Backbone.View<Commodity> {

    collection:CommodityCollection;

    itemTpl;

    events() {
        return {
            'click .delete': 'deleteItem',
            'change input': 'updateCommodity'
        }
    }

    initialize() {
        this.itemTpl = _.template($('#commodityItem').html());
        this.collection.on('add remove reset', this.render, this);
    }

    render() {
        this.$el.empty();
        if (this.collection.length > 0) {
            this.collection.each(function (item:Commodity) {
                this.$el.append(this.itemTpl({
                    id: item.id,
                    name: commodities[item.attributes.item],
                    buy: item.attributes.buy,
                    sell: item.attributes.sell
                }));
            }.bind(this));
        }
        return this;
    }

    private deleteItem(e:JQueryEventObject) {
        e.preventDefault();
        var id = $(e.target).parent().parent().parent().attr('data-id');
        var item = this.collection.get(id);
        this.collection.remove(item);
    }

    private updateCommodity(e:JQueryEventObject) {
        var tr = $(e.target).parent().parent();
        var id = tr.attr('data-id');
        var item = this.collection.get(id);
        item.set('buy', tr.find('.resBuy').val());
        item.set('sell', tr.find('.resSell').val());
    }

}

declare var commodities;