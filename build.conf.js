module.exports = {
    module: {
        name: 'pipPictures',
        styles: 'index',
        export: 'pip.pictures',
        standalone: 'pip.pictures'
    },
    build: {
        js: false,
        ts: false,
        tsd: true,
        bundle: true,
        html: true,
        sass: true,
        lib: true,
        images: true,
        dist: false
    },
    browserify: {
        entries: [
            './temp/pip-suite-pictures-html.min.js',
            './src/index.ts'
        ]
    },
    file: {
        lib: [
            '../node_modules/pip-webui-all/dist/**/*',
            '../pip-suite-rest/dist/**/*',
            '../pip-suite-entry/dist/**/*'
        ]
    },
    samples: {
        port: 8100,
        https: false
    },
    api: {
        port: 8101
    }
};
