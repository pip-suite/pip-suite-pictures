export class imageCssParams {
    public 'width'?: string;
    public 'margin-left'?: string;
    public 'height'?: string;
    public 'margin-top'?: string;
}

export interface IPictureUtilsService {
    getCollageSchemes(): any;
    setErrorImageCSS(image: any, params?: imageCssParams): void;
    setImageMarginCSS($element: any, image: any, params?: imageCssParams): void;
    setIconMarginCSS(container: any, icon: any): void;
}

export interface IPictureUtilsProvider extends ng.IServiceProvider {

}

