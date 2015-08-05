
class SingleStationView extends Backbone.View<Station> {

    app:Application;

    constructor(options?:any) {
        this.app = options.app;
        super(options);
        this.app.userInfo.on('change', this.render, this);
    }

    render() {
        this.$el.empty();

        var view = new StationView({
            app: this.app,
            el: this.$el,
            model: this.model
        });

        return this;
    }

}