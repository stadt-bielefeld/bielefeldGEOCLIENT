const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports  = {
    devtool: 'eval-source-map',
    entry: {
        app: {
            import: './munimap/frontend/js/app.js',
            dependOn: 'vendor',
        },
        transport: {
            import: './munimap/frontend/js/munimap_transport/app.js',
            dependOn: 'vendor'
        },
        admin: {
            import: './munimap/frontend/js/admin/admin.js',
            dependOn: 'vendor'
        },
        static_app: {
            import: './munimap/frontend/js/static-app.js',
            dependOn: 'vendor'
        },
        vendor: ['angular', 'jquery', 'angular-ui-bootstrap'],
        appStyle: {
            import: './munimap/frontend/sass/appStyle.sass'
        }
    },
    output: {
        filename: 'js/[name].bundle.js',
        path: path.resolve(__dirname, './munimap/static'),
        chunkFilename: 'js/[name].bundle.js',
        publicPath: '/',
    },
    resolve: {
      alias: {
        'ol': path.resolve('./node_modules/ol'),
        'ol-ext': path.resolve('./node_modules/ol-ext'),
        'bootstrap': path.resolve('./node_modules/bootstrap'),
        'angular-ui-bootstrap': path.resolve('./node_modules/angular-ui-bootstrap'),
        'jquery': path.resolve('./node_modules/jquery/src/jquery')
      }
    },
    module: {
        rules: [
            // Small workaround for ace-builds to work.
            // For some reason, the worker-javascript.js will be requested by ace under
            // js/ace-builds/worker-javascript.js
            // whereas the worker-yaml will be requested by ace under
            // js/worker-yaml.js.
            // So we handle the two files separately here and put them under different
            // locations respectively.
            {
                test: /ace-builds.*worker-yaml\.js$/,
                type: 'asset/resource',
                generator: {
                 filename: 'js/[name].js'
               }
            },
            {
                test: /ace-builds.*worker-javascript\.js$/,
                type: 'asset/resource',
                generator: {
                 filename: 'js/ace-builds/[name].js'
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
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    // Extract CSS into own files
                    MiniCssExtractPlugin.loader,
                    // Translates CSS into CommonJS
                    {
                        loader: "css-loader",
                        options: {
                            url: false
                        }
                    },
                    {
                        loader: 'resolve-url-loader'
                    },
                    // Compiles Sass to CSS
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true // important for resolve-url-loader
                        }
                    },
                ],
            }
        ]
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                defaultVendors: {
                    chunks: 'initial',
                    name: 'vendor',
                    test: 'vendor',
                    enforce: true
                }
            }
        }
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/[name].css'
        }),
        new webpack.ProvidePlugin({
          'window.jQuery': 'jquery',
          $: 'jquery',
          jQuery: 'jquery',
        }),
        new CopyPlugin({
            patterns: [
                { from: "./munimap/frontend/css", to: path.resolve(__dirname, './munimap/static/css') },
                { from: "./munimap/frontend/img", to: path.resolve(__dirname, './munimap/static/img') },
                { from: "./munimap/frontend/fonts", to: path.resolve(__dirname, './munimap/static/fonts') },
                { from: "./munimap/frontend/translations", to: path.resolve(__dirname, './munimap/static/translations') }
            ],
        })
    ]
};
