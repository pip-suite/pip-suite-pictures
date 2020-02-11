import { IPictureUtilsService } from '../utilities/IPictureUtils';
import { PicturePaste } from '../utilities/PicturePaste';
import { IAvatarDataService } from '../data/IAvatarDataService';
import { AddImageOption } from '../add_image/AddImageOption';
import { AddImageResult } from '../add_image/AddImageResult';

export const ReloadAvatar = 'pipReloadAvatar';

export class AvatarEditControl {
    public reset: (afterDeleting?: boolean) => void;
    public save: (id?: string, successCallback?: (response?: any) => void, errorCallback?: (error?: any) => void) => void;
    public abort: () => void;
    public error?: any;

    public disabled: boolean = false;
    public url: string = '';
    public uriData: any;
    public progress: number = 0;
    public uploaded: boolean = false;
    public uploading: boolean = false;
    public upload: boolean = false;
    public loaded: boolean = false;
    public file: any = null;
    public state: string = AvatarStates.Original;
}

export class AvatarStates {
    static Original: string = 'original';
    static Changed: string = 'changed';
    static Deleted: string = 'deleted';
    static Error: string = 'error';
}

{
    const ConfigAvatarEditTranslations = (pipTranslateProvider: pip.services.ITranslateProvider) => {
        pipTranslateProvider.translations('en', {
            'PICTURE_EDIT_TEXT': 'Click here to upload a picture',
            'PICTURE_ERROR_LOAD': 'Error image loading'
        });
        pipTranslateProvider.translations('ru', {
            'PICTURE_EDIT_TEXT': 'Нажмите сюда для загрузки картинки',
            'PICTURE_ERROR_LOAD': 'Ошибка загрузки картинки'
        });
    }


    class SenderEvent {
        $control: AvatarEditControl;
    }

    class AvatarEvent {
        $event: SenderEvent;
        $control: AvatarEditControl;
    }

    interface IAvatarEditBindings {
        [key: string]: any;

        ngDisabled: any;
        pipCreated: any;
        pipChanged: any;
        pipReset: any;
        pipId: any;
        text: any;
        icon: any;
        pipRebind: any;
    }

    const AvatarEditBindings: IAvatarEditBindings = {
        ngDisabled: '<?',
        pipCreated: '&?',
        pipChanged: '&?',
        pipReset: '<?',
        pipId: '<?',
        text: '<?pipDefaultText',
        icon: '<?pipDefaultIcon',
        pipRebind: '<?',
    }

    class AvatarEditBindingsChanges implements ng.IOnChangesObject, IAvatarEditBindings {
        [key: string]: ng.IChangesObject<any>;

        ngDisabled: ng.IChangesObject<boolean>;
        pipCreated: ng.IChangesObject<(params: AvatarEvent) => ng.IPromise<void>>;
        pipChanged: ng.IChangesObject<(params: AvatarEvent) => ng.IPromise<void>>;
        pipReset: ng.IChangesObject<boolean>;
        pipId: ng.IChangesObject<string>;
        text: ng.IChangesObject<string>;
        icon: ng.IChangesObject<string>;
        pipRebind: ng.IChangesObject<boolean>;
    }

    class AvatarEditController {
        private controlElement: any;
        private inputElement: any;
        private pipPicturePaste: PicturePaste;

        public ngDisabled: boolean;
        public pipCreated: (params: AvatarEvent) => void;
        public pipChanged: (params: AvatarEvent) => void;
        public pipReset: boolean;
        public text: string;
        public icon: string;
        public pipId: string;
        public pipRebind: boolean;

        public multiUpload: boolean;
        public errorText: string;
        public control: AvatarEditControl;
        public option: AddImageOption;

        constructor(
            private $log: ng.ILogService,
            private $scope: ng.IScope,
            private $http: ng.IHttpService,
            private $rootScope: ng.IRootScopeService,
            private $element: JQuery,
            private $timeout: ng.ITimeoutService,
            private pipAvatarData: IAvatarDataService,
            private pipCodes: pip.services.ICodes,
            private pipPictureUtils: IPictureUtilsService,
            private pipFileUpload: pip.files.IFileUploadService,
            private pipRest: pip.rest.IRestService
        ) {
            "ngInject";
            this.pipPicturePaste = new PicturePaste($timeout);
            this.option = new AddImageOption();
            this.option.WebLink = false;
            this.option.Galery = false;

            this.text = this.text || 'PICTURE_EDIT_TEXT';
            this.icon = this.icon || 'picture-no-border';
            this.errorText = 'PICTURE_ERROR_LOAD';

            this.control = new AvatarEditControl();
            this.multiUpload = false;

            this.control.reset = (afterDeleting: boolean) => {
                this.reset(afterDeleting);
            }
            this.control.save = (id?: string, successCallback?: (response?: any) => void, errorCallback?: (error?: any) => void): void => {
                this.save(id, successCallback, errorCallback);
            }
            // Add class
            $element.addClass('pip-picture-edit');
        }

        public $postLink() {
            this.controlElement = this.$element.children('.pip-picture-upload');
            this.inputElement = this.controlElement.children('input[type=file]');

            // Add paste listener
            this.$element.children('.pip-picture-upload').focus(() => {
                this.pipPicturePaste.addPasteListener((item) => {
                    this.readItemLocally(item.url, item.uriData, item.file, item.picture);
                });
            });

            this.$element.children('.pip-picture-upload').blur(() => {
                this.pipPicturePaste.removePasteListener();
            });

            // Execute callback
            if (this.pipCreated) {
                this.pipCreated({
                    $event: { $control: this.control },
                    $control: this.control
                });
            }

            // Initialize control
            this.control.reset();
        }

        public $onChanges(changes: AvatarEditBindingsChanges): void {
            if (changes.pipRebind && changes.pipRebind.currentValue !== changes.pipRebind.previousValue) {
                this.pipRebind = changes.pipRebind.currentValue;
            }
            if (changes.pipReset && changes.pipReset.currentValue !== changes.pipReset.previousValue) {
                this.pipReset = changes.pipReset.currentValue;
            }

            let isReset: boolean = false;
            if (this.pipRebind) {

                if (changes.pipId && changes.pipId.currentValue !== changes.pipId.previousValue) {
                    this.pipId = changes.pipId.currentValue;
                    if (this.pipReset !== false) {
                        isReset = true;
                    }
                }

                if (changes.ngDisabled && changes.ngDisabled.currentValue !== changes.ngDisabled.previousValue) {
                    this.ngDisabled = changes.ngDisabled.currentValue;
                }
            }
            if (changes.pipId && changes.pipId.currentValue && this.control && this.control.state != AvatarStates.Deleted && this.control.state != AvatarStates.Changed ) {
                isReset = true;
            }
            if (isReset) {
                this.control.reset();
            }
        }

        public reset(afterDeleting: boolean): void {
            this.control.progress = 0;
            this.control.uploading = false;
            this.control.uploaded = false;

            this.control.file = null;
            this.control.state = AvatarStates.Original;
            this.control.url = '';
            this.control.uriData = null;

            if (!afterDeleting) {
                var url = this.pipId ? this.pipAvatarData.getAvatarUrl(this.pipId) : '';

                if (!url) return;

                this.control.progress = 0;
                this.control.url = url;
                this.control.uploaded = this.control.url != '';
                this.onChange();

            } else this.onChange();
        }

        public saveAvatar(id: string, successCallback?: (response?: any) => void, errorCallback?: (error?: any) => void): void {
            if (!id) {
                id = this.pipId;
            }
            if (this.control.file !== null) {
                let fd: FormData = new FormData();
                fd.append('file', this.control.file);
                this.control.uploading = true;
                this.$http.put(this.pipAvatarData.getAvatarUrl(id), fd, <any>{
                    uploadEventHandlers: {
                        progress: (e: any) => {
                            if (e.lengthComputable) {
                                this.control.progress = (e.loaded / e.total) * 100;
                            }
                        }
                    },
                    headers: { 'Content-Type': undefined }
                })
                    .success((response: any) => {
                        this.control.progress = 100;

                        this.pipId = response.id;
                        this.$rootScope.$broadcast(ReloadAvatar, this.pipId);
                        
                        this.control.reset();
                        if (successCallback) {
                            successCallback(response);
                        }
                    })
                    .error((error: any) => {
                        this.control.progress = 0;
                        this.control.uploading = false;
                        this.control.upload = false;
                        this.control.progress = 0;
                        this.control.state = AvatarStates.Original; //AvatarStates.Error;

                        if (errorCallback) {
                            errorCallback(error);
                        } else {
                            this.$log.error(error);
                        }
                    });
            }
        }

        public deletePicture(successCallback?: (response?: any) => void, errorCallback?: (error?: any) => void): void {
            this.pipAvatarData.deleteAvatar(
                this.pipId,
                () => {
                    this.$rootScope.$broadcast(ReloadAvatar, this.pipId);
                    this.control.reset(true);

                    if (successCallback) { successCallback(); }
                },
                (error: any) => {
                    this.control.uploading = false;
                    this.control.upload = false;
                    this.control.progress = 0;
                    this.control.state = AvatarStates.Original; // AvatarStates.Error;

                    if (errorCallback) {
                        errorCallback(error);
                    } else {
                        this.$log.error(error);
                    }
                }
            );
        }

        public save(id: string, successCallback?: (response?: any) => void, errorCallback?: (error?: any) => void): void {
            // Process changes of the image
            if (this.control.state == AvatarStates.Changed) {
                this.saveAvatar(id, successCallback, errorCallback);
            }
            // Process deletion of the image
            else if (this.control.state == AvatarStates.Deleted) {
                this.deletePicture(successCallback, errorCallback);
            }
            // Process if no changes were made 
            else {
                if (successCallback) successCallback();
            }
        }

        // Visual publics
        public empty(): boolean {
            return this.control.url == '' && !this.control.uploading;
        };

        public isUpdated(): boolean {
            return this.control.state != AvatarStates.Original;
        };

        // Process user events
        public readItemLocally(url, uriData, file, picture): void {
            if (picture) {
                // todo set avatar
                this.control.url = this.pipAvatarData.getAvatarUrl(this.pipId);
            } else {
                this.control.file = file;
                this.control.url = file ? uriData : url ? url : '';
                // todo uriData - save as blob
            }

            this.control.state = AvatarStates.Changed;
            this.onChange();
        };

        public onDeleteClick($event: JQueryEventObject): void {
            if ($event) {
                $event.stopPropagation();
            }

            this.controlElement.focus();
            this.control.file = null;
            this.control.url = '';
            this.control.state = AvatarStates.Deleted;

            this.onChange();
        };

        public onKeyDown($event: KeyboardEvent): void {
            if ($event.keyCode == 13 || $event.keyCode == 32) {
                setTimeout(() => {
                    this.controlElement.trigger('click');
                }, 0);
            } else if ($event.keyCode == 46 || $event.keyCode == 8) {
                this.control.file = null;
                this.control.url = '';
                this.control.state = AvatarStates.Deleted;

                this.onChange();
            } else if ($event.keyCode == 27) {
                this.control.reset();
            }
        };

        // Clean up url to remove broken icon
        public onImageError($event: JQueryEventObject): void {
            this.$scope.$apply(() => {
                this.control.url = '';
                let image = $($event.target);
                this.control.state = AvatarStates.Original; // AvatarStates.Error;
                this.pipPictureUtils.setErrorImageCSS(image, { width: 'auto', height: '100%' });
            });
        };

        // When image is loaded resize/reposition it
        public onImageLoad($event: JQueryEventObject) {
            let image = $($event.target);
            let container: any = {}; //JQuery = _.cloneDeep(this.controlElement);
            container.clientWidth = 80;
            container.clientHeight = 80;
            this.pipPictureUtils.setImageMarginCSS(container, image);
            this.control.uploading = false;
        };

        // On change event
        public onChange() {
            if (this.pipChanged) {
                this.pipChanged({
                    $event: { $control: this.control },
                    $control: this.control
                });
            }
        };

    }

    const AvatarEditComponent: ng.IComponentOptions = {
        bindings: AvatarEditBindings,
        templateUrl: 'picture_edit/PictureEdit.html',
        controller: AvatarEditController
    }

    angular
        .module('pipAvatarEdit', ['ui.event', 'pipPictureUtils', 'pipPictures.Templates', 'pipFiles'])
        .config(ConfigAvatarEditTranslations)
        .component('pipAvatarEdit', AvatarEditComponent);
}

