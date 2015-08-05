/// <reference path="views/ItemListView.ts"/>

class StationOverviewPage extends Backbone.View<Station> {

    model:Station;
    template;
    app:Application;

    events() {
        return {
            "click .goBack": 'goBack',
            'click .deleteStation': 'deleteItem',
            'click a.addItem': 'addItem',
            'submit #addResourceItem_form': 'onFormSubmit',
            'reset #addResourceItem_form': 'onFormReset'
        }
    }

    constructor(options?:any) {
        super(options);
        this.app = options.app;
        this.setElement($('#content'));
        this.template = _.template($('#station_overview').html());
        this.model.on('change:items', this.renderItems, this);
        this.app.resources.on('sync', this.renderResSelector, this);
    }

    render() {
        this.$el.html(this.template(this.model.attributes));
        this.renderResSelector();
        this.renderItems();
        return this;
    }

    private renderItems() {
        var tbody = this.$el.find('#items tbody');
        if(this.model.items.length > 0) {
            tbody.empty();
            this.model.items.each(function(item:TradeItem) {
                var view = new ItemListItemView({model: item, app: this.app});
                view.model.on('change', function() {
                    this.model.trigger('change');
                }.bind(this));
                tbody.append(view.render().$el);
            }.bind(this));
        }
    }

    private renderResSelector() {
        var selector = this.$el.find('select#resourceType');
        if (this.app.resources.length > 0) {
            this.app.resources.each(function (res:Resource) {
                selector.append('<option value="' + res.id + '">' + res.attributes.name + '</option>');
            }.bind(this));
        }
    }

    private goBack(e:JQueryEventObject) {
        e.preventDefault();
        this.app.navigate('', {trigger: true});
    }

    private deleteItem(e:JQueryEventObject) {
        e.preventDefault();
        if (confirm("Delete?")) {
            this.model.destroy();
            this.app.navigate('', {trigger: true, replace: true});
        }
    }

    private addItem(e:JQueryEventObject) {
        e.preventDefault();
        this.$el.find('#resForm').slideDown(30);
    }

    private onFormSubmit(e:JQueryEventObject) {
        e.preventDefault();

        var form = this.$el.find('form');
        var res = form.find('#resourceType').val();
        var buy = parseInt(form.find('#resBuy').val()) || 0;
        var sell = parseInt(form.find('#resSell').val()) || 0;

        var item = new TradeItem({
            station_id: this.model.id,
            resource: this.app.resources.get(res),
            buy: buy,
            sell: sell
        });

        this.model.items.add(item);
        item.save();

        this.$el.find('#resForm').slideUp(30);
    }

    private onFormReset(e:JQueryEventObject) {
        e.preventDefault();
        this.$el.find('#resForm').slideUp(30);
    }

}
