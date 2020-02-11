
(function (angular) {
    'use strict';

    var thisModule = angular.module('appPictures.Picture', []);
    
    thisModule.controller('PictureController',
        function ($scope, pipNavService) {
            pipNavService.appbar.removeShadow();
            pipNavService.breadcrumb.text = 'Picture edit control';

            $scope.picture = null;
            $scope.pictureEditId = '56790b4c60958daa664fd8c7';
            $scope.pictureEditDisabled = false;
            $scope.obj = {};

            $scope.onPictureCreated = function (event) {
                $scope.picture = event.sender;
                console.log('Picture changed', event);
            };

            $scope.onPictureChanged = function (event) {
                console.log('onPictureChanged', event); // eslint-disable-line
            };

            $scope.onPictureNewChanged = function (event) {
                console.log('onPictureNewChanged', event); // eslint-disable-line
            };

            $scope.onNewSaveClick = function () {
                $scope.obj.picture.save(
                    // Success callback
                    function (data) {
                        $scope.newPicture = data;
                        console.log('Picture saved $scope.newPicture', $scope.newPicture); // eslint-disable-line
                    },
                    // Error callback
                    function (error) {
                        console.error(error); // eslint-disable-line
                    }
                );
            };

            $scope.onSaveClick = function () {
                $scope.picture.save(
                    // Success callback
                    function (data) {
                        $scope.pictureAttachment = data;
                        console.log('Picture saved', $scope.pictureEditId, $scope.pictureAttachment); // eslint-disable-line
                    },
                    // Error callback
                    function (error) {
                        console.error(error); // eslint-disable-line
                    }
                );
            };

            $scope.pictureAttachment = {
                id: '2de4b99b5a1643c99a5a6cad05f77324', //2de4b99b5a1643c99a5a6cad05f77323
                uri: null,
                name: 'file_name.jpeg'
            }

            $scope.onResetClick = function () {
                $scope.pictureEditId = '56790b4c60958daa664fd8c7';
                $scope.picture.reset();
            };

            $scope.isPictureDisabled = function () {
                return $scope.pictureEditDisabled;
            };
        }
    );

})(window.angular);
