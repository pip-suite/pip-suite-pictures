import { IPictureUtilsService } from '../utilities/IPictureUtils';
import { IAvatarDataService, colors, colorClasses } from '../data/IAvatarDataService';
import { ReloadAvatar } from '../avatar_edit/AvatarEdit';

{
    interface IAvatarBindings {
        [key: string]: any;

        pipId: any;
        pipUrl: any;
        pipName: any;
        ngClass: any;
        pipRebindAvatar: any;
        pipRebind: any;
    }

    const AvatarBindings: IAvatarBindings = {
        pipId: '<?',
        pipUrl: '<?',
        pipName: '<?',
        ngClass: '<?',
        pipRebindAvatar: '<?',
        pipRebind: '<?'
    }

    class AvatarBindingsChanges implements ng.IOnChangesObject, IAvatarBindings {
        [key: string]: ng.IChangesObject<any>;

        pipId: ng.IChangesObject<string>;
        pipUrl: ng.IChangesObject<string>;
        pipName: ng.IChangesObject<string>;
        ngClass: ng.IChangesObject<string>;
        pipRebindAvatar: ng.IChangesObject<boolean>;
        pipRebind: ng.IChangesObject<boolean>;
    }

    class AvatarController {
        private cleanupAvatarUpdated: Function;
        private imageElement: any;
        // private iconErrorElement: any;
        private defaultAvatarElement: any;
        private image: any;

        public pipId: string;
        public pipUrl: string;
        public pipName: string;

        public ngClass: string;
        public pipRebindAvatar: boolean;
        public pipRebind: boolean;

        public postLink: boolean = false;
        // public errorIcon: string;
        public initial: string;

        constructor(
            private $log: ng.ILogService,
            private $http: ng.IHttpService,
            private $rootScope: ng.IRootScopeService,
            private $element: JQuery,
            private pipAvatarData: IAvatarDataService,
            private pipPictureUtils: IPictureUtilsService,
            private pipCodes: pip.services.ICodes,
            private $timeout
        ) {
            "ngInject";

            this.image = null;

            // this.errorIcon = 'icon:warn-star';
            this.initial = this.pipAvatarData.DefaultInitial;
            // Add class
            $element.addClass('pip-avatar flex-fixed');

            this.$rootScope.$on(ReloadAvatar, ($event: ng.IAngularEvent, id: string) => { //navState
                if (this.pipId == id && this.pipRebind) {
                    this.refreshAvatar();
                }
            });
        }

        public $postLink() {
            this.imageElement = this.$element.children('img');
            // this.iconErrorElement = this.$element.find('#icon-error');
            this.defaultAvatarElement = this.$element.find('#default-avatar');

            // When image is loaded resize/reposition it
            this.imageElement
                .load(($event) => {
                    this.image = $($event.target);
                    this.pipPictureUtils.setImageMarginCSS(this.$element, this.image);
                })
                .error(($event) => {
                    this.showAvatarByName();
                });

            this.bindControl();

            this.postLink = true;
        }

        public $onChanges(changes: AvatarBindingsChanges): void {
            if (changes.pipRebind && changes.pipRebind.currentValue !== changes.pipRebind.previousValue) {
                this.pipRebind = changes.pipRebind.currentValue;
            }
            if (changes.pipRebindAvatar && changes.pipRebindAvatar.currentValue !== changes.pipRebindAvatar.previousValue) {
                this.pipRebindAvatar = changes.pipRebindAvatar.currentValue;
            }
            if (changes.ngClass && changes.ngClass.currentValue !== changes.ngClass.previousValue) {
                this.ngClass = changes.ngClass.currentValue;
                setTimeout(() => {
                    this.pipPictureUtils.setImageMarginCSS(this.$element, this.image);
                }, 50);
            }

            let isDataChange: boolean = false;
            if (this.pipRebind) {
                if (changes.pipId && changes.pipId.currentValue !== changes.pipId.previousValue) {
                    this.pipId = changes.pipId.currentValue;
                    isDataChange = true;
                }

                if (changes.pipUrl && changes.pipUrl.currentValue !== changes.pipUrl.previousValue) {
                    this.pipUrl = changes.pipUrl.currentValue;
                    isDataChange = true;
                }

                if (changes.pipName && changes.pipName.currentValue !== changes.pipName.previousValue) {
                    this.pipName = changes.pipName.currentValue;
                    isDataChange = true;
                }
            }

            // this.avatarUrlParams = this.getAvatarUrlParams();
            if (isDataChange && this.postLink) {
                this.refreshAvatar();
            }
        }

        private showAvatarByName() {
            this.$timeout(() => {
                let colorClassIndex = this.pipCodes.hash(this.pipId) % colors.length;
                this.defaultAvatarElement.removeAttr('class');
                this.defaultAvatarElement.addClass(colorClasses[colorClassIndex]);
                this.imageElement.css('display', 'none');
                this.defaultAvatarElement.css('display', 'inline-block');
            })

        }

        private toBoolean(value: any): boolean {
            if (!value) { return false; }
            value = value.toString().toLowerCase();

            return value == '1' || value == 'true';
        }

        public refreshAvatar(): void {

            if (!this.pipAvatarData.ShowOnlyNameIcon) {
                this.imageElement.attr('src', '');
                this.imageElement.css('display', 'inline-block');
                this.defaultAvatarElement.css('display', 'none');
            }

            this.bindControl();
        };

        public bindControl(): void {
            if (this.pipRebindAvatar) {
                this.cleanupAvatarUpdated = this.$rootScope.$on('pipPartyAvatarUpdated', () => { this.refreshAvatar(); });
            } else {
                if (this.cleanupAvatarUpdated) {
                    this.cleanupAvatarUpdated();
                }
            }

            if (this.pipName) {
                this.initial = this.pipName.charAt(0);
            } else {
                this.initial = this.pipAvatarData.DefaultInitial;
            }

            if (!this.pipAvatarData.ShowOnlyNameIcon) {
                let url = this.pipId ? this.pipAvatarData.getAvatarUrl(this.pipId) : this.pipUrl;
                this.imageElement.attr('src', url);
            } else {
                this.showAvatarByName();
            }
        }

    }

    const AvatarComponent: ng.IComponentOptions = {
        bindings: AvatarBindings,
        template: '<img/><div id="default-avatar">{{ $ctrl.initial }}</div>',
        controller: AvatarController
    }

    angular
        .module('pipAvatar', ['pipPictureUtils'])
        .component('pipAvatar', AvatarComponent);
}

