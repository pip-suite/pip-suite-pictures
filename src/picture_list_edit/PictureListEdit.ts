import { IPictureUtilsService } from '../utilities/IPictureUtils';
import { PicturePaste } from '../utilities/PicturePaste';
import { IPictureDataService, Attachment, BlobInfo } from '../data';

let async = require('async');

export class PictureListEditItem {
    public pin: number;
    public id: string;
    public uri: string;
    public name: string;
    public url: string;
    public uriData: any;
    public uploading: boolean;
    public uploaded: boolean;
    public progress: number;
    public file: any;
    public upload?: any;
    public state: string;
    public loaded?: boolean;
}

export class PictureListEditControl {
    public uploading: number = 0;
    public items: PictureListEditItem[];
    public reset: () => void;
    public save: (successCallback?: (data?: Attachment[]) => void, errorCallback?: (error?: PictureUploadErrors[]) => void) => void;
    public abort: () => void;
    public error?: any;
}


export class PictureListEditStates {
    static Added: string = 'added';
    static Original: string = 'original';
    static Copied: string = 'copied';
    static Changed: string = 'changed';
    static Deleted: string = 'deleted';
    static Error: string = 'error';
}

export class PictureUploadErrors {
    id: string;
    uri: string;
    name: string;
}

{

    const ConfigPictureListEditTranslations = (pipTranslateProvider: pip.services.ITranslateProvider) => {
        pipTranslateProvider.translations('en', {
            'PICTURE_LIST_EDIT_TEXT': 'Click here to add a picture',
            'ERROR_TRANSACTION_IN_PROGRESS': 'Transaction is in progress. Please, wait until it is finished or abort',
            'ERROR_IMAGE_PRELOADING': 'Image loading error. The picture can not be saved'
        });
        pipTranslateProvider.translations('ru', {
            'PICTURE_LIST_EDIT_TEXT': 'Нажмите сюда чтобы добавить картинку',
            'ERROR_TRANSACTION_IN_PROGRESS': 'Транзакция еще не завершена. Подождите окончания или прервите её',
            'ERROR_IMAGE_PRELOADING': 'Ошибка при загрузки картинки. Картинка не сохранена.'
        });
    }


    class SenderEvent {
        sender: PictureListEditControl;
    }

    class PictureEvent {
        $event: SenderEvent;
        $control: PictureListEditControl;
    }

    interface IPictureListEditBindings {
        [key: string]: any;

        ngDisabled: any;
        pipCreated: any;
        pipChanged: any;
        pictures: any;
        pipAddedPicture: any;
        text: any;
        icon: any;
        pipRebind: any;
    }

    const PictureListEditBindings: IPictureListEditBindings = {
        ngDisabled: '<?',
        pipCreated: '&?',
        pipChanged: '&?',
        pictures: '=?pipPictures',
        pipAddedPicture: '&?',
        text: '<?pipDefaultText',
        icon: '<?pipDefaultIcon',
        pipRebind: '<?',
    }

    class PictureListEditBindingsChanges implements ng.IOnChangesObject, IPictureListEditBindings {
        [key: string]: ng.IChangesObject<any>;

        ngDisabled: ng.IChangesObject<boolean>;
        pipCreated: ng.IChangesObject<(params: PictureEvent) => ng.IPromise<void>>;
        pipChanged: ng.IChangesObject<(params: PictureEvent) => ng.IPromise<void>>;
        pictures: ng.IChangesObject<Attachment[]>;
        pipAddedPicture: ng.IChangesObject<() => boolean>;
        text: ng.IChangesObject<string>;
        icon: ng.IChangesObject<string>;
        pipRebind: ng.IChangesObject<boolean>;
    }

    class PictureListEditController {
        private controlElement: any;
        private pipPicturePaste: PicturePaste;
        private pictureStartState: string;
        private cancelQuery: any;

        public ngDisabled: boolean;
        public pipCreated: (params: PictureEvent) => void;
        public pipChanged: (params: PictureEvent) => void;
        public text: string;
        public icon: string;
        public pictures: Attachment[];
        public pipAddedPicture: () => boolean;
        public pipRebind: boolean;

        public control: PictureListEditControl;
        private itemPin: number;
        private errorText: string;

        constructor(
            private $log: ng.ILogService,
            private $scope: ng.IScope,
            private $rootScope: ng.IRootScopeService,
            private $element: JQuery,
            private pipPictureUtils: IPictureUtilsService,
            private $timeout: ng.ITimeoutService,
            private pipFileUpload: pip.files.IFileUploadService,
            private pipRest: pip.rest.IRestService,
            private pipPictureData: IPictureDataService
        ) {
            "ngInject";

            this.itemPin = 0;
            this.pipPicturePaste = new PicturePaste($timeout);
            this.pictureStartState = this.toBoolean(this.pipAddedPicture) ? PictureListEditStates.Copied : PictureListEditStates.Original;

            this.text = this.text || 'PICTURE_LIST_EDIT_TEXT';
            this.icon = this.icon || 'picture-no-border';
            this.errorText = 'PICTURE_ERROR_LOAD';

            this.control = new PictureListEditControl();
            this.control.uploading = 0;
            this.control.items = [];
            this.control.reset = () => {
                this.reset();
            }
            this.control.save = (successCallback?: (data?: Attachment[]) => void, errorCallback?: (error?: PictureUploadErrors[]) => void): void => {
                this.save(successCallback, errorCallback);
            }
            this.control.abort = (): void => {
                this.abort();
            }
            // Add class
            $element.addClass('pip-picture-list-edit');
        }

        private toBoolean(value: any): boolean {
            if (value == null) {
                return false;
            }
            if (!value) {
                return false;
            }
            value = value.toString().toLowerCase();

            return value == '1' || value == 'true';
        }

        public filterItem(item: PictureListEditItem): boolean {
            return item.state != PictureListEditStates.Deleted;
        }

        public $postLink() {
            this.controlElement = this.$element.find('.pip-picture-drop')

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

        private removeItem(item: PictureListEditItem): void {
            if (item.state === PictureListEditStates.Added || item.state === PictureListEditStates.Copied) {
                let index = _.findIndex(this.control.items, { pin: item.pin });
                if (index > -1) {
                    this.control.items.splice(index, 1);
                }
            } else {
                item.state = PictureListEditStates.Deleted;
            }
        }

        public $onChanges(changes: PictureListEditBindingsChanges): void {
            if (changes.pipRebind && changes.pipRebind.currentValue !== changes.pipRebind.previousValue) {
                this.pipRebind = changes.pipRebind.currentValue;
            }

            if (changes.ngDisabled && changes.ngDisabled.currentValue !== changes.ngDisabled.previousValue) {
                this.ngDisabled = changes.ngDisabled.currentValue;
            }

            if (this.pipRebind) {
                if (changes.pictures && !_.isEqual(changes.pictures.currentValue, this.pictures)) {
                    this.pictures = changes.pictures.currentValue;
                    this.control.reset();
                }
            }

            this.pictures = this.pictures ? this.pictures : [];
        }

        public onImageError($event: JQueryEventObject, item: PictureListEditItem): void {

            item.state = PictureListEditStates.Error;
            item.url = '';
        }

        public onFocus(): void {
            this.pipPicturePaste.addPasteListener((item) => {
                this.readItemLocally(item.url, item.uriData, item.file, item.picture);
            });
        }

        public onBlur(): void {
            this.pipPicturePaste.removePasteListener();
        }

        public getItems(): PictureListEditItem[] {
            let items: PictureListEditItem[] = [];
            let i: number;

            if (this.pictures == null || this.pictures.length == 0) {
                return items;
            }

            for (i = 0; i < this.pictures.length; i++) {
                let newItem: PictureListEditItem = {
                    pin: this.itemPin++,
                    id: this.pictures[i].id,
                    name: this.pictures[i].name,
                    uri: this.pictures[i].uri,
                    uriData: null,
                    uploading: false,
                    uploaded: false,
                    progress: 0,
                    file: null,
                    url: this.pictures[i].id ? this.pipPictureData.getPictureUrl(this.pictures[i].id) : this.pictures[i].uri,
                    state: this.pictureStartState
                };
                items.push(newItem);
            }

            return items;
        }

        public setItems(): void {
            let i: number;

            // Clean the array
            if (this.pictures && this.pictures.length > 0) {
                this.pictures.splice(0, this.pictures.length);
            }
            for (i = 0; i < this.control.items.length; i++) {
                let item = this.control.items[i];
                if ((item.id || item.uri) && item.state != PictureListEditStates.Deleted) {
                    let newPic: Attachment = {
                        id: item.id,
                        name: item.name,
                        uri: item.uri
                    };
                    this.pictures.push(newPic);
                }
            }
        }

        public reset(): void {
            if (!this.controlElement) { return }
            this.control.uploading = 0;
            this.control.items = this.getItems();
        }

        private addItem(oldItem: PictureListEditItem, fileInfo: BlobInfo, error: any) {
            let itemIndex = _.findIndex(this.control.items, { pin: oldItem.pin });
            if (itemIndex < 0) return;
            if (error) {
                this.control.items[itemIndex].uploaded = false;
                this.control.items[itemIndex].uploading = false;
                this.control.items[itemIndex].progress = 0;
                this.control.items[itemIndex].upload = null;
                this.control.items[itemIndex].state = PictureListEditStates.Error;
            } else {
                if (fileInfo) {
                    this.control.items[itemIndex].id = fileInfo.id;
                    this.control.items[itemIndex].name = fileInfo.name;
                    this.control.items[itemIndex].uploaded = true;
                    this.control.items[itemIndex].state = PictureListEditStates.Original;
                } else {
                    this.control.items[itemIndex].uploaded = false;
                }                
                this.control.items[itemIndex].uploading = false;
                this.control.items[itemIndex].uriData = null;
                this.control.items[itemIndex].progress = 0;
                this.control.items[itemIndex].upload = null;
                this.control.items[itemIndex].file = null;
            }
        }

        public deleteItem(item: PictureListEditItem, callback?: (data?: any) => void): void {
            // Avoid double transactions
            if (item.upload) {
                item.upload.abort();
                item.upload = null;
            }

            if (item.state != PictureListEditStates.Deleted) {
                return;
            }

            this.removeItem(item);
            callback();

        }

        public save(successCallback?: (data: Attachment[]) => void, errorCallback?: (errors?: any) => void): void {
            let item: PictureListEditItem;
            let onItemCallback: (error: any) => void;
            let i: number;

            if (this.control.uploading) {
                if (errorCallback) {
                    errorCallback('ERROR_TRANSACTION_IN_PROGRESS');
                }

                return;
            }

            this.cancelQuery = null;
            this.control.error = null;
            this.control.uploading = 0;

            let addedBlobCollection = [];
            let addedUrlCollection = [];

            _.each(this.control.items, (item) => {
                if (item.state == 'added') {
                    if (item.file) {
                        addedBlobCollection.push(item);
                    } else {
                        addedUrlCollection.push(item);
                    }
                }
            });


            let deletedCollection = _.filter(this.control.items, { state: 'deleted' });

            // process addedUrlCollection
            _.each(addedUrlCollection, (item) => {
                item.uploaded = true;
                item.uploading = false;
                item.progress = 0;
                item.upload = null;
                item.uriData = null;
                item.file = null;
                item.state = PictureListEditStates.Original;
            });

            if (!addedBlobCollection.length && !deletedCollection.length) {
                // do nothing
                if (addedUrlCollection.length > 0) {
                    this.setItems();
                }
                this.control.uploading = 0;
                if (successCallback) {
                    successCallback(this.pictures);
                }

                return;
            }

            this.control.uploading = addedBlobCollection.length + deletedCollection.length;
            async.parallel([
                (callbackAll) => {
                    // add documents
                    _.each(addedBlobCollection, (item) => {
                        item.uploading = true;
                        item.progress = 0;
                    });
                    this.pipFileUpload.multiUpload(
                        this.pipPictureData.postPictureUrl(),
                        addedBlobCollection,
                        (index: number, data: BlobInfo, err: any) => {
                            let item = addedBlobCollection[index];
                            this.addItem(item, data, err);
                            if (err) {
                                this.control.error = true;
                            }
                        },
                        (index: number, state: pip.files.FileUploadState, progress: number) => {
                            // update item progress 
                            let item = addedBlobCollection[index];
                            item.progress = progress;
                        },
                        (error: any, result: any, res: any) => {
                            // reset upload abort
                            this.cancelQuery = null;
                            callbackAll();
                        },
                        (cancelQuery: any) => {
                            this.cancelQuery = cancelQuery;
                        },
                        false,
                        'pin'
                    );
                },
                (callbackAll) => {
                    // delete documents
                    if (deletedCollection.length) {
                        async.each(deletedCollection,
                            (item, callback) => {
                                this.deleteItem(item, (error: any) => { callback() });
                            },
                            (error, result) => {
                                callbackAll();
                            });
                    } else {
                        callbackAll();
                    }

                }
            ],
                // optional callback
                (error, results) => {
                    if (error && !this.control.error) {
                        this.control.error = error;
                    }
                    if (this.control.error) {
                        this.control.uploading = 0;
                        let errors = this.getUploadErors();
                        if (errorCallback) {
                            errorCallback(errors);
                        } else {
                            this.$log.error(errors);   // eslint-disable-line no-console
                        }
                    } else {
                        this.setItems();
                        this.control.uploading = 0;
                        if (successCallback) {
                            successCallback(this.pictures);
                        }
                    }
                });
        }

        private getUploadErors(): PictureUploadErrors[] {
            let errors: PictureUploadErrors[] = [];

            _.each(this.control.items, (item: PictureListEditItem) => {
                if (item.state == PictureListEditStates.Error || item.state == PictureListEditStates.Error) {
                    errors.push({
                        id: item.id,
                        uri: item.uri,
                        name: item.name
                    })
                }
            });

            return errors;
        }

        public abort(): void {
            let i: number;

            for (i = 0; i < this.control.items.length; i++) {
                let item: PictureListEditItem = this.control.items[i];

                if (item.uploading) {
                    if (item.upload) {
                        item.upload.abort();
                    }
                    item.uploaded = false;
                    item.uploading = false;
                    item.progress = 0;
                    item.upload = null;
                }
            }

            // abort upload
            if (this.cancelQuery) {
                this.cancelQuery.resolve();
            }

            // Abort transaction
            this.control.uploading = 0;
            this.control.error = true;
        }

        public readItemLocally(url, uriData, file, picture): void {
            let item: PictureListEditItem = new PictureListEditItem();
            item.pin = this.itemPin++;
            item.uploading = false;
            item.uploaded = false;
            item.progress = 0;

            if (picture) {
                item.file = null;
                item.name = picture.name;
                item.uri = picture.uri;
                item.id = picture.id;
                item.uriData = null;
                item.url = picture.uri ? picture.uri : picture.id ? this.pipPictureData.getPictureUrl(picture.id) : '';
                item.state == PictureListEditStates.Copied
            } else {
                item.file = file;
                item.name = file ? file.name : url ? url.split('/').pop() : null;
                item.url = !file && url ? url : uriData ? uriData : '';
                item.uri = !file && url ? url : null;
                item.uriData = uriData;
                item.id = null;
                item.state = PictureListEditStates.Added;
            }
            this.control.items.push(item);
            this.onChange();
        }

        public onSelectClick($files: any): void {
            let i: number;
            this.controlElement.focus();

            if ($files == null || $files.length == 0) { return; }
            for (i = 0; i < $files.length; i++) {
                let file: any = $files[i];

                if (file.type.indexOf('image') > -1) {
                    this.readItemLocally('', null, file, null);
                }
            }
        }

        public onDeleteClick(item: PictureListEditItem): void {
            this.removeItem(item);

            this.onChange();
        }

        public onKeyDown($event: KeyboardEvent, item: PictureListEditItem): void {
            if (item) {
                if ($event.keyCode == 46 || $event.keyCode == 8) {
                    if (item.state == PictureListEditStates.Added) {
                        this.removeItem(item);
                    } else {
                        item.state = PictureListEditStates.Deleted;
                    }

                    this.onChange();
                }
            } else {
                if ($event.keyCode == 13 || $event.keyCode == 32) {
                    // !! Avoid clash with $apply()
                    setTimeout(() => {
                        this.controlElement.trigger('click');
                    }, 0);
                }
            }
        }

        public onImageLoad($event: JQueryEventObject, item: PictureListEditItem): void {
            setTimeout(() => {
                let image = $($event.target);
                let container: any = {};
                container.clientWidth = 80;
                container.clientHeight = 80;
                this.pipPictureUtils.setImageMarginCSS(container, image);
            }, 250);

            item.loaded = true;
        }

        // On change event
        public onChange() {
            if (this.pipChanged) {
                this.pipChanged({
                    $event: { sender: this.control },
                    $control: this.control
                });
            }
        }

    }

    const PictureListEditComponent: ng.IComponentOptions = {
        bindings: PictureListEditBindings,
        templateUrl: 'picture_list_edit/PictureListEdit.html',
        controller: PictureListEditController
    }

    angular
        .module('pipPictureListEdit', ['ui.event', 'pipPicturePaste',
            'pipFocused', 'angularFileUpload', 'pipPictures.Templates'])
        .config(ConfigPictureListEditTranslations)
        .component('pipPictureListEdit', PictureListEditComponent);
}
