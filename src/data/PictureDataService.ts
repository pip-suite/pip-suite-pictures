import { IPictureDataService, IPictureDataProvider, PictureConfig } from './IPictureDataService';
import { BlobInfo } from './BlobInfo';
import { DataPage } from './DataPage';

class PictureData implements IPictureDataService {
    private RESOURCE: string = 'picture';
    private RESOURCE_INFO: string = 'pictureInfo';

    constructor(
        private _config: PictureConfig,
        private pipFormat: pip.services.IFormat,
        private pipRest: pip.rest.IRestService
    ) {
        "ngInject";
    }

    public get PictureRoute(): string {
        return this._config.PictureRoute;
    }

    public get ShowErrorIcon(): boolean {
        return this._config.ShowErrorIcon;
    }
    
    public get DefaultErrorIcon(): string {
        return this._config.DefaultErrorIcon;
    }

    public getPictureUrl(id: string): string {
        return this.pipRest.serverUrl + this._config.PictureRoute + '/' + id;
    }

    public postPictureUrl(): string {
        return this.pipRest.serverUrl + this._config.PictureRoute;
    }

    public readPictures(params: any, successCallback?: (data: DataPage<BlobInfo>) => void, errorCallback?: (error: any) => void): angular.IPromise<any> {
        params = params || {};
        if (params.filter) {
            params.filer = this.pipFormat.filterToString(params.filer);
        }

        return this.pipRest.getResource(this.RESOURCE).page(params, successCallback, errorCallback);
    }

    public readPictureInfo(params: any, successCallback?: (data: BlobInfo) => void, errorCallback?: (error: any) => void): angular.IPromise<any> {
        params = params || {};
        if (params.filter) {
            params.filer = this.pipFormat.filterToString(params.filer);
        }

        return this.pipRest.getResource(this.RESOURCE_INFO).get(params, successCallback, errorCallback);
    }

    public readPicture(id: string, successCallback?: (data: any) => void, errorCallback?: (error: any) => void): angular.IPromise<any> {

        return this.pipRest.getResource(this.RESOURCE).get({
            picture_id: id
        }, successCallback, errorCallback);
    }

    public deletePicture(id: string, successCallback?: () => void, errorCallback?: (error: any) => void): void {
        this.pipRest.getResource(this.RESOURCE).remove(
            { picture_id: id },
            null,
            successCallback,
            errorCallback
        );
    }
}

class PictureDataProvider implements IPictureDataProvider {
    private _service: IPictureDataService;
    private _config: PictureConfig;

    constructor(
        private pipRestProvider: pip.rest.IRestProvider
    ) {
        this._config = new PictureConfig();

        this._config.PictureRoute = '/api/1.0/blobs';
        this._config.ShowErrorIcon = true;
        this._config.DefaultErrorIcon = 'picture-no-border';
    }

    public get PictureRoute(): string {
        return this._config.PictureRoute;
    }

    public getPictureUrl(id: string): string {
        return this.pipRestProvider.serverUrl + this._config.PictureRoute + '/' + id;
    }

    public set PictureRoute(value: string) {
        this._config.PictureRoute = value;

        this.pipRestProvider.registerOperation('pictures', this._config.PictureRoute + '/:picture_id');
    }

    public get DefaultErrorIcon(): string {
        return this._config.DefaultErrorIcon;
    }

    public set DefaultErrorIcon(value: string) {
        this._config.DefaultErrorIcon = value;

        this.pipRestProvider.registerOperation('pictures', this._config.PictureRoute + '/:picture_id');
    }

    public get ShowErrorIcon(): boolean {
        return this._config.ShowErrorIcon;
    }

    public set ShowErrorIcon(value: boolean) {
        this._config.ShowErrorIcon = value;
    }

    public $get(
        pipRest: pip.rest.IRestService,
        pipFormat: pip.services.IFormat
    ) {
        "ngInject";

        if (this._service == null) {
            this._service = new PictureData(this._config, pipFormat, pipRest);
        }

        return this._service;
    }

}


angular
    .module('pipPictureData', ['pipRest'])
    .provider('pipPictureData', PictureDataProvider);
