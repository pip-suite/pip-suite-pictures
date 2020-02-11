import { IPictureUtilsService } from '../utilities/IPictureUtils';
import { PicturePaste } from '../utilities/PicturePaste';
import { IPictureDataService, Attachment } from '../data';
import { AddImageResult } from '../add_image/AddImageResult';

export class PictureEditControl {
    public reset: (afterDeleting?: boolean) => void;
    public save: (successCallback?: (response?: Attachment) => void, errorCallback?: (error?: any) => void) => void;
    public abort: () => void;
    public error?: any;

    public disabled: boolean = false;
    public url: string = '';
    public uriData: any;
    public uri: string;
    public id: string;
    public name: string;
    public progress: number = 0;
    public uploaded: boolean = false;
    public uploading: boolean = false;
    public upload: boolean = false;
    public loaded: boolean = false;
    public file: any = null;
    public state: string = PictureStates.Original;
}

export class PictureStates {
    static Original: string = 'original';
    static Copied: string = 'copied';
    static Changed: string = 'changed';
    static Deleted: string = 'deleted';
    static Error: string = 'error';
}

{

    const ConfigPictureEditTranslations = (pipTranslateProvider: pip.services.ITranslateProvider) => {
        pipTranslateProvider.translations('en', {
            ERROR_WRONG_IMAGE_FILE: 'Incorrect image file. Please, choose another one',
            PICTURE_EDIT_TEXT: 'Click here to upload a picture',
            PICTURE_ERROR_LOAD: 'Error image loading'
        });
        pipTranslateProvider.translations('ru', {
            ERROR_WRONG_IMAGE_FILE: 'Неправильный файл с изображением. Выберете другой файл',
            PICTURE_EDIT_TEXT: 'Нажмите сюда для загрузки картинки',
            PICTURE_ERROR_LOAD: 'Ошибка загрузки картинки'
        });
    }


    class SenderEvent {
        sender: PictureEditControl;
    }

    class PictureEvent {
        $event: SenderEvent;
        $control: PictureEditControl;
    }

    interface IPictureEditBindings {
        [key: string]: any;

        ngDisabled: any;
        pipCreated: any;
        pipChanged: any;
        pipPictureId: any;
        pipPicture: any;
        pipAddedPicture: any;
        text: any;
        icon: any;
        pipRebind: any;
    }

    const PictureEditBindings: IPictureEditBindings = {
        ngDisabled: '<?',
        pipCreated: '&?',
        pipChanged: '&?',
        pipPictureId: '=?',
        pipPicture: '=?',
        pipAddedPicture: '&?',
        text: '<?pipDefaultText',
        icon: '<?pipDefaultIcon',
        pipRebind: '<?',
    }

    class PictureEditBindingsChanges implements ng.IOnChangesObject, IPictureEditBindings {
        [key: string]: ng.IChangesObject<any>;

        ngDisabled: ng.IChangesObject<boolean>;
        pipCreated: ng.IChangesObject<(params: PictureEvent) => ng.IPromise<void>>;
        pipChanged: ng.IChangesObject<(params: PictureEvent) => ng.IPromise<void>>;
        pipPictureId: ng.IChangesObject<string>;
        pipPicture: ng.IChangesObject<Attachment>;
        pipAddedPicture: ng.IChangesObject<() => boolean>;
        text: ng.IChangesObject<string>;
        icon: ng.IChangesObject<string>;
        pipRebind: ng.IChangesObject<boolean>;
    }

    class PictureEditController {
        private controlElement: any;
        private inputElement: any;
        private pipPicturePaste: PicturePaste;
        private pictureStartState: string;

        public ngDisabled: boolean;
        public pipCreated: (params: PictureEvent) => void;
        public pipChanged: (params: PictureEvent) => void;
        public text: string;
        public icon: string;
        public pipPictureId: string;
        public pipPicture: Attachment;
        public pipAddedPicture: () => boolean;
        public pipRebind: boolean;

        public multiUpload: boolean;
        public errorText: string;

        public control: PictureEditControl;

        constructor(
            private $log: ng.ILogService,
            private $scope: ng.IScope,
            private $rootScope: ng.IRootScopeService,
            private $element: JQuery,
            private pipPictureData: IPictureDataService,
            private pipPictureUtils: IPictureUtilsService,
            private $timeout: ng.ITimeoutService,
            private pipFileUpload: pip.files.IFileUploadService
        ) {
            "ngInject";
            this.pipPicturePaste = new PicturePaste($timeout);
            this.pictureStartState = this.pipAddedPicture ? PictureStates.Copied : PictureStates.Original;

            this.text = this.text || 'PICTURE_EDIT_TEXT';
            this.icon = this.icon || 'picture-no-border';
            this.errorText = 'PICTURE_ERROR_LOAD';

            this.multiUpload = false;

            this.control = new PictureEditControl();
            this.control.state = this.pictureStartState;
            this.control.reset = (afterDeleting: boolean) => {
                this.resetImage(afterDeleting);
            }
            this.control.save = (successCallback?: (response?: Attachment) => void, errorCallback?: (error?: any) => void): void => {
                this.saveImage(successCallback, errorCallback);
            }
            this.control.abort = (): void => {
                this.abort();
            }
            // Add class
            $element.addClass('pip-picture-edit');
        }

        public $postLink() {
            this.controlElement = this.$element.children('.pip-picture-upload');
            this.inputElement = this.controlElement.children('input[type=file]');
            // Initialize control
            this.control.reset();

            // Execute callback
            if (this.pipCreated) {
                this.pipCreated({
                    $event: { sender: this.control },
                    $control: this.control
                });
            }
        }

        public abort(): void {
            if (this.control.uploading) {
                this.control.uploaded = false;
                this.control.uploading = false;
                this.control.progress = 0;
                this.control.upload = null;
            }
        }

        public $onChanges(changes: PictureEditBindingsChanges): void {
            if (changes.pipRebind && changes.pipRebind.currentValue !== changes.pipRebind.previousValue) {
                this.pipRebind = changes.pipRebind.currentValue;
            }

            let change = false;

            if (changes.ngDisabled && changes.ngDisabled.currentValue !== changes.ngDisabled.previousValue) {
                this.ngDisabled = changes.ngDisabled.currentValue;
                this.control.disabled = this.ngDisabled; // ???
                if (this.inputElement) {
                    this.inputElement.attr('disabled', this.control.disabled);
                }
            }

            if (this.pipRebind) {
                if (changes.pipPictureId && changes.pipPictureId.currentValue !== this.pipPictureId) {
                    this.pipPictureId = changes.pipPictureId.currentValue;
                    change = true;
                }
            }

            if (this.pipRebind) {
                if (changes.pipPicture && !_.isEqual(changes.pipPicture.currentValue, this.pipPicture)) {
                    this.pipPicture = changes.pipPicture.currentValue;
                    change = true;
                }
            }
            if (change) {
                this.control.reset();
            }
        }

        public resetImage(afterDeleting: boolean): void {
            this.control.progress = 0;
            this.control.uploading = false;
            this.control.uploaded = false;
            this.control.file = null;
            this.control.state = this.pictureStartState;
            this.control.url = '';
            this.control.uri = null;
            this.control.name = null;
            this.control.uriData = null;
            this.control.id = null;
            var url = '';
            if (!afterDeleting) {
                if (this.pipPictureId) {
                    url = this.pipPictureData.getPictureUrl(this.pipPictureId);
                } else if (this.pipPicture) {
                    url = this.pipPicture.uri ? this.pipPicture.uri : this.pipPicture.id ? this.pipPictureData.getPictureUrl(this.pipPicture.id) : null;
                    this.control.uri = this.pipPicture.uri;
                    this.control.name = this.pipPicture.name;
                    this.control.id = this.pipPicture.id;
                }
                if (!url) return;

                this.control.url = url;
                this.control.uploaded = true;
                this.onChange();
            } else {
                this.onChange();
            }
        }

        public onFocus(): void {
            this.pipPicturePaste.addPasteListener((item) => {
                this.readItemLocally(item.url, item.uriData, item.file, item.picture);
            });
        }

        public onBlur(): void {
            this.pipPicturePaste.removePasteListener();
        };

        public savePicture(successCallback?: (response?: Attachment) => void, errorCallback?: (error?: any) => void): void {
            if (this.control.id) {
                this.control.uploading = false;
                this.pipPicture = {
                    id: this.control.id,
                    uri: this.control.uri,
                    name: this.control.name
                }
                this.pictureStartState = PictureStates.Original;
                this.control.reset();
                if (successCallback) {
                    successCallback(this.pipPicture);
                }
            }
            else if (this.control.file !== null) {
                this.control.uploading = true;
                this.pipFileUpload.upload(
                    this.control.file,
                    this.pipPictureData.postPictureUrl(),
                    (data: any, error: any) => {
                        if (!error) {
                            this.pipPictureId = data.id;
                            this.pipPicture = {
                                id: data.id,
                                uri: null,
                                name: data.name
                            }
                            this.pictureStartState = PictureStates.Original;
                            this.control.reset();
                            if (successCallback) {
                                successCallback(this.pipPicture);
                            }
                        } else {
                            this.control.uploading = false;
                            this.control.upload = false;
                            this.control.progress = 0;
                            this.pictureStartState = PictureStates.Error;
                            if (errorCallback) {
                                errorCallback(error);
                            } else {
                                this.$log.error(error);
                            }
                        }
                    },
                    (state: pip.files.FileUploadState, progress: number) => {
                        this.control.progress = progress;
                    }
                );
            } else if (this.control.uri && this.pipPicture) {
                this.control.uploading = false;
                if (this.control.uri) {
                    this.pipPicture = {
                        id: this.control.id,
                        uri: this.control.uri,
                        name: this.control.name
                    }
                    this.pictureStartState = PictureStates.Original;
                    this.control.reset();
                    if (successCallback) {
                        successCallback(this.pipPicture);
                    }
                }
            }
        }

        public deletePicture(successCallback?: (response?: any) => void, errorCallback?: (error?: any) => void): void {
            if (this.pipPictureId) {
                this.pipPictureData.deletePicture(
                    this.pipPictureId,
                    () => {
                        this.pipPictureId = null;
                        this.control.reset(true);

                        if (successCallback) successCallback();
                    },
                    (error: any) => {
                        this.control.uploading = false;
                        this.control.upload = false;
                        this.control.progress = 0;
                        this.control.state = PictureStates.Error;

                        if (errorCallback) {
                            errorCallback(error);
                        } else {
                            this.$log.error(error);
                        }
                    });
            } else {
                this.control.uploading = false;
                this.pipPicture = {
                    id: null,
                    uri: null,
                    name: null
                }

                this.control.reset(true);
                if (successCallback) successCallback(this.pipPicture);
            }
        }

        public saveImage(successCallback?: (response?: any) => void, errorCallback?: (error?: any) => void): void {
            // Process changes of the image
            if (this.control.state == PictureStates.Changed) {
                this.savePicture(successCallback, errorCallback);
            }
            // Process deletion of the image
            else if (this.control.state == PictureStates.Deleted) {
                this.deletePicture(successCallback, errorCallback);
            }
            // Process copied of the image
            else if (this.control.state == PictureStates.Copied) {
                this.pipPicture = {
                    id: this.control.id,
                    name: this.control.name,
                    uri: this.control.uri
                }
                this.pictureStartState = PictureStates.Original;
                this.control.reset();
                successCallback(this.pipPicture);
            }
            // Process if no changes were made
            else {
                if (successCallback) {
                    if (this.pipPicture) {
                        successCallback(this.pipPicture);
                    } else {
                        successCallback(this.pipPictureId);
                    }
                }
            }
        }

        // Visual publics
        public empty(): boolean {
            return (this.control.url == '' && !this.control.uploading);
        }

        public isUpdated(): boolean {
            return this.control.state != PictureStates.Original;
        }

        // Process user events
        public readItemLocally(url, uriData, file, picture): void {
            if (picture) {
                this.control.file = null;
                this.control.name = picture.name;
                this.control.uri = picture.uri;
                this.control.id = picture.id;
                this.control.uriData = null;
                this.control.url = picture.uri ? picture.uri : picture.id ? this.pipPictureData.getPictureUrl(picture.id) : '';
                this.control.state == PictureStates.Copied
            } else {
                this.control.file = file;
                this.control.name = file ? file.name : url ? url.split('/').pop() : null;
                this.control.url = !file && url ? url : uriData ? uriData : '';
                this.control.uri = !file && url ? url : null;
                this.control.uriData = uriData;
                this.control.id = null;
                this.control.state = PictureStates.Changed;
            }
            this.onChange();
        }

        public onDeleteClick($event: JQueryEventObject): void {
            $event.stopPropagation();

            this.controlElement.focus();

            this.control.file = null;
            this.control.url = '';
            this.control.uri = null;
            this.control.uriData = null;
            this.control.name = null;
            this.control.id = null;
            if (this.control.state != PictureStates.Copied) this.control.state = PictureStates.Deleted;

            this.onChange();
        }

        public onKeyDown($event: KeyboardEvent): void {
            if ($event.keyCode == 13 || $event.keyCode == 32) {
                // !! Avoid clash with $apply()
                setTimeout(() => {
                    this.controlElement.trigger('click');
                }, 0);
            } else if ($event.keyCode == 46 || $event.keyCode == 8) {
                this.control.file = null;
                this.control.url = '';
                this.control.state = PictureStates.Deleted;
                this.onChange();
            } else if ($event.keyCode == 27) {
                this.control.reset();
            }
        }

        // Clean up url to remove broken icon
        public onImageError($event: JQueryEventObject): void {
            this.$scope.$apply(() => {
                this.control.url = '';
                let image = $($event.target);
                this.control.state = PictureStates.Error;
                this.pipPictureUtils.setErrorImageCSS(image, { width: 'auto', height: '100%' });
            });
        }

        // When image is loaded resize/reposition it
        public onImageLoad($event): void {
            let image = $($event.target);
            let container: any = {}; //JQuery = _.cloneDeep(this.controlElement);
            container.clientWidth = 80;
            container.clientHeight = 80;
            this.pipPictureUtils.setImageMarginCSS(container, image);
            this.control.uploading = false;
        }

        // On change event
        public onChange(): void {
            if (this.pipChanged) {
                this.pipChanged({
                    $event: { sender: this.control },
                    $control: this.control
                });
            }
        }

    }

    const PictureEditComponent: ng.IComponentOptions = {
        bindings: PictureEditBindings,
        templateUrl: 'picture_edit/PictureEdit.html',
        controller: PictureEditController
    }

    angular
        .module('pipPictureEdit', ['ui.event', 'pipPicturePaste',
            'pipTranslate', 'angularFileUpload', 'pipPictures.Templates'])
        .config(ConfigPictureEditTranslations)
        .component('pipPictureEdit', PictureEditComponent);
}

