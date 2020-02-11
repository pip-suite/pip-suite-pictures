import { ImageSet } from './ImageSet';
import { DataPage } from './DataPage';

export interface IImageSetDataService {
    readImageSets(params: any, successCallback?: (data: DataPage<ImageSet>) => void,
        errorCallback?: (error: any) => void): ng.IPromise<any>;
    readImageSet(id: string, successCallback?: (data: ImageSet) => void,
        errorCallback?: (error: any) => void): ng.IPromise<any>;
    updateImageSet(id: string, data: ImageSet, successCallback?: (data: ImageSet) => void,
        errorCallback?: (error: any) => void): void;
    createImageSet(data: ImageSet, successCallback?: (data: any) => void,
        errorCallback?: (error: any) => void): void;
    deleteImageSet(id: string, successCallback?: () => void,
        errorCallback?: (error: any) => void): void;
}

