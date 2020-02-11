const ConfigCameraDialogTranslations = (pipTranslateProvider: pip.services.ITranslateProvider) => {
    pipTranslateProvider.translations('en', {
        'TAKE_PICTURE': 'Take a picture',
        'WEB_CAM_ERROR': 'Webcam is missing or was not found'
    });
    pipTranslateProvider.translations('ru', {
        'TAKE_PICTURE': 'Сделать фото',
        'WEB_CAM_ERROR': 'Web-камера отсутствует или не найдена'
    });
}

declare var Webcam: any;
declare var Camera: any;
{
    class CameraDialogController {
        public webCamError: boolean
        public theme: string;
        public browser: string;
        public freeze: boolean;

        constructor(
            private $mdDialog: angular.material.IDialogService,
            private $rootScope: ng.IRootScopeService,
            private $timeout: ng.ITimeoutService,
            private $mdMenu,
            private pipSystemInfo: pip.services.ISystemInfo
        ) {
            "ngInject";

            this.theme = this.$rootScope[pip.themes.ThemeRootVar];
            this.browser = this.pipSystemInfo.os;
            this.freeze = false;

            this.onInit();
        }

        private onInit() {


            if (this.browser !== 'android') {
                Webcam.init();

                setTimeout(() => {
                    Webcam.attach('.camera-stream');
                }, 0);

                Webcam.on('error', (err: any) => {
                    this.webCamError = true;
                    console.error(err);
                });

                Webcam.set({
                    width: 400,
                    height: 300,

                    dest_width: 400,
                    dest_height: 300,

                    crop_width: 400,
                    crop_height: 300,

                    image_format: 'jpeg',
                    jpeg_quality: 90
                });

                //Webcam.setSWFLocation('../../../dist/webcam.swf');
                Webcam.setSWFLocation('webcam.swf');

            } else {
                document.addEventListener("deviceready", this.onDeviceReady, false);
            }
        }

        // todo add logic in callbacks
        public onDeviceReady() {
            (navigator as any).camera.getPicture((data) => { this.onSuccess(data); }, (message) => { this.onFail(message); },
                {
                    sourceType: Camera.PictureSourceType.CAMERA,
                    correctOrientation: true,
                    quality: 75,
                    targetWidth: 200,
                    destinationType: Camera.DestinationType.DATA_URL
                });
        }

        public onSuccess(imageData) {
            //var picture = imageData;
            var picture = 'data:image/jpeg;base64,' + imageData;
            this.$mdDialog.hide(picture);
        }

        public onFail(message) {
            alert('Failed because: ' + message);
            this.$mdDialog.hide();
        }

        public onTakePictureClick() {
            if (Webcam) {
                if (this.freeze) {
                    Webcam.snap((dataUri) => {
                        this.freeze = false;
                        this.$mdDialog.hide(dataUri);
                    });
                } else {
                    this.freeze = true;
                    Webcam.freeze();
                }
            }
        }

        public onResetPicture() {
            this.freeze = false;
            Webcam.unfreeze();
        }

        public onCancelClick() {
            this.$mdDialog.cancel();
        }
    }


    angular
        .module('pipCameraDialog')
        .config(ConfigCameraDialogTranslations)
        .controller('pipCameraDialogController', CameraDialogController);

}