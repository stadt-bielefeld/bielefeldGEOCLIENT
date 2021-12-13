const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports  = {
    devtool: 'eval-source-map',
    entry: {
        app: './munimap/static/js/app.js',
        transport: './munimap_transport/munimap_transport/static/js/app.js',
        digitize: './munimap_digitize/munimap_digitize/static/js/app.js',
        digitize_admin: './munimap_digitize/munimap_digitize/static/js/static-digitize-app.js',
        admin: './munimap/static/js/admin/admin.js',
        static_app:  './munimap/static/js/static-app.js',
        vendor: ['angular', 'jquery', 'angular-ui-bootstrap', 'core-js']
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, './munimap/static/dist'),
        chunkFilename: '[name].bundle.js',
        publicPath: '/',
    },
    resolve: {
      alias: {
        'ol': path.resolve('./node_modules/ol'),
        'ol-ext': path.resolve('./node_modules/ol-ext'),
        'bootstrap': path.resolve('./node_modules/bootstrap'),
        'angular-ui-bootstrap': path.resolve('./node_modules/angular-ui-bootstrap'),
        'jquery': path.resolve('./node_modules/jquery')
      }
    },
    module: {
        rules: [
            {
                test: /ace-builds.*worker-.*\.js$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: 'ace-builds/[name].js'
                    }
                }
            },
            {
                test: /\.html$/,
                use: ['html-loader']
            },
            {
                test: /\.js$/,
                exclude: /ace-builds.*worker-.*\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/env']
                    }
                }
            }
        ]
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    chunks: 'initial',
                    name: 'vendor',
                    test: 'vendor',
                    enforce: true
                },
            }
        },
        runtimeChunk: true,
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                uglifyOptions: {
                    compress: true,
                    ecma: 5,
                    mangle: false
                },
                sourceMap: true
            })
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery'
        })
    ]
};
