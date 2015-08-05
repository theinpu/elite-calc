/// <reference path="../../models/TradeItem.ts"/>

class ItemListItemView extends Backbone.View<TradeItem> {

    model:TradeItem;
    template;
    app:Application;

    events() {
        return {
            'click a.delete': 'deleteItem',
            'click a.routes': 'showRoutes',
            'focus input.resBuy': 'startEditBuy',
            'blur input.resBuy': 'stopEditBuy',
            'keypress input.resBuy': 'stopEditBuy',
            'focus input.resSell': 'startEditSell',
            'blur input.resSell': 'stopEditSell',
            'keypress input.resSell': 'stopEditSell'
        }
    }

    constructor(options?:any) {
        this.tagName = 'tr';
        super(options);
        this.app = options.app;
    }

    initialize(options?:any) {
        this.template = _.template($("#trade_item").html());
    }

    render() {
        var name = this.model.get('resource').name || this.model.get('resource').get('name');
        this.$el.html(this.template({
            name: name,
            buy: this.model.attributes.buy,
            sell: this.model.attributes.sell
        }));
        return this;
    }

    private deleteItem(e:JQueryEventObject) {
        e.preventDefault();
        if(confirm('Delete?')) {
            this.model.destroy();
        }
    }

    private startEditBuy(e:JQueryEventObject) {
        e.preventDefault();
        $(e.target).select();
    }

    private stopEditBuy(e:JQueryEventObject) {
        if(e.which == 0 || e.which == 13) {
            var buy = parseInt(this.$el.find('input.resBuy').val()) || 0;
            this.model.set('buy', buy);
            this.model.save();
        }
    }

    private startEditSell(e:JQueryEventObject) {
        e.preventDefault();
        $(e.target).select();
    }

    private stopEditSell(e:JQueryEventObject) {
        if(e.which == 0 || e.which == 13) {
            var sell = parseInt(this.$el.find('input.resSell').val()) || 0;
            this.model.set('sell', sell);
            this.model.save();
        }
    }

    private showRoutes(e:JQueryEventObject) {
        e.preventDefault();
    }

}
