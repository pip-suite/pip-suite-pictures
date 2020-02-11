export interface ICameraDialogService {
    show(successCallback?: (result) => void, cancelCallback?: () => void): any;
}