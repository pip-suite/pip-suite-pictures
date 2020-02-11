
(function (angular) {
    'use strict';

    var thisModule = angular.module('appPictures',
        [
            'pipSampleConfig',
            // 3rd Party Modules
            'ui.router', 'ui.utils', 'ngResource', 'ngAria', 'ngCookies', 'ngSanitize', 'ngMessages',
            'ngMaterial', 'wu.masonry', 'LocalStorageModule', 'ngAnimate',
            // Modules from WebUI Framework
            'pipCommonRest', 'pipControls', 'pipPictures', 'pipSelected', 'pipTheme', 
            'pipDropdown', 'pipLayout', 'pipEntry',
            // Sample Application Modules
            'appPictures.Collage', 'appPictures.CollageResize',
            'appPictures.Picture', 'appPictures.Pictures', 
            'appPictures.Avatar'
        ]
    );

    thisModule.controller('AppController',
        function ($scope, pipNavService, $timeout, $state, pipSession, $http, $rootScope, pipRest) {
            $scope.serverUrl = 'http://tracker.pipservices.net';
            $scope.name = 'Sampler User';
            $scope.login = 'Stas';
            $scope.password = '123456';

            $scope.pages = [
                {
                    title: 'Avatar',
                    state: 'avatar',
                    url: '/avatar',
                    controller: 'AvatarController',
                    templateUrl: 'avatars.html'
                },
                {
                    title: 'Collage',
                    state: 'collage',
                    url: '/collage',
                    controller: 'CollageController',
                    templateUrl: 'collage.html'
                },
                {
                    title: 'Collage Resizing',
                    state: 'collage_resize',
                    url: '/collage_resize',
                    controller: 'CollageResizeController',
                    templateUrl: 'collage_resize.html'
                },
                {
                    title: 'Picture',
                    state: 'picture',
                    url: '/picture',
                    controller: 'PictureController',
                    templateUrl: 'picture.html'
                },
                {
                    title: 'Picture List',
                    state: 'pictures',
                    url: '/pictures',
                    controller: 'PicturesController',
                    templateUrl: 'pictures.html'
                }
            ];

            $scope.selected = {};
            $timeout(() => {
                $scope.selected.pageIndex = _.findIndex($scope.pages, { state: $state.current.name });
                if ($scope.selected.pageIndex == -1) {
                    $scope.selected.pageIndex = 0;
                }
                $scope.selected.state = $scope.pages[$scope.selected.pageIndex].state;
            });

            $scope.sampleAccount = {
                login: 'stas@test.ru',
                password: '123456'
            }

            $scope.onSignin = function () {
                $scope.processing = true;
                pipRest.getResource('signin').call({
                    login: $scope.login,
                    password: $scope.password
                },
                    (data) => {
                        console.log('Session Opened', data);
                        pipRest.setHeaders({
                            'x-session-id': data.id
                        });
                        $http.defaults.headers.common['x-session-id'] = data.id;
                        console.log('headers', $http.defaults.headers.common['x-session-id']);
                        // $http.defaults.headers.common['session-id'] = sessionId;
                        let session = {
                            sessionId: data.id,
                            userId: data.user_id
                        }
                        pipSession.open(session);
                        $scope.processing = false;

                    },
                    (error) => {
                        $scope.processing = false;
                    });

            }


            $scope.onNavigationSelect = function (state) {
                $state.go(state);
                $scope.selected.pageIndex = _.findIndex($scope.pages, { state: state });
                if ($scope.selected.pageIndex == -1) {
                    $scope.selected.pageIndex = 0;
                }
                $scope.selected.state = $scope.pages[$scope.selected.pageIndex].state;
            };

            $scope.onDropdownSelect = function (obj) {
                if ($state.current.name !== obj.state) {
                    $state.go(obj.state);
                }
            };

            $scope.isEntryPage = () => {
                return $state.current.name === 'signin' || $state.current.name === 'signup' ||
                    $state.current.name === 'recover_password' || $state.current.name === 'post_signup';
            };

            $scope.onSignin();

        }
    );
})(window.angular);
