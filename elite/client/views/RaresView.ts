/**
 * Created by anubis on 08.02.2015.
 */

class RaresView extends Backbone.View<Backbone.Model> {

    collection:RareCollection;
    rareTpl;
    rareItemTpl;

    constructor(options?:any) {
        super(options);
        this.setElement($('#content'));

        this.rareTpl = _.template($('#rares').html());
        this.rareItemTpl = _.template($('#rare-item').html());
        this.collection = new RareCollection(Rares);
        this.collection = this.collection.sort();
    }

    render() {
        this.$el.empty();

        this.$el.append($(this.rareTpl()));
        var rareHolder = this.$el.find('.list-group');

        this.collection.each(function(item) {
            rareHolder.append(this.rareItemTpl(item.attributes));
        }.bind(this));

        return this;
    }

}

class RareCollection extends Backbone.Collection<Backbone.Model> {

    comparator(first:any, second?:any):number {
        return parseInt(first.get('buy')) > parseInt(second.get('buy')) ? -1 : 1;
    }

}

declare var Rares;