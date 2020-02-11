
(function (angular) {
    'use strict';

    var thisModule = angular.module('appPictures.CollageResize', []);

    thisModule.config(function (pipTranslateProvider) {
        pipTranslateProvider.translations('en', {
            WIDTH: 'width',
            PICTURE: 'PICTURE',
            COLLAGE_RESIZING: 'Collage resizing',
            PICTURE_COUNT: 'Picture count',
            BLOCK_SIZE: 'Block size'
        });
        pipTranslateProvider.translations('ru', {
            WIDTH: 'длина',
            PICTURE: 'изображение(ий)',
            COLLAGE_RESIZING: 'Изменение размера коллажа',
            PICTURE_COUNT: 'Количество изображений',
            BLOCK_SIZE: 'Размер блока'
        });
    });

    thisModule.controller('CollageResizeController',
        function ($scope, pipTranslate, pipNavService) {

            pipNavService.appbar.removeShadow();
            pipNavService.breadcrumb.text = 'Collage control';

            $scope.collage = {
                size: 2,
                variant: 4,
                blockSize: 3,
                disabled: true
            };

            $scope.collageSet = [
                {id: 1, name: '1 ' + pipTranslate.translate('PICTURE')},
                {id: 2, name: '2 ' + pipTranslate.translate('PICTURE')},
                {id: 3, name: '3 ' + pipTranslate.translate('PICTURE')},
                {id: 4, name: '4 ' + pipTranslate.translate('PICTURE')},
                {id: 5, name: '5 ' + pipTranslate.translate('PICTURE')},
                {id: 6, name: '6 ' + pipTranslate.translate('PICTURE')},
                {id: 7, name: '7 ' + pipTranslate.translate('PICTURE')},
                {id: 8, name: '8 ' + pipTranslate.translate('PICTURE')},
                {id: 9, name: '9 ' + pipTranslate.translate('PICTURE')},
                {id: 10, name: '10 ' + pipTranslate.translate('PICTURE')}
            ];

            $scope.blockSizes = [
                {id: 0, name: pipTranslate.translate('WIDTH') + ' 250'},
                {id: 1, name: pipTranslate.translate('WIDTH') + ' 350'},
                {id: 2, name: pipTranslate.translate('WIDTH') + ' 450'},
                {id: 3, name: pipTranslate.translate('WIDTH') + ' 600'}
            ];

            $scope.blockStyles = [
                {width: '250px'},
                {width: '350px'},
                {width: '450px'},
                {width: '600px'}
            ];

            $scope.srcs_1 = ['images/square.jpg'];
            $scope.srcs_2 = ['images/square.jpg', 'images/vertical.jpg'];
            $scope.srcs_3 = ['images/square.jpg', 'images/vertical.jpg', 'images/horizontal.jpg'];
            $scope.srcs_4 = ['images/square.jpg', 'images/vertical.jpg', 'images/horizontal.jpg',
                'images/nonexisting.jpg'];
            $scope.srcs_5 = [
                'images/square.jpg', 'images/vertical.jpg', 'images/horizontal.jpg', 'images/nonexisting.jpg',
                'images/square.jpg'
            ];
            $scope.srcs_6 = [
                'images/square.jpg', 'images/vertical.jpg', 'images/horizontal.jpg', 'images/nonexisting.jpg',
                'images/square.jpg', 'images/vertical.jpg'
            ];
            $scope.srcs_7 = [
                'images/square.jpg', 'images/vertical.jpg', 'images/horizontal.jpg', 'images/nonexisting.jpg',
                'images/square.jpg', 'images/vertical.jpg', 'images/horizontal.jpg'
            ];
            $scope.srcs_8 = [
                'images/square.jpg', 'images/vertical.jpg', 'images/horizontal.jpg', 'images/nonexisting.jpg',
                'images/square.jpg', 'images/vertical.jpg', 'images/horizontal.jpg', 'images/nonexisting.jpg'
            ];
            $scope.srcs_9 = [
                'images/square.jpg', 'images/vertical.jpg', 'images/horizontal.jpg', 'images/nonexisting.jpg',
                'images/square.jpg', 'images/vertical.jpg', 'images/horizontal.jpg', 'images/nonexisting.jpg',
                'images/square.jpg'
            ];
            $scope.srcs_10 = [
                'images/square.jpg', 'images/vertical.jpg', 'images/horizontal.jpg', 'images/nonexisting.jpg',
                'images/square.jpg', 'images/vertical.jpg', 'images/horizontal.jpg', 'images/nonexisting.jpg',
                'images/square.jpg', 'images/vertical.jpg'
            ];


            $scope.pids_1 = [
                '860dc5113d4242ebafc3a5b1f728cec2'
            ];
            $scope.pids_2 = [
                'bfc1cdbb6ac04114bbc426d81fc38b06',
                '860dc5113d4242ebafc3a5b1f728cec2'
            ];
            $scope.pids_3 = [
                'bfc1cdbb6ac04114bbc426d81fc38b06',
                '860dc5113d4242ebafc3a5b1f728cec2',
                'c5426e0970124c1d9116e248cc90438b'
            ];

            $scope.onCollageSizeChange = onCollageSizeChange;

            return;

            function onCollageSizeChange() {
                $scope.collage.disabled = $scope.collage.size === 1 || $scope.collage.size === 2 ||
                    $scope.collage.size === 8 || $scope.collage.size === 9 || $scope.collage.size === 10;
            }
        }
    );
})(window.angular);
