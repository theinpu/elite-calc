/// <reference path="../../models/Resource.ts"/>

class ResourceListItemView extends Backbone.View<Resource> {

    model:Resource;
    template;
    app:Application;

    constructor(options?:any) {
        this.tagName = 'li';
        this.className = 'list-group-item';
        this.app = options.app;
        super(options);
    }

    initialize(options?:any) {
        this.template = _.template($("#resource_item").html());
        this.model.on('change', this.render, this);
    }

    render() {
        this.$el.html(this.template(this.model.attributes));
        return this;
    }

}
