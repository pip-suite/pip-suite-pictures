
(function (angular) {
    'use strict';

    var thisModule = angular.module('appPictures.Collage', []);

    thisModule.config(function (pipTranslateProvider) {
        pipTranslateProvider.translations('en', {
            COLLAGE_WITH_LOCAL_PICTURES: 'Collage with local pictures',
            ONE_PICTURE: '1 picture',
            TWO_PICTURES: '2 pictures',
            THREE_PICTURES: '3 pictures',
            FOUR_PICTURES: '4 pictures',
            FIVE_PICTURES: '5 pictures',
            SIX_PICTURES: '6 pictures',
            SEVEN_PICTURES: '7 pictures',
            EIGHT_PICTURES: '8 pictures',
            EIGHTEEN_PICTURES: '18 pictures',
            NINE_PICTURES_SINGLE_SEGMENT: '9 pictures single segment',
            TEN_PICTURES_MULTIPLY_SEGMENT: '10 pictures multiply segment',
            COLLAGE_WITH_PICTURES_FROM_SERVER: 'Collage with pictures from server'
        });
        pipTranslateProvider.translations('ru', {
            COLLAGE_WITH_LOCAL_PICTURES: 'Коллаж с локальными изображениями',
            ONE_PICTURE: '1 изображение',
            TWO_PICTURES: '2 изображение',
            THREE_PICTURES: '3 изображения',
            FOUR_PICTURES: '4 изображения',
            FIVE_PICTURES: '5 изображений',
            SIX_PICTURES: '6 изображений',
            SEVEN_PICTURES: '7 изображений',
            EIGHT_PICTURES: '8 изображений',
            EIGHTEEN_PICTURES: '18 изображений',
            NINE_PICTURES_SINGLE_SEGMENT: '9 изображений одним элементов',
            TEN_PICTURES_MULTIPLY_SEGMENT: '10 изображений многими элемеентами',
            COLLAGE_WITH_PICTURES_FROM_SERVER: 'Коллаж с изображениями с сервера'
        });
    });

    thisModule.controller('CollageController',
        function ($scope, pipNavService) {
            pipNavService.appbar.removeShadow();
            pipNavService.breadcrumb.text = 'Collage control';

            $scope.srcs_1 = ['http://www.velostyle.com.ua/images/product_images/popup_images/139140.jpg'];
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
            $scope.pids_3 = [
                'bfc1cdbb6ac04114bbc426d81fc38b06',
                '860dc5113d4242ebafc3a5b1f728cec2',
                'c5426e0970124c1d9116e248cc90438b',
                '123456'
            ];            
        }
    );

})(window.angular);
