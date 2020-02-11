// configured Rest resource
function configImageSetResources(pipRestProvider: pip.rest.IRestProvider) {
    pipRestProvider.registerPagedCollection('imagesets', '/api/1.0/imagesets/:imageset_id',
        { imageset_id: '@imageset_id' },
        {
            page: {method: 'GET', isArray: false},
            update: { method: 'PUT' }
        });
}

angular
    .module('pipPictures.Rest')
    .config(configImageSetResources);