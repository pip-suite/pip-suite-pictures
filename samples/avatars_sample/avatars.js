(function (angular) {
    'use strict';

    var thisModule = angular.module('appPictures.Avatar', []);

    thisModule.config(function (pipTranslateProvider) {
        pipTranslateProvider.translations('en', {
            PARTY_ENTITY_AVATAR_EDIT: 'Party and entity avatar edit control',
            RESET: 'Reset',
            DISABLED: 'Disabled',
            DISABLE_RESET: 'Disable reset',
            ENABLE_RESET: 'Enable reset',
            ENABLE_DISABLE: 'Enable/disable',
            AVATARS_FOR_USER_WITH_IMAGES: 'Avatars for users with images',
            UPDATE_AVATAR: 'Update avatar',
            AVATARS_FOR_USERS_WITHOUT_IMAGES: 'Avatars for users without images',
            AVATARS_FOR_ENTITIES_WITHOUT_IMAGES: 'Avatars for entities without images',
            AVATARS_FOR_ENTITIES_WITH_IMAGES: 'Avatars for entities with images',
            AVATAR_GIANT: 'Giant avatar'
        });
        pipTranslateProvider.translations('ru', {
            EDIT: 'изменить',
            PARTY_ENTITY_AVATAR_EDIT: 'Контрол изменения аватара пользователя или сущности',
            RESET: 'Сброс',
            DISABLED: 'Отключен',
            DISABLE_RESET: 'Отключить сброс',
            ENABLE_RESET: 'Включить сброс',
            ENABLE_DISABLE: 'Включить/отключить контрол',
            AVATARS_FOR_USER_WITH_IMAGES: 'Аватары пользователей с изображением',
            UPDATE_AVATAR: 'Обновить аватар',
            AVATARS_FOR_USERS_WITHOUT_IMAGES: 'Аватары пользователей без изображений',
            AVATARS_FOR_ENTITIES_WITHOUT_IMAGES: 'Аватары сущностей без изображений',
            AVATARS_FOR_ENTITIES_WITH_IMAGES: 'Аватары сущностей с изображением',
            AVATAR_GIANT: 'Большие аватары'
        });
    });

    thisModule.controller('AvatarController',
        function ($scope, $rootScope) {
            $scope.avatars = [
                {
                    id: '0044191e68ba450180f2afed415deecc',
                    name: '7330.jpg'
                },
                {
                    id: '2de4b99b5a1643c99a5a6cad05f77323',
                    name: 'flower-631765_960_720.jpg'
                },
                {
                    id: null,
                    name: 'flower-631765_960_720.jpg',
                    uri: 'http://www.rd.com/wp-content/uploads/sites/2/2016/04/01-cat-wants-to-tell-you-laptop.jpg'
                }
            ];

            $scope.avatar1 = {
                id: '2de4b99b5a1643c99a cad05f77323',
            };

            $scope.avatarEdit = {
                id: '2de4b99b5a1643c99a5a6cad05f77323' // '04fb40aa09874244877b457093c0d16d',
            };

            $scope.isReset = true;

            $scope.onDisableReset = function () {
                $scope.isReset = !$scope.isReset;
            };

            $scope.onChangeID = function () {
                $scope.avatar1.id = $scope.avatar1.id === '0044191e68ba450180f2afed415deecc'
                    ? '2de4b99b5a1643c99a5a6cad05f77323' : '0044191e68ba450180f2afed415deecc';
            };

            $scope.isReseting = function () {
                return $scope.isReset;
            };

            $scope.avatarIndex = 1;

            $scope.picture = null;

            $scope.newAvatars = function () {
                $scope.avatarIndex = $scope.avatarIndex === 1 ? 2 : 1;
            };

            $scope.onPictureCreated = function (obj) {
                console.log('Picture created', obj); // eslint-disable-line
                $scope.picture = obj.$control;
            };

            $scope.onPictureChanged = function ($control) {
                console.log('Picture changed'); // eslint-disable-line
            };

            $scope.onSaveClick = function () {
                console.log('AvatarController onSaveClick', $scope.picture);
                $scope.picture.save(
                    // Success callback
                    function () {
                        console.log('Picture saved'); // eslint-disable-line

                        $rootScope.$broadcast('pipPartyAvatarUpdated');
                    },
                    // Error callback
                    function (error) {
                        console.error(error); // eslint-disable-line
                    }
                );
            };

            $scope.onResetClick = function () {
                $scope.picture.reset();
            };
        }
    );

    thisModule.controller('partyAvatarController',
        function ($scope, $rootScope, pipNavService) {
            pipNavService.appbar.removeShadow();
            pipNavService.breadcrumb.text = 'Collage control';

            $scope.picture = null;

            $scope.pictureEditId = '56324b11830c5b1b16bfaae8';
            $scope.pictureEditDisabled = false;

            $scope.onPictureCreated = function ($event) {
                console.log('Picture created'); // eslint-disable-line
                $scope.picture = $event.sender;
            };

            $scope.onPictureChanged = function ($control) {
                console.log('Picture changed'); // eslint-disable-line
            };

            $scope.onSaveClick = function () {
                $scope.picture.save(
                    // Success callback
                    function () {
                        console.log('Picture saved'); // eslint-disable-line
                        $rootScope.$broadcast('pipPartyAvatarUpdated');
                    },
                    // Error callback
                    function (error) {
                        console.error(error); // eslint-disable-line
                    }
                );
            };

            $scope.onResetClick = function () {
                console.log('Picture reset'); // eslint-disable-line
                $scope.picture.reset();
            };
        }
    );

    thisModule.controller('entityAvatarController',
        function ($scope, $rootScope) {
            $scope.picture = null;

            $scope.pictureEditId = '56324b11830c5b1b16bfaae8';
            $scope.pictureEditDisabled = false;

            $scope.onPictureCreated = function (obj) {
                console.log('Picture created'); // eslint-disable-line
                $scope.picture = obj.$control;
            };

            $scope.onPictureChanged = function ($control) {
                console.log('Picture changed'); // eslint-disable-line
            };

            $scope.onSaveClick = function () {
                $scope.picture.save(
                    // Success callback
                    function () {
                        console.log('Picture saved'); // eslint-disable-line
                        $rootScope.$broadcast('pipPartyAvatarUpdated');
                    },
                    // Error callback
                    function (error) {
                        console.error(error); // eslint-disable-line
                    }
                );
            };

            $scope.onResetClick = function () {
                $scope.picture.reset();
            };
        }
    );

})(window.angular);

