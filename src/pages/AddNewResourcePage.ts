class AddNewResourcePage extends Backbone.View<Resource> {

    model:Resource;
    template;

    private app:Application;

    events() {
        return {
            'submit #addNewRes_form': 'onFormSubmit'
        }
    }

    constructor(options?:any) {
        super(options);
        this.app = options.app;
        this.setElement($('#content'));
        this.template = _.template($('#addNewResource_page').html());
        this.model = new Resource();
    }

    render() {
        this.$el.html(this.template());
        return this;
    }

    private onFormSubmit(e:JQueryEventObject) {
        e.preventDefault();
        this.model.set('name', $(e.target).find('#res-name').val());

        this.app.resources.add(this.model);
        this.model.save({}, {
            success: function () {
                this.navigate('', {trigger: true});
            }.bind(this.app)
        });
    }
}

declare var app:Application;