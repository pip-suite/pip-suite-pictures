// configured Rest resource
function configAvatarResources(pipRestProvider: pip.rest.IRestProvider) {
    pipRestProvider.registerOperation('avatars', '/api/1.0/avatars/:avatar_id');
}

angular
    .module('pipPictures.Rest')
    .config(configAvatarResources);


