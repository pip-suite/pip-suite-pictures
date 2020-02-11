import { Attachment } from '../data';

export class GallerySearchDialogParams {
    public multiple: boolean;
}

export interface IGallerySearchDialogService {
    show(params: GallerySearchDialogParams, successCallback?: (result: Attachment[][]) => void, cancelCallback?: () => void): any;
}

