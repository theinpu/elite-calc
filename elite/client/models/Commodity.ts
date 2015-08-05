class Commodity extends Backbone.Model {

    //url = '/api/commodity';

    defaults() {
        return {
            item: 0,
            buy: 0,
            sell: 0
        }
    }

    public getName() {
        return commodities[this.attributes.item];
    }

}

declare var commodities;