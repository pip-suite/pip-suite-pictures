import { IImageSetDataService } from './IImageSetDataService';
import { ImageSet } from './ImageSet';
import { DataPage } from './DataPage';

class ImageSetData implements IImageSetDataService {
    private RESOURCE: string = 'imagesets';

    constructor(
        private pipRest: pip.rest.IRestService,
        private pipFormat: pip.services.IFormat

    ) {
        "ngInject";
    }

    public readImageSets(params: any, successCallback?: (data: DataPage<ImageSet>) => void,
        errorCallback?: (error: any) => void): ng.IPromise<any> {

        params = params || {};
        // if (params.filter) {
        //     params.filer = this.pipFormat.filterToString(params.filer);
        // }

        return this.pipRest.getResource(this.RESOURCE).page(params, successCallback, errorCallback);
    }

    public readImageSet(id: string, successCallback?: (data: ImageSet) => void,
        errorCallback?: (error: any) => void): ng.IPromise<any> {

        return this.pipRest.getResource(this.RESOURCE).get(
            { imagesets_id: id },
            successCallback,
            errorCallback
        );
    }

    public updateImageSet(id: string, data: ImageSet, successCallback?: (data: ImageSet) => void,
        errorCallback?: (error: any) => void): void {

        this.pipRest.getResource(this.RESOURCE).update(
            { imagesets_id: id },
            data,
            successCallback,
            errorCallback
        );

    }

    public createImageSet(data: ImageSet, successCallback?: (data: any) => void,
        errorCallback?: (error: any) => void): void {

        this.pipRest.getResource(this.RESOURCE).save(
            null,
            data,
            successCallback,
            errorCallback
        );
    }


    public deleteImageSet(id: string, successCallback?: () => void,
        errorCallback?: (error: any) => void): void {

        this.pipRest.getResource(this.RESOURCE).remove(
            { imagesets_id: id },
            null,
            successCallback,
            errorCallback
        );
    }
}

angular
    .module('pipImageSetData', ['pipRest'])
    .service('pipImageSetData', ImageSetData);

