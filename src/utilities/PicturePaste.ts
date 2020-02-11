export class PicturePaste {
    private pasteCatcher;

    constructor(
        private $timeout: ng.ITimeoutService
    ) {
        "ngInject";
    }

    public addPasteListener(onPaste) {
        if (!window['Clipboard']) {
            if (this.pasteCatcher !== null && this.pasteCatcher !== undefined) {
                this.removePasteListener();
            }

            this.pasteCatcher = document.createElement("div");

            // Firefox allows images to be pasted into contenteditable elements
            this.pasteCatcher.setAttribute("contenteditable", "true");

            // We can hide the element and append it to the body,
            //this.pasteCatcher.style.opacity = 0;
            $(this.pasteCatcher).css({
                "position": "absolute",
                "left": "-999",
                width: "0",
                height: "0",
                "overflow": "hidden",
                outline: 0
            });

            document.body.appendChild(this.pasteCatcher);
        }

        $(document).on('paste', (event) => {
            let localEvent;
            if (event['clipboardData'] == null && event.originalEvent) {
                localEvent = event.originalEvent;
            } else {
                localEvent = event;
            }

            // Paste for chrome
            if (localEvent.clipboardData) {
                var items = localEvent.clipboardData.items;

                _.each(items, (item) => {
                    if (item.type.indexOf("image") != -1) {
                        var file = item.getAsFile();

                        var fileReader = new FileReader();
                        fileReader.onload = (e) => {
                            this.$timeout(() => {
                                onPaste({ url: e.target['result'], file: file });
                            });
                        };
                        fileReader.readAsDataURL(file);
                    }
                });
            }
            // Paste for IE
            else if (window['clipboardData'] && window['clipboardData'].files) {
                _.each(window['clipboardData'].files, (file) => {
                    var fileReader = new FileReader();
                    fileReader.onload = (e) => {
                        this.$timeout(() => {
                            onPaste({ url: e.target['result'], file: file });
                        });
                    };
                    fileReader.readAsDataURL(file);
                });
            }
        });


    }

    public removePasteListener() {
        if (!window['Clipboard']) {
            if (this.pasteCatcher !== null && this.pasteCatcher !== undefined) {
                document.body.removeChild(this.pasteCatcher);
                this.pasteCatcher = null;
            }
        }
        $(document).off('paste');
    }

}

angular
    .module('pipPicturePaste', []);
