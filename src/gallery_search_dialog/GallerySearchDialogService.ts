import { IGallerySearchDialogService, GallerySearchDialogParams } from './IGallerySearchDialogService';
import { Attachment } from '../data';

class GallerySearchDialogService implements IGallerySearchDialogService {
    private _mdDialog: angular.material.IDialogService;

    constructor($mdDialog: angular.material.IDialogService) {
        this._mdDialog = $mdDialog;
    }

    public show(params: GallerySearchDialogParams, successCallback?: (result: Attachment[]) => void, cancelCallback?: () => void) {
        this._mdDialog.show({
            templateUrl: 'gallery_search_dialog/GallerySearchDialog.html',
            clickOutsideToClose: true,
            controller: 'pipGallerySearchController',
            controllerAs: '$ctrl',
            locals: params
        })
            .then(
            (result: Attachment[]) => {
                if (successCallback) {
                    successCallback(result);
                }
            });
    }

}

angular
    .module('pipGallerySearchDialog')
    .service('pipGallerySearchDialog', GallerySearchDialogService);