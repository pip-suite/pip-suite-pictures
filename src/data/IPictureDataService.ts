import { BlobInfo } from './BlobInfo';
import { DataPage } from './DataPage';

export class PictureConfig {
    public PictureRoute: string;
    public DefaultErrorIcon: string;
    public ShowErrorIcon: boolean;
}

export interface IPictureDataService {
    PictureRoute: string;
    DefaultErrorIcon: string;
    ShowErrorIcon: boolean;

    getPictureUrl(id: string): string;
    postPictureUrl(): string
    readPictures(params: any, successCallback?: (data: DataPage<BlobInfo>) => void, errorCallback?: (error: any) => void): angular.IPromise<any>
    readPictureInfo(params: any, successCallback?: (data: BlobInfo) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
    readPicture(id: string, successCallback?: (data: any) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
    deletePicture(id: string, successCallback?: () => void, errorCallback?: (error: any) => void): void;    
}


export interface IPictureDataProvider extends ng.IServiceProvider {
    PictureRoute: string;
    DefaultErrorIcon: string;
    ShowErrorIcon: boolean;

    getPictureUrl(id: string): string;
}
