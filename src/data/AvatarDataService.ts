import { IAvatarDataService, IAvatarDataProvider, AvatarConfig } from './IAvatarDataService';
import { BlobInfo } from './BlobInfo';

class AvatarData implements IAvatarDataService {

    constructor(
        private _config: AvatarConfig,
        private pipRest: pip.rest.IRestService
    ) {
         "ngInject";
     }

    public get AvatarRoute(): string {
        return this._config.AvatarRoute;
    }

    public get ShowOnlyNameIcon(): boolean {
        return this._config.ShowOnlyNameIcon;
    }

    public get DefaultInitial(): string {
        return this._config.DefaultInitial;
    }

    public getAvatarUrl(id: any): string {
        return this.pipRest.serverUrl + this._config.AvatarRoute + '/' + id;
    }

    public postAvatarUrl(): string {
        return this.pipRest.serverUrl + this._config.AvatarRoute;
    }

    public deleteAvatar(id: string, successCallback?: () => void, errorCallback?: (error: any) => void): void {
        let params = {};
        params[this._config.AvatarFieldId] = id;
        this.pipRest.getResource(this._config.AvatarResource).remove(
            params,
            null,
            successCallback,
            errorCallback
        );
    }

    public createAvatar(data: any, successCallback?: (data: BlobInfo) => void,
        errorCallback?: (error: any) => void, progressCallback?: (progress: number) => void): void {

    }

}

class AvatarDataProvider implements IAvatarDataProvider {
    private _service: IAvatarDataService;
    private _config: AvatarConfig;

    constructor(
        private pipRestProvider: pip.rest.IRestProvider
    ) {
        this._config = new AvatarConfig();
        
        this._config.AvatarRoute = '/api/1.0/avatars';
        this._config.AvatarResource = 'avatars';
        this._config.AvatarFieldId = 'avatar_id';
        this._config.ShowOnlyNameIcon = false;
        this._config.DefaultInitial = '&';
    }

    public get AvatarRoute(): string {
        return this._config.AvatarRoute;
    }

    public set AvatarRoute(value: string) {
        this._config.AvatarRoute = value;
        this.pipRestProvider.registerOperation('avatars', this._config.AvatarRoute + '/:avatar_id');
    }

    public get AvatarResource(): string {
        return this._config.AvatarResource;
    }

    public set AvatarResource(value: string) {
        this._config.AvatarResource = value;
    }

    public get AvatarFieldId(): string {
        return this._config.AvatarFieldId;
    }

    public set AvatarFieldId(value: string) {
        this._config.AvatarFieldId = value;
    }

    public get ShowOnlyNameIcon(): boolean {
        return this._config.ShowOnlyNameIcon;
    }

    public set ShowOnlyNameIcon(value: boolean) {
        this._config.ShowOnlyNameIcon = value;
    }

    public get DefaultInitial(): string {
        return this._config.DefaultInitial;
    }

    public set DefaultInitial(value: string) {
        this._config.DefaultInitial = value;
    }

    public $get(
        pipRest: pip.rest.IRestService
    ) {
        "ngInject";

        if (this._service == null) {
            this._service = new AvatarData(this._config, pipRest);
        }

        return this._service;
    }

}


angular
    .module('pipAvatarData', ['pipRest'])
    .provider('pipAvatarData', AvatarDataProvider);


