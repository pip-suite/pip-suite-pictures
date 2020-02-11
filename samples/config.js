/**
 * @file Global configuration for sample application
 * @copyright Digital Living Software Corp. 2014-2016
 */

(function (angular) {
    'use strict';


    var thisModule = angular.module('pipSampleConfig', ['pipCommonRest', 'pipNav', 'pipPictures']);


    // Configure application services before start
    thisModule.config(
        function ($mdThemingProvider, $stateProvider, $urlRouterProvider, pipAuthStateProvider, pipTranslateProvider,
            pipRestProvider, pipNavMenuProvider, pipActionsProvider, $mdIconProvider,
            pipAvatarDataProvider, pipPictureDataProvider
            ) {


            var content = [
                {
                    title: 'Avatar',
                    state: 'avatar',
                    url: '/avatar',
                    auth: false,
                    controller: 'AvatarController',
                    templateUrl: 'avatars_sample/avatars.html'
                },
                {
                    title: 'Collage',
                    state: 'collage',
                    url: '/collage',
                    auth: false,
                    controller: 'CollageController',
                    templateUrl: 'collage_sample/collage.html'
                },
                {
                    title: 'Collage Resizing',
                    state: 'collage_resize',
                    url: '/collage_resize',
                    auth: false,
                    controller: 'CollageResizeController',
                    templateUrl: 'collage_resizing_sample/collage_resize.html'
                },
                {
                    title: 'Picture',
                    state: 'picture',
                    url: '/picture',
                    auth: false,
                    controller: 'PictureController',
                    templateUrl: 'picture_sample/picture.html'
                },
                {
                    title: 'Picture List',
                    state: 'pictures',
                    url: '/pictures',
                    auth: false,
                    controller: 'PicturesController',
                    templateUrl: 'pictures_sample/pictures.html'
                }
            ], contentItem, i;

            $mdIconProvider.iconSet('icons', 'images/icons.svg', 512);

            pipActionsProvider.globalSecondaryActions = [
                { name: 'global.signout', title: 'SIGNOUT', state: 'signout' }
            ];

            // String translations
            pipTranslateProvider.translations('en', {
                PICTURE_CONTROLS: 'Picture Controls',
                CODE: 'Code',
                SAMPLE: 'sample'
            });

            pipTranslateProvider.translations('ru', {
                PICTURE_CONTROLS: 'Контролы для работы с изображениями',
                CODE: 'Код',
                SAMPLE: 'пример'
            });
            
            pipAuthStateProvider.unauthorizedState = 'signin';
            pipAuthStateProvider.signinState = 'signin';
            pipAuthStateProvider.signoutState = 'signin';
            pipAuthStateProvider.authorizedState = 'avatar';
            $urlRouterProvider.otherwise('/avatar');

            // Configure REST API
            pipRestProvider.serverUrl = 'http://alpha.pipservices.net';

            // avatar options
            pipAvatarDataProvider.ShowOnlyNameIcon = false;
            pipAvatarDataProvider.DefaultInitial = '?';
            pipAvatarDataProvider.AvatarRoute = '/api/1.0/blobs';
            // picture options 
            pipPictureDataProvider.ShowErrorIcon = true;

            for (i = 0; i < content.length; i++) {
                contentItem = content[i];
                $stateProvider.state(contentItem.state, contentItem);
            }

            $urlRouterProvider.otherwise('/avatar');

            // Configure navigation menu

            pipNavMenuProvider.sections = [
                {
                    links: [{ title: 'PICTURE_CONTROLS', url: '/avatar' }]
                },
                {
                    links: [{ title: 'SIGNOUT', url: '/signout' }]
                }
            ];

        }
    );

})(window.angular);

