// configured Rest resource
function configPictureResources(pipRestProvider: pip.rest.IRestProvider) {
    pipRestProvider.registerPagedCollection('picture', '/api/1.0/blobs/:picture_id',
        { blob_id: '@picture_id' },
        {
            page: { method: 'GET', isArray: false },
            update: { method: 'PUT' }
        });
    pipRestProvider.registerResource('picturesInfo', '/api/1.0/blobs/:picture_id/info');
}

angular
    .module('pipPictures.Rest')
    .config(configPictureResources);


