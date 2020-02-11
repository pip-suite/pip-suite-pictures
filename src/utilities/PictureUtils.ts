import { IPictureUtilsService, IPictureUtilsProvider, imageCssParams } from './IPictureUtils';

let collageSchemes = [
    // 1
    [
        { flex: 100, fullWidth: true, fullHeight: true }
    ],
    // 2
    [
        {
            group: true,
            layout: 'row',
            flex: 100,
            fullHeight: true,
            children: [
                { flex: 50, fullHeight: true, rightPadding: true },
                { flex: 50, fullHeight: true, leftPadding: true }
            ]
        }
    ],
    // 3
    [
        {
            group: true,
            layout: 'row',
            flex: 100,
            fullHeight: true,
            children: [
                { flex: 33, fullHeight: true, rightPadding: true },
                { flex: 33, fullHeight: true, leftPadding: true, rightPadding: true },
                { flex: 33, fullHeight: true, leftPadding: true }
            ]
        },
        {
            group: true,
            layout: 'row',
            flex: 100,
            fullHeight: true,
            children: [
                { flex: 50, fullHeight: true, rightPadding: true },
                {
                    group: true,
                    layout: 'column',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 50, leftPadding: true, bottomPadding: true },
                        { flex: 50, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'row',
            flex: 100,
            fullHeight: true,
            children: [
                { flex: 70, fullHeight: true, rightPadding: true },
                {
                    group: true,
                    layout: 'column',
                    flex: 30,
                    fullHeight: true,
                    children: [
                        { flex: 50, leftPadding: true, bottomPadding: true },
                        { flex: 50, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'column',
            flex: 100,
            fullHeight: true,
            children: [
                { flex: 50, fullWidth: true, bottomPadding: true },
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 50, rightPadding: true, topPadding: true },
                        { flex: 50, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        }
    ],
    // 4
    [
        {
            group: true,
            layout: 'column',
            flex: 100,
            fullHeight: true,
            children: [
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 50, fullWidth: true, rightPadding: true, bottomPadding: true },
                        { flex: 50, fullWidth: true, leftPadding: true, bottomPadding: true }
                    ]
                },
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 50, fullWidth: true, rightPadding: true, topPadding: true },
                        { flex: 50, fullWidth: true, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'row',
            flex: 100,
            fullHeight: true,
            children: [
                { flex: 50, fullWidth: true, rightPadding: true },
                {
                    group: true,
                    layout: 'column',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 50, fullWidth: true, leftPadding: true, bottomPadding: true },
                        {
                            group: true,
                            layout: 'row',
                            flex: 50,
                            fullHeight: true,
                            children: [
                                { flex: 50, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                                { flex: 50, fullWidth: true, leftPadding: true, topPadding: true }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'row',
            flex: 100,
            fullHeight: true,
            children: [
                { flex: 30, fullWidth: true, rightPadding: true },
                {
                    group: true,
                    layout: 'column',
                    flex: 70,
                    fullHeight: true,
                    children: [
                        { flex: 50, fullWidth: true, leftPadding: true, bottomPadding: true },
                        {
                            group: true,
                            layout: 'row',
                            flex: 50,
                            fullHeight: true,
                            children: [
                                { flex: 50, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                                { flex: 50, fullWidth: true, leftPadding: true, topPadding: true }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'column',
            flex: 100,
            fullHeight: true,
            children: [
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 100, fullWidth: true, bottomPadding: true }
                    ]
                },
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 33, fullWidth: true, rightPadding: true, topPadding: true },
                        { flex: 33, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 33, fullWidth: true, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        }
    ],
    // 5
    [
        {
            group: true,
            layout: 'column',
            flex: 100,
            fullHeight: true,
            children: [
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 50, fullWidth: true, rightPadding: true, bottomPadding: true },
                        { flex: 50, fullWidth: true, leftPadding: true, bottomPadding: true }
                    ]
                },
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 33, fullWidth: true, rightPadding: true, topPadding: true },
                        { flex: 33, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 33, fullWidth: true, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'row',
            flex: 100,
            fullHeight: true,
            children: [
                { flex: 50, fullWidth: true, rightPadding: true },
                {
                    group: true,
                    layout: 'column',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        {
                            group: true,
                            layout: 'row',
                            flex: 50,
                            fullHeight: true,
                            children: [
                                { flex: 50, fullWidth: true, leftPadding: true, rightPadding: true, bottomPadding: true },
                                { flex: 50, fullWidth: true, leftPadding: true, bottomPadding: true }
                            ]
                        },
                        {
                            group: true,
                            layout: 'row',
                            flex: 50,
                            fullHeight: true,
                            children: [
                                { flex: 50, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                                { flex: 50, fullWidth: true, leftPadding: true, topPadding: true }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'row',
            flex: 100,
            fullHeight: true,
            children: [
                { flex: 33, fullWidth: true, rightPadding: true },
                {
                    group: true,
                    layout: 'column',
                    flex: 67,
                    fullHeight: true,
                    children: [
                        {
                            group: true,
                            layout: 'row',
                            flex: 50,
                            fullHeight: true,
                            children: [
                                { flex: 50, fullWidth: true, leftPadding: true, rightPadding: true, bottomPadding: true },
                                { flex: 50, fullWidth: true, leftPadding: true, bottomPadding: true }
                            ]
                        },
                        {
                            group: true,
                            layout: 'row',
                            flex: 50,
                            fullHeight: true,
                            children: [
                                { flex: 50, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                                { flex: 50, fullWidth: true, leftPadding: true, topPadding: true }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'column',
            flex: 100,
            fullHeight: true,
            children: [
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 100, fullWidth: true, bottomPadding: true }
                    ]
                },
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 25, fullWidth: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        }
    ],
    // 6
    [
        {
            group: true,
            layout: 'column',
            flex: 100,
            fullHeight: true,
            children: [
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 33, fullWidth: true, rightPadding: true, bottomPadding: true },
                        { flex: 33, fullWidth: true, leftPadding: true, rightPadding: true, bottomPadding: true },
                        { flex: 33, fullWidth: true, leftPadding: true, bottomPadding: true }
                    ]
                },
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 33, fullWidth: true, rightPadding: true, topPadding: true },
                        { flex: 33, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 33, fullWidth: true, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'column',
            flex: 100,
            fullHeight: true,
            children: [
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 50, fullWidth: true, rightPadding: true, bottomPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, bottomPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, bottomPadding: true }
                    ]
                },
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 50, fullWidth: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'row',
            flex: 100,
            fullHeight: true,
            children: [
                { flex: 33, fullWidth: true, rightPadding: true },
                {
                    group: true,
                    layout: 'column',
                    flex: 67,
                    fullHeight: true,
                    children: [
                        {
                            group: true,
                            layout: 'row',
                            flex: 50,
                            fullHeight: true,
                            children: [
                                { flex: 50, fullWidth: true, leftPadding: true, rightPadding: true, bottomPadding: true },
                                { flex: 50, fullWidth: true, leftPadding: true, bottomPadding: true }
                            ]
                        },
                        {
                            group: true,
                            layout: 'row',
                            flex: 50,
                            fullHeight: true,
                            children: [
                                { flex: 33, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                                { flex: 33, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                                { flex: 33, fullWidth: true, leftPadding: true, topPadding: true }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'column',
            flex: 100,
            fullHeight: true,
            children: [
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 50, fullWidth: true, rightPadding: true, bottomPadding: true },
                        { flex: 50, fullWidth: true, leftPadding: true, bottomPadding: true }
                    ]
                },
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 25, fullWidth: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        }
    ],
    // 7
    [
        {
            group: true,
            layout: 'column',
            flex: 100,
            fullHeight: true,
            children: [
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 33, fullWidth: true, rightPadding: true, bottomPadding: true },
                        { flex: 33, fullWidth: true, leftPadding: true, rightPadding: true, bottomPadding: true },
                        { flex: 33, fullWidth: true, leftPadding: true, bottomPadding: true }
                    ]
                },
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 25, fullWidth: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'column',
            flex: 100,
            fullHeight: true,
            children: [
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 50, fullWidth: true, rightPadding: true, bottomPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, bottomPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, bottomPadding: true }
                    ]
                },
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 25, fullWidth: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'row',
            flex: 100,
            fullHeight: true,
            children: [
                { flex: 25, fullWidth: true, rightPadding: true },
                {
                    group: true,
                    layout: 'column',
                    flex: 75,
                    fullHeight: true,
                    children: [
                        {
                            group: true,
                            layout: 'row',
                            flex: 50,
                            fullHeight: true,
                            children: [
                                { flex: 33, fullWidth: true, leftPadding: true, rightPadding: true, bottomPadding: true },
                                { flex: 33, fullWidth: true, leftPadding: true, rightPadding: true, bottomPadding: true },
                                { flex: 33, fullWidth: true, leftPadding: true, bottomPadding: true }
                            ]
                        },
                        {
                            group: true,
                            layout: 'row',
                            flex: 50,
                            fullHeight: true,
                            children: [
                                { flex: 33, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                                { flex: 33, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                                { flex: 33, fullWidth: true, leftPadding: true, topPadding: true }
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    // 8
    [
        {
            group: true,
            layout: 'column',
            flex: 100,
            fullHeight: true,
            fullWidth: true,
            children: [
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullWidth: true,
                    children: [
                        { flex: 25, fullWidth: true, rightPadding: true, bottomPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, bottomPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, bottomPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, bottomPadding: true }
                    ]
                },
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullWidth: true,
                    children: [
                        { flex: 25, fullWidth: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        }
    ]
];

class PictureUtils implements IPictureUtilsService {

    constructor() {
        "ngInject";
    }

    public getCollageSchemes(): any {
        return collageSchemes;
    }

    public setErrorImageCSS(image: any, params?: imageCssParams): void {
        let cssParams: imageCssParams = {
            'width': '',
            'margin-left': '',
            'height': '',
            'margin-top': ''
        };

        if (params) {
            cssParams = _.assign(cssParams, params);
        }
        if (image) {
            image.css(cssParams);
        }
    }

    public setImageMarginCSS($element: any, image: any, params?: imageCssParams): void {
        let containerWidth: number = $element.width ? $element.width() : $element.clientWidth;
        let containerHeight: number = $element.height ? $element.height() : $element.clientHeight;
        let imageWidth: number = image[0].naturalWidth || image.width;
        let imageHeight: number = image[0].naturalHeight || image.height;
        let margin: number = 0;
        let cssParams: imageCssParams = {};

        if ((imageWidth / containerWidth) > (imageHeight / containerHeight)) {
            margin = -((imageWidth / imageHeight * containerHeight - containerWidth) / 2);
            cssParams['margin-left'] = '' + margin + 'px';
            cssParams['height'] = '' + containerHeight + 'px';
            cssParams['width'] = '' + imageWidth * containerHeight / imageHeight + 'px';
            cssParams['margin-top'] = '';
        } else {
            margin = -((imageHeight / imageWidth * containerWidth - containerHeight) / 2);
            cssParams['margin-top'] = '' + margin + 'px';
            cssParams['height'] = '' + imageHeight * containerWidth / imageWidth + 'px';
            cssParams['width'] = '' + containerWidth + 'px';
            cssParams['margin-left'] = '';
        }

        if (params) {
            cssParams = _.assign(cssParams, params);
        }

        image.css(cssParams);
    }

    public setIconMarginCSS(container: any, icon: any): void {
        let containerWidth: number = container.clientWidth ? container.clientWidth : container.width;
        let containerHeight: number = container.clientHeight ? container.clientHeight : container.height;
        let margin: number = 0;
        let iconSize: number = containerWidth > containerHeight ? containerHeight : containerWidth;

        var cssParams: imageCssParams = {
            'width': '' + iconSize + 'px',
            'margin-left': '',
            'height': '' + iconSize + 'px',
            'margin-top': ''
        };

        if ((containerWidth) > (containerHeight)) {
            margin = ((containerWidth - containerHeight) / 2);
            cssParams['margin-left'] = '' + margin + 'px';
        } else {
            margin = ((containerHeight - containerWidth) / 2);
            cssParams['margin-top'] = '' + margin + 'px';
        }

        icon.css(cssParams);
    }

}

class PictureUtilsProvider implements IPictureUtilsProvider {
    private _service: IPictureUtilsService;

    constructor() { }

    public $get() {
        "ngInject";

        if (this._service == null) {
            this._service = new PictureUtils();
        }

        return this._service;
    }
}

angular
    .module('pipPictureUtils', [])
    .provider('pipPictureUtils', PictureUtilsProvider);

