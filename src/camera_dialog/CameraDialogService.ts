import { ICameraDialogService } from './ICameraDialogService';

declare var Webcam: any;

class CameraDialogService implements ICameraDialogService {
    private _mdDialog: angular.material.IDialogService;

    constructor($mdDialog: angular.material.IDialogService) {
        this._mdDialog = $mdDialog;

    }

    public show(successCallback?: (result) => void, cancelCallback?: () => void) {
        this._mdDialog.show({
            templateUrl: 'camera_dialog/CameraDialog.html',
            clickOutsideToClose: true,
            controller: 'pipCameraDialogController',
            controllerAs: '$ctrl'
        })
        .then(
            (result) => {
                Webcam.reset();
                if (successCallback) {
                    successCallback(result);
                }
            }, 
            () => {
                Webcam.reset();
            }
        );

    }

}

angular
    .module('pipCameraDialog')
    .service('pipCameraDialog', CameraDialogService);