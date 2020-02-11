import { IPictureUrlDialogService } from './IPictureUrlDialogService';

class PictureUrlDialogService implements IPictureUrlDialogService {
    private _mdDialog: angular.material.IDialogService;

    constructor($mdDialog: angular.material.IDialogService) {
        this._mdDialog = $mdDialog;
    }

    public show(successCallback?: (result) => void, cancelCallback?: () => void) {
        this._mdDialog.show({
            templateUrl: 'picture_url_dialog/PictureUrlDialog.html',
            clickOutsideToClose: true,
            controller: 'pipPictureUrlDialogController',
            controllerAs: '$ctrl'
        })
        .then(
            (result) => {
                if (successCallback) {
                    successCallback(result);
                }
            });
    }
}

angular
    .module('pipPictureUrlDialog')
    .service('pipPictureUrlDialog', PictureUrlDialogService);

