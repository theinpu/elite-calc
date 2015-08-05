/**
 * Created by anubis on 06.02.2015.
 */

/// <reference path="../d.ts/backbone.d.ts"/>
/// <reference path="TradeItem.ts"/>

class ItemCollection extends Backbone.Collection<TradeItem> {

    localStorage;

    constructor(models?:TradeItem[], options?:any) {
        options = options || {};
        this.localStorage = new Store(options.store);
        super(models, options);
    }

    parse(response:any, options?:any) {
        var result = [];

        response.forEach(function (item) {
            item.resource = new Resource(item.resource);
            result.push(new TradeItem(item));
        });

        return result;
    }

    public getByRes(resource:Resource):TradeItem {
        var result = undefined;
        this.each(function(item:TradeItem) {
            if(result) return;
            if(item.attributes.resource.id == resource.id) {
                result = item;
            }
        }.bind(this));
        return result;
    }

}