const path = require('path');
const utils = require('./utils');
const webpack = require('webpack');
const config = require('../config');
const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.conf');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');

const PUBLIC_PATH = 'http://localhost:3000/';

const env = config.build.env;

const webpackConfig = merge(baseWebpackConfig, {
  entry: {
    app: './src/entry.prod.js', // 入口文件
  },
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true,
    }),
  },
  devtool: config.build.productionSourceMap ? '#source-map' : false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].[chunkhash].js'),
    chunkFilename: utils.assetsPath('js/[id].[chunkhash].js'),
  },
  resolve: {
    alias: {
      'create-api': path.resolve(__dirname, '../src/config/create.api.client.js'),
    },
  },
  // 不打包以下模块
  externals: {
    // vue: 'Vue',
    // vuex: 'Vuex',
    // 'vue-router': 'VueRouter',
    // axios: 'axios',
    // 'mint-ui': 'Mint',
    // jquery: 'jQuery',
    // swiper: 'Swiper',
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': env,
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
      sourceMap: true,
    }),
    // extract css into its own file
    new ExtractTextPlugin({
      filename: utils.assetsPath('css/[name].[contenthash].css'),
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        safe: true,
      },
    }),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: config.build.index,
      template: 'index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency',
    }),
    new ServiceWorkerWebpackPlugin({
      entry: path.join(__dirname, '../src/sw.js'),
      excludes: [
        '**/.*',
        '**/icons/**/*.png',
        '**/*.map',
        '**/*.json',
        '*.html',
      ],
    }),
    // new SWPrecacheWebpackPlugin({
    //   cacheId: 'my-project-name',
    //   filename: 'service-worker.js',
    //   // dontCacheBustUrlsMatching: /\.\w{8}\./,
    //   dontCacheBustUrlsMatching: /./,
    //   // minify: true,
    //   navigateFallback: `${PUBLIC_PATH}index.html`,
    //   mergeStaticsConfig: true,
    //   staticFileGlobsIgnorePatterns: [/\.map$/],
    //   // runtimeCaching: [{
    //   //   urlPattern: '/',
    //   //   handler: 'networkFirst',
    //   // }],
    // }),
    // split vendor js into its own file
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks(module, count) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(path.join(__dirname, '../node_modules')) === 0
        );
      },
    }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      // minChunks: Infinity,
      chunks: ['vendor'],
    }),
    // copy custom static assets
    new CopyWebpackPlugin([{
      from: path.resolve(__dirname, '../static'),
      to: config.build.assetsSubDirectory,
      ignore: ['.*'],
    }]),
    new webpack.optimize.MinChunkSizePlugin({
      minChunkSize: 10, // Minimum number of characters
    }),
    new FaviconsWebpackPlugin({
      logo: `${path.resolve(__dirname, '../favicon.png')}`,
      prefix: 'icons/[hash]/',
      emitStats: false,
      persistentCache: true,
      inject: true,
      title: 'vue',
      icons: {
        android: true,
        appleIcon: true,
        appleStartup: true,
        coast: false,
        favicons: true,
        firefox: false,
        opengraph: false,
        twitter: false,
        yandex: false,
        windows: false,
      },
    }),
  ],
});

if (config.build.productionGzip) {
  const CompressionWebpackPlugin = require('compression-webpack-plugin');

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(`\\.(${config.build.productionGzipExtensions.join('|')})$`),
      threshold: 10240,
      minRatio: 0.8,
    }));
}

if (config.build.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
  webpackConfig.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = webpackConfig;