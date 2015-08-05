class EditStationView extends Backbone.View<Station> {

    model:Station;
    app:Application;
    template;

    events() {
        return {
            'submit form': 'onSubmitForm'
        }
    }

    constructor(options?:any) {
        this.app = options.app;
        super(options);
        this.template = _.template($('#stationForm').html());
        if (!this.model) {
            this.model = new Station();
        }
    }

    render() {
        this.$el.html(this.template(this.model.attributes));
        return this;
    }

    private onSubmitForm(e:JQueryEventObject) {
        e.preventDefault();
        var name = $(e.target).find('#st-name').val();
        var system = $(e.target).find('#st-system').val();

        if (name.length == 0 || system.length == 0) {
            alert('Can`t be empty');
            return;
        }

        this.model.set('name', name);
        this.model.set('system', system);

        if (this.model.isNew()) {
            this.model.save();
            this.app.stations.add(this.model);
        } else {
            this.model.save();
        }

        this.app.navigate('', {trigger: true});
    }

}