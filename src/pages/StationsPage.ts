
class StationsPage extends Backbone.View<Backbone.Model> {

    collection:StationCollection;
    template;

    events() {
        return {
            'click a.addItem': 'addItem'
        }
    }

    constructor(options?:any) {
        super(options);
        this.setElement($('#content'));
        this.template = _.template($('#stations_page').html());
    }

    render() {
        this.$el.html(this.template());
        return this;
    }

    private addItem(e:JQueryEventObject) {
        e.preventDefault();
    }

}