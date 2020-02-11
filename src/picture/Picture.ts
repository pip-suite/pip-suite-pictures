import { IPictureUtilsService } from '../utilities/IPictureUtils';
import { IPictureDataService, Attachment } from '../data';

{
    interface IPictureBindings {
        [key: string]: any;

        src: any;
        pictureId: any;
        pipPicture: any;
        defaultIcon: any;
        pipRebind: any;
    }

    const PictureBindings: IPictureBindings = {
        src: '<?pipSrc',
        pictureId: '<?pipPictureId',
        pipPicture: '<?',
        defaultIcon: '<?pipDefaultIcon',
        pipRebind: '<?'
    }

    class PictureBindingsChanges implements ng.IOnChangesObject, IPictureBindings {
        [key: string]: ng.IChangesObject<any>;

        src: ng.IChangesObject<string>;
        pictureId: ng.IChangesObject<string>;
        pipPicture: ng.IChangesObject<Attachment>;
        defaultIcon: ng.IChangesObject<string>;
        pipRebind: ng.IChangesObject<boolean>;
    }

    class PictureController {
        private imageElement: any;
        private defaultBlock: any;

        public src: string;
        public pictureId: string;
        public pipPicture: Attachment;
        public defaultIcon: string;
        public pipRebind: boolean;

        private postLink: boolean = false;
        public errorText: string;
        constructor(
            private $scope: ng.IScope,
            private $rootScope: ng.IRootScopeService,
            private $element: JQuery,
            private pipPictureUtils: IPictureUtilsService,
            private pipPictureData: IPictureDataService
        ) {
            "ngInject";

            this.errorText = 'PICTURE_ERROR_LOAD';

            // Add class
            this.$element.addClass('pip-picture');
        }

        public $postLink() {
            this.imageElement = this.$element.children('img');
            this.defaultBlock = this.$element.children('div');
            this.defaultIcon = this.defaultIcon ? this.defaultIcon : this.pipPictureData.DefaultErrorIcon;
            this.postLink = true;
            this.bindControl();
        }

        public $onChanges(changes: PictureBindingsChanges): void {
            if (changes.pipRebind && changes.pipRebind.currentValue !== changes.pipRebind.previousValue) {
                this.pipRebind = changes.pipRebind.currentValue;
            }

            let isDataChange: boolean = false;
            if (this.pipRebind) {
                if (changes.src && changes.src.currentValue !== changes.src.previousValue) {
                    this.src = changes.src.currentValue;
                    isDataChange = true;
                }

                if (changes.pictureId && changes.pictureId.currentValue !== changes.pictureId.previousValue) {
                    this.pictureId = changes.pictureId.currentValue;
                    isDataChange = true;
                }

                if (changes.pipPicture && !_.isEqual(changes.pipPicture.currentValue, changes.pipPicture.previousValue)) {
                    this.pipPicture = changes.pipPicture.currentValue;
                    isDataChange = true;
                }

                if (changes.defaultIcon && changes.defaultIcon.currentValue !== changes.defaultIcon.previousValue) {
                    this.defaultIcon = changes.defaultIcon.currentValue;
                    this.defaultIcon = this.defaultIcon ? this.defaultIcon : this.pipPictureData.DefaultErrorIcon;
                }
            }

            if (isDataChange && this.postLink) {
                this.bindControl();
            }
        }

        // Clean up url to remove broken icon
        public onImageError($event: JQueryEventObject): void {
            if (this.pipPictureData.ShowErrorIcon) {
                this.$scope.$apply(() => {
                    this.imageElement.css('display', 'none');
                    this.defaultBlock.css('display', 'block');
                });
            } else {
                this.$scope.$apply(() => {
                    this.defaultBlock.css('display', 'none');
                });
            }
        }

        // When image is loaded resize/reposition it
        public onImageLoad($event: JQueryEventObject): void {
            let image: any = $($event.target);
            this.pipPictureUtils.setImageMarginCSS(this.$element, image);
            this.$element.children('div').css('display', 'none');
        }

        public bindControl(): void {
            let url;
            if (this.pictureId) {
                url = this.pipPictureData.getPictureUrl(this.pictureId);
                this.imageElement.attr('src', url);
            } else if (this.src) {
                this.imageElement.attr('src', this.src);
            } else if (this.pipPicture) {
                url = this.pipPicture.uri ? this.pipPicture.uri : this.pipPictureData.getPictureUrl(this.pipPicture.id);
                this.imageElement.attr('src', url);
            }
        }
    }

    const PictureComponent: ng.IComponentOptions = {
        bindings: PictureBindings,
        template: '<img ui-event="{ error: \'$ctrl.onImageError($event)\', load: \'$ctrl.onImageLoad($event)\' }"/>'
        + '<div class="pip-picture-error"><md-icon md-svg-icon="icons:{{$ctrl.defaultIcon}}"></md-icon><div class="pip-default-text"><span>{{ $ctrl.errorText | translate }}</span></div></div>',
        controller: PictureController
    }

    angular
        .module('pipPicture', [])
        .component('pipPicture', PictureComponent);
}
