import { AddImageOption } from './AddImageOption';
import { Attachment } from '../data';
import { AddImageResult } from './AddImageResult';

// Todo: Is this public exist anywhere?
declare let unescape: any;

const ConfigTranslations = (pipTranslateProvider: pip.services.ITranslateProvider) => {
    pipTranslateProvider.translations('en', {
        'FILE': 'Upload pictures',
        'WEB_LINK': 'Use web link',
        'CAMERA': 'Take photo',
        'IMAGE_GALLERY': 'Use image library',
    });
    pipTranslateProvider.translations('ru', {
        'FILE': 'Загрузить картинку',
        'WEB_LINK': 'Вставить веб ссылка',
        'CAMERA': 'Использовать камеру',
        'IMAGE_GALLERY': 'Открыть галерею изображений'
    });
}

{
    interface IAddImageScope extends angular.IScope {
        $images: AddImageResult[];
        onChange: any;
        multi: any;
        option: any;
        ngDisabled: any;
    }

    class AddImageController {
        public option: AddImageOption;

        constructor(
            private $scope: IAddImageScope,
            private $element,
            private $mdMenu,
            private $timeout,
            private pipCameraDialog,
            private pipPictureUrlDialog,
            private pipGallerySearchDialog
        ) {
            "ngInject";

            let defaultOption = new AddImageOption();

            this.option = _.assign(defaultOption, this.$scope.option);
        }

        public openMenu($mdOpenMenu): void {
            if (this.$scope.ngDisabled()) {
                return;
            }

            $mdOpenMenu();
        }

        private toBoolean(value: any): boolean {
            if (!value) { return false; }

            value = value.toString().toLowerCase();

            return value == '1' || value == 'true';
        }

        public isMulti(): boolean {
            if (this.$scope.multi !== undefined && this.$scope.multi !== null) {
                if (angular.isFunction(this.$scope.multi)) {
                    return this.toBoolean(this.$scope.multi());
                } else {
                    return this.toBoolean(this.$scope.multi);
                }
            } else {
                return true;
            }
        }

        public hideMenu(): void {
            this.$mdMenu.hide();
        }

        public dataURItoBlob(dataURI: string): Blob {
            let byteString;

            if (dataURI.split(',')[0].indexOf('base64') >= 0) {
                byteString = atob(dataURI.split(',')[1]);
            } else {
                byteString = unescape(dataURI.split(',')[1]);
            }
            let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

            let ia = new Uint8Array(byteString.length);
            let i: number;
            for (i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            return new Blob([ia], { type: mimeString });
        }

        public addImages(images: any): void {
            if (images === undefined) { return; }

            if (angular.isArray(images)) {
                images.forEach((img: AddImageResult) => {
                    if (this.$scope.onChange) {
                        this.$scope.onChange(img);
                    }
                });
            } else {
                if (this.$scope.onChange) {
                    this.$scope.onChange(images);
                }
            }

            if (this.$scope.$images === undefined || !Array.isArray(this.$scope.$images)) {
                return;
            }

            if (Array.isArray(images)) {
                images.forEach((img) => {
                    this.$scope.$images.push(img);
                });
            } else {
                this.$scope.$images.push(images);
            }
        }

        // Process user actions
        public onFileChange($files: any): void {
            if ($files == null || $files.length == 0) { return; }

            $files.forEach((file) => {
                if (file.type.indexOf('image') > -1) {
                    this.$timeout(() => {
                        let fileReader = new FileReader();
                        fileReader.readAsDataURL(file);
                        fileReader.onload = (e) => {
                            this.$timeout(() => {
                                this.addImages({ url: null, uriData: (e.target as any).result, file: file, picture: null });
                            });
                        }
                    });
                }
            });

        }

        public onWebLinkClick(): void {
            this.pipPictureUrlDialog.show((result) => {
                let blob = null;
                if (result.substring(0, 10) == 'data:image') {
                    blob = this.dataURItoBlob(result);
                    blob.name = result.slice(result.lastIndexOf('/') + 1, result.length).split('?')[0];
                }
                this.addImages({ url: result, uriData: null, file: blob, picture: null });
            });
        }

        public onCameraClick(): void {
            this.pipCameraDialog.show((result) => {
                let blob: any = this.dataURItoBlob(result);
                blob.name = 'camera';
                this.addImages({ url: null, uriData: result, file: blob, picture: null });
            });
        }

        public onGalleryClick(): void {
            this.pipGallerySearchDialog.show(
                {
                    multiple: this.isMulti()
                },
                (result: Attachment[]) => {
                    if (this.isMulti()) {
                        let imgs: AddImageResult[] = [];
                        result.forEach((item: Attachment) => {
                            imgs.push({ url: null, uriData: null, file: null,  picture: item });
                        });
                        this.addImages(imgs);
                    } else {
                        this.addImages({ url: null, uriData: null, file: null, picture: result[0] });
                    }
                }
            );
        }
    }

    const AddImage = function (): ng.IDirective {
        return {
            restrict: 'AC',
            scope: {
                $images: '=pipImages',
                onChange: '&pipChanged',
                multi: '&pipMulti',
                option: '=pipOption',
                ngDisabled: '&'
            },
            transclude: true,
            templateUrl: 'add_image/AddImage.html',
            controller: AddImageController,
            controllerAs: 'vm'
        };
    }

    angular
        .module('pipAddImage', ['pipCameraDialog', 'pipPictureUrlDialog', 'pipGallerySearchDialog', 'angularFileUpload'])
        .config(ConfigTranslations)
        .directive('pipAddImage', AddImage);
}
