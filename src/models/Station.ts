/**
 * Created by anubis on 06.02.2015.
 */

/// <reference path="../d.ts/backbone.d.ts"/>
/// <reference path="ItemCollection.ts"/>

class Station extends Backbone.Model {

    public items:ItemCollection;

    defaults() {
        return {
            system: '',
            station: ''
        }
    }

    constructor(attributes?:any, options?:any) {
        super(attributes, options);
        this.items = new ItemCollection([], {
            store: 'st-items-' + this.id
        });
        if (attributes) {
            if (attributes.items) {
                this.items.reset(attributes.items, {parse: true});
            } else {
                this.items.fetch();
            }
        }
        this.items.on('add remove change', function(item:TradeItem) {
            this.trigger('change:items', this, item);
        }.bind(this));
    }

    /*fetch(options?: any) {
        console.log('fetch');
        this.items.fetch(options);
        return super.fetch(options);
    }*/

    /*save(attributes?: any, options?: any) {
        this.items.sync('update');
        return super.save(attributes, options);
    }*/

}