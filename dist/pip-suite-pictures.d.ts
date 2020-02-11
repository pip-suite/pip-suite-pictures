declare module pip.pictures {


export class AddImageOption {
    Upload: boolean;
    WebLink: boolean;
    Camera: boolean;
    Galery: boolean;
}

export class AddImageResult {
    picture?: Attachment;
    file?: any;
    uriData?: any;
    url?: string;
}


export const ReloadAvatar = "pipReloadAvatar";
export class AvatarEditControl {
    reset: (afterDeleting?: boolean) => void;
    save: (id?: string, successCallback?: (response?: any) => void, errorCallback?: (error?: any) => void) => void;
    abort: () => void;
    error?: any;
    disabled: boolean;
    url: string;
    uriData: any;
    progress: number;
    uploaded: boolean;
    uploading: boolean;
    upload: boolean;
    loaded: boolean;
    file: any;
    state: string;
}
export class AvatarStates {
    static Original: string;
    static Changed: string;
    static Deleted: string;
    static Error: string;
}

const ConfigCameraDialogTranslations: (pipTranslateProvider: pip.services.ITranslateProvider) => void;
var Webcam: any;
var Camera: any;


export interface ICameraDialogService {
    show(successCallback?: (result) => void, cancelCallback?: () => void): any;
}



export class Attachment {
    constructor(id?: string, uri?: string, name?: string);
    id?: string;
    uri?: string;
    name?: string;
}


export class BlobInfo {
    constructor(id: string, group: string, name: string, size?: number, content_type?: string, create_time?: Date, expire_time?: Date, completed?: boolean);
    id: string;
    group: string;
    name: string;
    size: number;
    content_type: string;
    create_time: Date;
    expire_time: Date;
    completed: boolean;
}

export class DataPage<T> {
    constructor(data?: T[], total?: number);
    total: number;
    data: T[];
}

export class AvatarConfig {
    AvatarRoute: string;
    AvatarResource: string;
    AvatarFieldId: string;
    ShowOnlyNameIcon: boolean;
    DefaultInitial: string;
}
export const colorClasses: string[];
export const colors: string[];
export interface IAvatarDataService {
    AvatarRoute: string;
    ShowOnlyNameIcon: boolean;
    DefaultInitial: string;
    getAvatarUrl(id: any): string;
    postAvatarUrl(): string;
    deleteAvatar(id: string, successCallback?: () => void, errorCallback?: (error: any) => void): void;
    createAvatar(data: any, successCallback?: (data: BlobInfo) => void, errorCallback?: (error: any) => void, progressCallback?: (progress: number) => void): void;
}
export interface IAvatarDataProvider extends ng.IServiceProvider {
    AvatarRoute: string;
    AvatarResource: string;
    DefaultInitial: string;
    ShowOnlyNameIcon: boolean;
    AvatarFieldId: string;
}

export interface IImageSetDataService {
    readImageSets(params: any, successCallback?: (data: DataPage<ImageSet>) => void, errorCallback?: (error: any) => void): ng.IPromise<any>;
    readImageSet(id: string, successCallback?: (data: ImageSet) => void, errorCallback?: (error: any) => void): ng.IPromise<any>;
    updateImageSet(id: string, data: ImageSet, successCallback?: (data: ImageSet) => void, errorCallback?: (error: any) => void): void;
    createImageSet(data: ImageSet, successCallback?: (data: any) => void, errorCallback?: (error: any) => void): void;
    deleteImageSet(id: string, successCallback?: () => void, errorCallback?: (error: any) => void): void;
}

export class Image {
    title: string;
    link: string;
    thumbnail: string;
}

export class ImageSet {
    constructor(id: string, title: string, picIds?: string[], create_time?: Date);
    id: string;
    create_time: Date;
    title: string;
    pics?: Attachment[];
    tags?: string[];
    all_tags?: string[];
}



export class PictureConfig {
    PictureRoute: string;
    DefaultErrorIcon: string;
    ShowErrorIcon: boolean;
}
export interface IPictureDataService {
    PictureRoute: string;
    DefaultErrorIcon: string;
    ShowErrorIcon: boolean;
    getPictureUrl(id: string): string;
    postPictureUrl(): string;
    readPictures(params: any, successCallback?: (data: DataPage<BlobInfo>) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
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




export class GallerySearchDialogParams {
    multiple: boolean;
}
export interface IGallerySearchDialogService {
    show(params: GallerySearchDialogParams, successCallback?: (result: Attachment[][]) => void, cancelCallback?: () => void): any;
}



export class PictureEditControl {
    reset: (afterDeleting?: boolean) => void;
    save: (successCallback?: (response?: Attachment) => void, errorCallback?: (error?: any) => void) => void;
    abort: () => void;
    error?: any;
    disabled: boolean;
    url: string;
    uriData: any;
    uri: string;
    id: string;
    name: string;
    progress: number;
    uploaded: boolean;
    uploading: boolean;
    upload: boolean;
    loaded: boolean;
    file: any;
    state: string;
}
export class PictureStates {
    static Original: string;
    static Copied: string;
    static Changed: string;
    static Deleted: string;
    static Error: string;
}

export class PictureListEditItem {
    pin: number;
    id: string;
    uri: string;
    name: string;
    url: string;
    uriData: any;
    uploading: boolean;
    uploaded: boolean;
    progress: number;
    file: any;
    upload?: any;
    state: string;
    loaded?: boolean;
}
export class PictureListEditControl {
    uploading: number;
    items: PictureListEditItem[];
    reset: () => void;
    save: (successCallback?: (data?: Attachment[]) => void, errorCallback?: (error?: PictureUploadErrors[]) => void) => void;
    abort: () => void;
    error?: any;
}
export class PictureListEditStates {
    static Added: string;
    static Original: string;
    static Copied: string;
    static Changed: string;
    static Deleted: string;
    static Error: string;
}
export class PictureUploadErrors {
    id: string;
    uri: string;
    name: string;
}


export interface IPictureUrlDialogService {
    show(successCallback?: (result: string) => void, cancelCallback?: () => void): any;
}

const ConfigPictureUrlDialogTranslations: (pipTranslateProvider: pip.services.ITranslateProvider) => void;
class PictureUrlDialogController {
    private $log;
    private $scope;
    private $mdDialog;
    private $rootScope;
    private $timeout;
    private $mdMenu;
    private pipPictureUtils;
    url: string;
    invalid: boolean;
    theme: string;
    constructor($log: ng.ILogService, $scope: ng.IScope, $mdDialog: angular.material.IDialogService, $rootScope: ng.IRootScopeService, $timeout: ng.ITimeoutService, $mdMenu: any, pipPictureUtils: any);
    setImageSize(img: any): void;
    checkUrl(): void;
    onCancelClick(): void;
    onAddClick(): void;
}


function configAvatarResources(pipRestProvider: pip.rest.IRestProvider): void;

function configImageSetResources(pipRestProvider: pip.rest.IRestProvider): void;


function configPictureResources(pipRestProvider: pip.rest.IRestProvider): void;


export class imageCssParams {
    'width'?: string;
    'margin-left'?: string;
    'height'?: string;
    'margin-top'?: string;
}
export interface IPictureUtilsService {
    getCollageSchemes(): any;
    setErrorImageCSS(image: any, params?: imageCssParams): void;
    setImageMarginCSS($element: any, image: any, params?: imageCssParams): void;
    setIconMarginCSS(container: any, icon: any): void;
}
export interface IPictureUtilsProvider extends ng.IServiceProvider {
}

export class PicturePaste {
    private $timeout;
    private pasteCatcher;
    constructor($timeout: ng.ITimeoutService);
    addPasteListener(onPaste: any): void;
    removePasteListener(): void;
}


}
