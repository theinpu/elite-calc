/// <reference path="Resource.ts"/>

class ResourceCollection extends Backbone.Collection<Resource> {

    public firstRun:boolean = true;
    collection:Resource[];

    localStorage = new Store("elite-resources");

    constructor(models?: Station[], options?: any) {
        super(models, options);

        this.on('sync', function() {
            this.firstRun = false;
        }.bind(this));
    }

    parse(response: any, options?: any) {
        var result = [];

        response.forEach(function(item) {
            result.push(new Resource(item));
        });

        return result;
    }
}