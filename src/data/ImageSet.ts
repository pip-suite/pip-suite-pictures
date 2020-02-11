import { Attachment } from './Attachment';

export class ImageSet {

    public constructor(id: string, title: string, picIds?: string[], create_time?: Date) {
        this.id = id;
        this.title = title;
        this.pics = [];
        this.create_time = create_time;
    }

    /* Identification */
    public id: string;

    /* Automatically set fields */
    public create_time: Date;

    /* Content */
    public title: string;
    public pics?: Attachment[];

    /* Search */
    public tags?: string[];
    public all_tags?: string[];
}