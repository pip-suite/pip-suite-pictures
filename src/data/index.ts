import './Attachment';
import './BlobInfo';
import './DataPage';
import './ImageSet';
import './Image';

import './AvatarDataService';
import './IAvatarDataService';
import './ImageSetDataService';
import './IImageSetDataService';
import './PictureDataService';
import './IPictureDataService';

angular
    .module('pipPictures.Data', [
        'pipAvatarData', 
        'pipPictureData',
        'pipImageSetData'
    ]);

export * from './Attachment';
export * from './BlobInfo';
export * from './DataPage';
export * from './ImageSet';
export * from './Image';
export * from './IImageSetDataService';
export * from './IAvatarDataService';
export * from './IPictureDataService';
