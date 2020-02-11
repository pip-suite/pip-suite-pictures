import './data';
import './rest';

import './camera_dialog';
import './add_image/AddImage';
import './add_image/AddImageOption';
import './add_image/AddImageResult';
import './avatar/Avatar';
import './avatar_edit/AvatarEdit';
import './collage/Collage';
import './gallery_search_dialog';
import './picture/Picture';
import './picture_edit/PictureEdit';
import './picture_list_edit/PictureListEdit';
import './picture_url_dialog';
import './utilities';

angular
    .module('pipPictures', [
        'pipControls',

        'pipPictures.Data',
        'pipPictures.Rest',
        'pipCameraDialog',
        'pipGallerySearchDialog',
        'pipPictureUrlDialog',
        'pipAddImage',
        'pipAvatar',
        'pipPictureUtils',
        'pipPicturePaste',
        'pipAvatarEdit',
        'pipPicture',
        'pipPictureEdit',
        'pipCollage',
        'pipPictureListEdit',

    ]);

export * from './avatar/Avatar';
export * from './data';
export * from './avatar_edit/AvatarEdit';
export * from './add_image/AddImageOption';
export * from './add_image/AddImageResult';
export * from './collage/Collage';
export * from './camera_dialog';
export * from './gallery_search_dialog';
export * from './picture_edit/PictureEdit';
export * from './picture_list_edit/PictureListEdit';
export * from './picture_url_dialog';
export * from './utilities';
