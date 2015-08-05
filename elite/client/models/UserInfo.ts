/// <reference path="../../../src/d.ts/localStorage.d.ts"/>

class UserInfo extends Backbone.Model {

    localStorage;

    defaults() {
        return {
            cargo: 0,
            money: 0
        }
    }

    constructor(attributes?:any, options?:any) {
        super(attributes, options);
        this.localStorage = new Store('local');
        this.on('change', function() {
            this.save();
        }, this);
    }

}