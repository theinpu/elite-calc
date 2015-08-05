/**
 * Created by anubis on 06.02.2015.
 */

class AddNewPage extends Backbone.View<Station> {

    model:Station;

    template;
    app:Application;

    events() {
        return {
            'submit #addNew_form': 'onFormSubmit'
        }
    }

    constructor(options?:any) {
        options = options || {};
        super(options);
        this.app = options.app;
        this.setElement($('#content'));
        this.template = _.template($('#addNew_page').html());
        this.model = options.model || new Station();
        this.model.on('change', this.render, this);
        _.extend(this, Backbone.Events);
    }

    render() {
        this.$el.html(this.template({
            station: this.model.attributes.station,
            system: this.model.attributes.system
        }));
        return this;
    }

    private onFormSubmit(e:JQueryEventObject) {
        e.preventDefault();
        var form = $(e.target);
        var name = form.find('#st-name').val();
        if(name.length > 0) {
            this.model.set('station', name);
        }
        var system = form.find('#st-system').val();
        if(system.length > 0) {
            this.model.set('system', system);
        }

        if(name.length == 0 || system.length == 0) {
            alert('empty field');
        } else {
            this.trigger('add', this.model);
        }
    }

}