import { GallerySearchDialogParams } from './IGallerySearchDialogService'
import { IImageSetDataService, IPictureDataService, DataPage, Attachment, ImageSet } from '../data';



const ConfigGallerySearchDialogTranslations = (pipTranslateProvider: pip.services.ITranslateProvider) => {
    pipTranslateProvider.translations('en', {
        'IMAGE_GALLERY': 'Add from image gallery',
        'SEARCH_PICTURES': 'Search for pictures...',
        'IMAGE_START_SEARCH': 'Images will appear here once you start searching'
    });
    pipTranslateProvider.translations('ru', {
        'IMAGE_GALLERY': 'Добавить из галереи изображений',
        'SEARCH_PICTURES': 'Поиск изображений...',
        'IMAGE_START_SEARCH': 'Картинки появятся после начала поиска'
    });
}

class GallerySearchDialogImage {
    public checked: boolean;
    public url: string;
    public thumbnail: any
    public item: Attachment
}

class GallerySearchDialogController extends GallerySearchDialogParams {

    public theme: string;

    public prevSearch: string = '';
    private url: string;
    public images: any[];
    public imagesSearchResult: any[];
    public search: string;
    public transaction: pip.services.Transaction;

    constructor(
        private $log: ng.ILogService,
        private $mdDialog: angular.material.IDialogService,
        private $rootScope: ng.IRootScopeService,
        private $timeout: ng.ITimeoutService,
        private $mdMenu,
        public multiple: boolean,
        private $http: ng.IHttpService,
        private pipRest: pip.rest.IRestService,
        private pipTransaction: pip.services.ITransactionService,
        private pipImageSetData: IImageSetDataService,
        private pipPictureData: IPictureDataService
    ) {
        "ngInject";

        super();

        // this.url = this.pipRest.serverUrl + '/api/images/search';
        this.images = [];
        this.theme = this.$rootScope[pip.themes.ThemeRootVar];
        this.search = '';
        this.imagesSearchResult = [];
        this.transaction = this.pipTransaction.create('search');

        this.focusSearchText();
    }

    public onSearchClick(): void {
        if (this.transaction.busy()) return;

        if (this.search == '' || this.search == this.prevSearch) return;

        this.prevSearch = this.search;
        this.imagesSearchResult = [];

        // let requestUrl: string = this.url + '?q=' + this.search;

        let transactionId: string = this.transaction.begin('ENTERING');
        if (!transactionId) return;

        this.pipImageSetData.readImageSets(
            {
                Search: this.search
            },
            (result: DataPage<ImageSet>) => {
                if (this.transaction.aborted(transactionId)) return;

                _.each(result.data, (item: ImageSet) => { // todo add type to image_set
                    _.each(item.pics, (img: Attachment) => {
                        let newImage: GallerySearchDialogImage = {
                            checked: false,
                            url: img.uri ? img.uri : this.pipPictureData.getPictureUrl(img.id),
                            item: img,
                            // todo ?? thumbnail
                            thumbnail: img.uri ? img.uri : this.pipPictureData.getPictureUrl(img.id)
                        };
                        this.imagesSearchResult.push(newImage);
                    })

                })

                this.transaction.end();
            },
            (error) => {
                this.transaction.end(error);
                this.$log.error(error);
            }
        )
    } Attachment

    public onStopSearchClick(): void {
        this.transaction.abort();
        this.prevSearch = '';
    }

    public onKeyPress($event: KeyboardEvent): void {
        if ($event.keyCode === 13) {
            this.onSearchClick();
        }
    }

    public onImageClick(image: GallerySearchDialogImage): void {
        if (this.transaction.busy()) { return; }

        image.checked = !image.checked;

        if (this.multiple) {
            if (image.checked) {
                this.images.push(image);
            } else {
                _.remove(this.images, { url: image.url });
            }
        } else {
            if (image.checked) {
                if (this.images.length > 0) {
                    this.images[0].checked = false;
                    this.images[0] = image;
                } else {
                    this.images.push(image);
                }
            } else {
                this.images = [];
            }
        }
    }

    public onAddClick(): void {
        if (this.transaction.busy()) { return; }

        let result: Attachment[] = [];
        this.images.forEach((image: GallerySearchDialogImage) => {
            if (image.checked) {
                result.push(image.item);
            }
        });
        this.$mdDialog.hide(result);
    }

    public onCancelClick(): void {
        this.$mdDialog.cancel();
    }

    public addButtonDisabled(): boolean {
        return this.images.length == 0 || this.transaction.busy();
    }

    public focusSearchText(): void {
        setTimeout(() => {
            let element = $('.pip-gallery-search-dialog .search-images');
            if (element.length > 0) {
                element.focus();
            }
        }, 0);
    }
}



angular
    .module('pipGallerySearchDialog')
    .config(ConfigGallerySearchDialogTranslations)
    .controller('pipGallerySearchController', GallerySearchDialogController);