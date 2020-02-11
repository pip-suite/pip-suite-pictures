import { IPictureUtilsService } from '../utilities/IPictureUtils';
import { PicturePaste } from '../utilities/PicturePaste';
import { IPictureDataService } from '../data/IPictureDataService';
import { Attachment } from '../data';

{
    class ContainerSize {
        public w: number;
        public h: number;
    }

    interface ICollageBindings {
        [key: string]: any;

        pipPictureIds: any;
        pipSrcs: any;
        pipPictures: any;
        uniqueCode: any;
        multiple: any;
        allowOpen: any;
        pipRebind: any;
    }

    const CollageBindings: ICollageBindings = {
        pipPictureIds: '<?',
        pipSrcs: '<?',
        pipPictures: '<?',
        uniqueCode: '<?pipUniqueCode',
        multiple: '<?pipMultiple',
        allowOpen: '<?pipOpen',
        pipRebind: '<?',
    }

    class CollageBindingsChanges implements ng.IOnChangesObject, ICollageBindings {
        [key: string]: ng.IChangesObject<any>;

        pipPictureIds: ng.IChangesObject<string[]>;
        pipSrcs: ng.IChangesObject<string[]>;
        pipPictures: ng.IChangesObject<Attachment[]>;
        uniqueCode: ng.IChangesObject<string>;
        multiple: ng.IChangesObject<boolean>;
        allowOpen: ng.IChangesObject<boolean>;
        pipRebind: ng.IChangesObject<boolean>;
    }

    class CollageController {
        private debounceCalculateResize: any;

        public pipPictureIds: string[];
        public pipSrcs: string[];
        public pipPictures: Attachment[];
        public uniqueCode: string;
        public multiple: boolean;
        public allowOpen: boolean;
        public pipRebind: boolean;

        private svgData: any;
        private resized: number;
        private collageSchemes: any;

        constructor(
            private $log: ng.ILogService,
            private $scope: ng.IScope,
            private $rootScope: ng.IRootScopeService,
            private $element: JQuery,
            private pipPictureData: IPictureDataService,
            private pipPictureUtils: IPictureUtilsService,
            private pipCodes: pip.services.ICodes
        ) {
            "ngInject";

            // Add class
            $element.addClass('pip-collage');

            this.collageSchemes = pipPictureUtils.getCollageSchemes(),
                this.resized = 0;
            this.svgData = '<?xml version="1.0" encoding="utf-8"?>' +
                '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' +
                '<svg version="1.1"'+
                    'xmlns="http://www.w3.org/2000/svg"'+
                    'xmlns:xlink="http://www.w3.org/1999/xlink"'+
                    'x="0px" y="0px"'+
                    'viewBox="0 0 510 510"'+
                    'style="enable-background:new 0 0 515 515;"'+
                    'xml:space="preserve">'+
                    '<defs>'+
                    '<style type="text/css"><![CDATA['+
                    '#symbol-picture-no-border {'+
                    '        transform-origin: 50% 50%;'+
                    '        transform: scale(0.6, -0.6);'+
                    '    }'+
                    '        ]]></style>'+
                    '        </defs>'+
                    '<rect x="0" width="515" height="515"/>'+
                    '<path id="symbol-picture-no-border" d="M120 325l136-102 69 33 136-82 0-54-410 0 0 136z m341 15c0-28-23-51-51-51-29 0-52 23-52 51 0 29 23 52 52 52 28 0 51-23 51-52z" />'+
                    '</svg>';

            this.debounceCalculateResize = _.debounce(() => { this.calculateResize(); }, 50);
        }

        public $postLink() {
            this.$scope.getElementDimensions = () => {
                let dimension = {
                    'h': this.$element.height(),
                    'w': this.$element.width()
                };

                return dimension;
            }

            this.$scope.$watch(this.$scope.getElementDimensions, (newValue: ContainerSize, oldValue: ContainerSize) => {
                if (newValue && oldValue && oldValue.h == newValue.h && oldValue.w == newValue.w) return;
                this.debounceCalculateResize();
            }, true);

            this.generateContent();
        }

        public $onChanges(changes: CollageBindingsChanges): void {
            if (changes.pipRebind && changes.pipRebind.currentValue !== changes.pipRebind.previousValue) {
                this.pipRebind = changes.pipRebind.currentValue;
            }

            if (changes.allowOpen && changes.allowOpen.currentValue !== changes.allowOpen.previousValue) {
                this.allowOpen = changes.allowOpen.currentValue;
            }

            let isChanged: boolean = false;
            if (this.pipRebind) {
                if (changes.pipSrcs && !_.isEqual(changes.pipSrcs.currentValue, changes.pipSrcs.previousValue)) {
                    this.pipSrcs = changes.pipSrcs.currentValue;
                    isChanged = true;
                }
                if (changes.pipPictureIds && !_.isEqual(changes.pipPictureIds.currentValue, changes.pipPictureIds.previousValue)) {
                    this.pipPictureIds = changes.pipPictureIds.currentValue;
                    isChanged = true;
                }
                if (changes.pipPictures && !_.isEqual(changes.pipPictures.currentValue, changes.pipPictures.previousValue)) {
                    this.pipPictures = changes.pipPictures.currentValue;
                    isChanged = true;
                }
            }

            if (isChanged) {
                this.generateContent();
            }
        }

        public calculateResize(): void {
            let ims = this.$element.find('img');
            let i: number = 0;
            for (i; i < ims.length; i++) {
                let container = angular.element(ims[i].parentElement);
                let image = angular.element(ims[i]);

                if (image.css('display') != 'none') {
                    this.pipPictureUtils.setImageMarginCSS(container, image);
                }
            }

            let icns = this.$element.find('md-icon');

            for (i; i < icns.length; i++) {
                let container = angular.element(icns[i].parentElement);
                let icn = angular.element(icns[i]);
                if (container.css('display') != 'none') {
                    this.pipPictureUtils.setIconMarginCSS(container[0], icn);
                }
            }
        }

        // Clean up url to remove broken icon
        public onImageError($event: JQueryEventObject): void {
            let image = $($event.target);
            let container = image.parent();
            let defaultBlock = container.children('div');
            let defaultIcon = image.parent().find('md-icon');

            defaultBlock.css('display', 'block');
            image.css('display', 'none');
            this.pipPictureUtils.setIconMarginCSS(container[0], defaultIcon);
            defaultIcon.empty().append(this.svgData);
        }

        // When image is loaded resize/reposition it
        public onImageLoad($event: JQueryEventObject) {
            let image = $($event.target);
            let container = image.parent();
            let defaultBlock = container.children('div');

            this.pipPictureUtils.setImageMarginCSS(container, image);
            defaultBlock.css('display', 'none');
        }

        public getScheme(count: number): any {
            let schemes = this.collageSchemes[count - 1];

            // If nothing to choose from then return
            if (schemes.length == 1) return schemes[0];

            // Calculate unique had code
            let uniqueCode: string = this.uniqueCode ? this.uniqueCode : '';
            let hash = this.pipCodes.hash(uniqueCode);

            // Return reproducable scheme by hash
            return schemes[hash % schemes.length];
        }

        public getImageUrls(): string[] {
            // Simply return sources
            if (this.pipSrcs) {

                return _.clone(this.pipSrcs);
            }

            let i: number;
            let result: string[] = [];
            // Calculate urls if picture ids are specified
            if (this.pipPictureIds) {
                for (i = 0; i < this.pipPictureIds.length; i++) {
                    result.push(this.pipPictureData.getPictureUrl(this.pipPictureIds[i]));
                }
            } else if (this.pipPictures) {
                for (i = 0; i < this.pipPictures.length; i++) {
                    let url = this.pipPictures[i].uri ? this.pipPictures[i].uri : this.pipPictureData.getPictureUrl(this.pipPictures[i].id);
                    result.push(url);
                }
            }

            // Return an empty array otherwise
            return result;
        }

        public generatePicture(urls: string[], scheme: any): string {
            let url: string = urls[0];
            let containerClasses: string = '';
            let pictureClasses: string = '';

            urls.splice(0, 1);

            containerClasses += scheme.fullWidth ? ' pip-full-width' : '';
            containerClasses += scheme.fullHeight ? ' pip-full-height' : '';
            containerClasses += ' flex-' + scheme.flex;

            pictureClasses += scheme.leftPadding ? ' pip-left' : '';
            pictureClasses += scheme.rightPadding ? ' pip-right' : '';
            pictureClasses += scheme.topPadding ? ' pip-top' : '';
            pictureClasses += scheme.bottomPadding ? ' pip-bottom' : '';

            if (this.allowOpen) {
                return '<a class="pip-picture-container' + containerClasses + '" flex="' + scheme.flex + '" '
                    + 'href="' + url + '"  target="_blank">'
                    + '<div class="pip-picture' + pictureClasses + '"><img src="' + url + '"/>'
                    + '<div><md-icon class="collage-error-icon" md-svg-icon="icons:picture-no-border"></md-icon></div></div></a>';
            }

            return '<div class="pip-picture-container' + containerClasses + '" flex="' + scheme.flex + '">'
                + '<div class="pip-picture' + pictureClasses + '"><img src="' + url + '"/>'
                + '<div><md-icon class="collage-error-icon" md-svg-icon="icons:picture-no-border"></md-icon></div></div></div>';
        }

        public generatePictureGroup(urls: string[], scheme: any): string {
            let classes: string = '';
            let result: string;
            let i: number;

            classes += scheme.fullWidth ? ' pip-full-width' : '';
            classes += scheme.fullHeight ? ' pip-full-height' : '';
            classes += ' flex-' + scheme.flex;
            classes += ' layout-' + scheme.layout;

            result = '<div class="pip-picture-group layout' + classes + '" flex="'
                + scheme.flex + '" layout="' + scheme.layout + '">';

            // Generate content for children recursively
            for (i = 0; i < scheme.children.length; i++) {
                result += this.generate(urls, scheme.children[i]);
            }
            result += '</div>';

            return result;
        }

        public generate(urls: string[], scheme: any): string {
            if (scheme.group) {
                return this.generatePictureGroup(urls, scheme);
            }

            return this.generatePicture(urls, scheme);
        }

        public generateContent(): void {
            // Unbind previously defined actions handlers
            this.$element.find('img')
                .unbind('error')
                .unbind('load');

            // Clean up content
            this.$element.empty();

            // Calculate list of image urls
            let urls: string[] = this.getImageUrls();
            let scheme: any;
            let html: string;

            // And exit if nothing to show
            if (urls.length == 0) {
                this.$element.hide();

                return;
            }

            // Limit collage only to one element if not specified otherwise
            if (urls.length > 8) {
                if (!this.multiple) {
                    urls.length = 8;
                }
            }

            if (urls.length <= 8) {
                // Get scheme for visualization
                scheme = this.getScheme(urls.length);

                // Generate and add content
                html = '<div class="pip-collage-section">' + this.generate(urls, scheme) + '</div>';
                html += '<div class="clearfix"></div>';
                this.$element.html(html);
            } else {
                html = '';

                while (urls.length > 0) {
                    let partialUrls = urls.splice(0, 8);

                    // Get scheme for visualization
                    scheme = this.getScheme(partialUrls.length);

                    // Generate and add content
                    html += '<div class="pip-collage-section">' + this.generate(partialUrls, scheme) + '</div>';
                }

                html += '<div class="clearfix"></div>';
                this.$element.html(html);
            }

            // Bind events to images...
            this.$element.find('img')
                .bind('error', (event) => { this.onImageError(event); })
                .bind('load', (event) => { this.onImageLoad(event); });

            // Show the new element
            this.$element.show();
        }

    }

    const CollageComponent: ng.IComponentOptions = {
        bindings: CollageBindings,
        controller: CollageController
    }

    angular
        .module('pipCollage', [])
        .component('pipCollage', CollageComponent);
}

