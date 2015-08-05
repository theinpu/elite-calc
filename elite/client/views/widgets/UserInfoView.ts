/// <reference path="../../models/UserInfo.ts"/>

class UserInfoView extends Backbone.View<UserInfo> {

    model:UserInfo;

    template;

    events() {
        return {
            /*'change input': 'updateModel'*/
        }
    }

    constructor(options?:any) {
        this.setElement($('div.userInfoWidget'));
        super(options);
    }

    initialize() {
        this.template = _.template($('#user-info').html());
        this.model.on('change', this.render, this);
        this.render();
    }

    render() {
        this.$el.html(this.template(this.model.attributes));
        this.$el.find('input').off('change');
        this.$el.find('input').on('change', this.updateModel.bind(this));
        return this;
    }

    private updateModel(e:JQueryEventObject) {
        var item = $(e.target).attr('id');
        if(item == "dec") {
            this.model.set("money", this.model.attributes.money - parseInt($(e.target).val()));
        }
        else if(item == "inc") {
            this.model.set("money", this.model.attributes.money + parseInt($(e.target).val()));
        } else {
            this.model.set(item, $(e.target).val());
        }
    }

}