(function (angular) {
    'use strict';

    var thisModule = angular.module('appPictures.Pictures', []);

    thisModule.config(function (pipTranslateProvider) {
        pipTranslateProvider.translations('en', {
            PICTURE_LIST_EDIT: 'Picture list edit',
            SAVE: 'Save',
            CLICK_HERE_OR_DRAG_FILES: 'Click here or drag files',
            COPIED_CONTENT: 'Copied content'
        });
        pipTranslateProvider.translations('ru', {
            PICTURE_LIST_EDIT: 'Контрол для редактрования списка изображений',
            SAVE: 'Сохранить',
            CLICK_HERE_OR_DRAG_FILES: 'Нажмите сюда или перетащите файл',
            COPIED_CONTENT: 'Скопированный контент'
        });
    });

    thisModule.controller('PicturesController',
        function ($scope, pipNavService, $timeout) {

            pipNavService.appbar.removeShadow();
            pipNavService.breadcrumb.text = 'Picture list edit control';

            $scope.pictureIds = [];
            $scope.pictureList = null;
            $scope.obj = {};

            $scope.pictureContentIds = [ 
                {
                    id: '57702410717b4ceabd8de76798899e2b',
                    name: 'Cat-laying-on-his-back-on-sofa.jpg',
                    uri: null
                },
                {
                    id: 'f60e27678b7d4b5f80e9681e3ebdbe1b',
                    name: '1.png',
                    uri: null
                },
                {
                    id: 'bfae022ed3284bffb31b989eb0cb6518',
                    name: 'Screenshot_21.png',
                    uri: null
                },
                {
                    id: '',
                    name: 'Cat-laying-on-his-back-on-sofa.jpg',
                    uri: 'http://www.rd.com/wp-content/uploads/sites/2/2016/04/01-cat-wants-to-tell-you-laptop.jpg'
                }                                                
            ];
            $scope.pictureContent = null;

            $scope.onSaveListClick = function () {
                $scope.obj.picture.save(
                    function (data) {
                        console.log('Picture list saved', data);  // eslint-disable-line
                    },
                    function (error) {
                        console.error('Picture list error', error); // eslint-disable-line
                    }
                );
            };

            $scope.onResetListClick = function () {
                $scope.obj.picture.reset();
            };

            $scope.onPictureContentCreated = function (obj) {
                console.log('onPictureContentCreated', obj)
                // obj.documents = $event.sender
                $scope.pictureContent = obj.sender;
            };

            $scope.onSaveContentClick = function () {
                $scope.pictureContent.save(
                    function () {
                        console.log('Picture list saved'); // eslint-disable-line
                    },
                    function (error) {
                        console.error(error); // eslint-disable-line
                    }
                );
            };

            console.log('obj', $scope.obj);

            $timeout(() => {
                console.log('obj', $scope.obj);
            }, 1000);

        }
    );
})(window.angular);
