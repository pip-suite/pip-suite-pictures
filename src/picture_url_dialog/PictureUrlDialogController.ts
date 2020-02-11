// import pipPictureUtils

const ConfigPictureUrlDialogTranslations = (pipTranslateProvider: pip.services.ITranslateProvider) => {
    pipTranslateProvider.translations('en', {
        'PICTURE_FROM_WEBLINK': 'Add from web link',
        'LINK_PICTURE': 'Link to the picture...'
    });
    pipTranslateProvider.translations('ru', {
        'PICTURE_FROM_WEBLINK': 'Добавить из веб ссылки',
        'LINK_PICTURE': 'Ссылка на изображение...'
    });
}

class PictureUrlDialogController {
    public url: string = '';
    public invalid: boolean = true;
    public theme: string;

    constructor(
        private $log: ng.ILogService,
        private $scope: ng.IScope,
        private $mdDialog: angular.material.IDialogService,
        private $rootScope: ng.IRootScopeService,
        private $timeout: ng.ITimeoutService,
        private $mdMenu,
        private pipPictureUtils
    ) {
        "ngInject";

        this.theme = this.$rootScope[pip.themes.ThemeRootVar];
    }

    public setImageSize(img: any): void {
        let imageWidth: number = img.width();
        let imageHeight: number = img.height();

        let cssParams = {};

        if ((imageWidth) > (imageHeight)) {
            cssParams['width'] = '250px';
            cssParams['height'] = 'auto';
        } else {
            cssParams['width'] = 'auto';
            cssParams['height'] = '250px';
        }

        img.css(cssParams);
    }

    public checkUrl(): void {
        let img = $("img#url_image")
            .on('error', () => {
                this.invalid = true;
                this.$scope.$apply();
                
            })
            .on('load', (e) => {
                this.invalid = false;
                this.setImageSize(img);
                this.$scope.$apply();
            })
            .attr("src", this.url);
    };

    public onCancelClick(): void {
        this.$mdDialog.cancel();
    };

    public onAddClick(): void {
        this.$mdDialog.hide(this.url);
    };

}

angular
    .module('pipPictureUrlDialog')
    .config(ConfigPictureUrlDialogTranslations)
    .controller('pipPictureUrlDialogController', PictureUrlDialogController);

