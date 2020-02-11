import { BlobInfo } from './BlobInfo';

export class AvatarConfig {
    // custom avatar route
    public AvatarRoute: string;
    // custom avatar resource name
    public AvatarResource: string;
    public AvatarFieldId: string;
    // show only first letter for name as avatar 
    public ShowOnlyNameIcon: boolean;
    // default first name  letter
    public DefaultInitial: string;
}

export const colorClasses = [
    'pip-avatar-color-0', 'pip-avatar-color-1', 'pip-avatar-color-2', 'pip-avatar-color-3',
    'pip-avatar-color-4', 'pip-avatar-color-5', 'pip-avatar-color-6', 'pip-avatar-color-7',
    'pip-avatar-color-8', 'pip-avatar-color-9', 'pip-avatar-color-10', 'pip-avatar-color-11',
    'pip-avatar-color-12', 'pip-avatar-color-13', 'pip-avatar-color-14', 'pip-avatar-color-15'
];

export const colors = [
    'rgba(239,83,80,1)', 'rgba(236,64,122,1)', 'rgba(171,71,188,1)',
    'rgba(126,87,194,1)', 'rgba(92,107,192,1)', 'rgba(3,169,244,1)',
    'rgba(0,188,212,1)', 'rgba(0,150,136,1)', 'rgba(76,175,80,1)',
    'rgba(139,195,74,1)', 'rgba(205,220,57,1)', 'rgba(255,193,7,1)',
    'rgba(255,152,0,1)', 'rgba(255,87,34,1)', 'rgba(121,85,72,1)',
    'rgba(96,125,139,1)'
];

export interface IAvatarDataService {
    AvatarRoute: string;
    ShowOnlyNameIcon: boolean;
    DefaultInitial: string;

    getAvatarUrl(id: any): string;
    postAvatarUrl(): string;

    deleteAvatar(id: string, successCallback?: () => void, errorCallback?: (error: any) => void): void;
    createAvatar(data: any, successCallback?: (data: BlobInfo) => void,
        errorCallback?: (error: any) => void, progressCallback?: (progress: number) => void): void;
}

export interface IAvatarDataProvider extends ng.IServiceProvider {
    AvatarRoute: string;
    AvatarResource: string;
    DefaultInitial: string;
    ShowOnlyNameIcon: boolean;
    AvatarFieldId: string;    
}
