'use strict';

// const url_proxy = "http://localhost:9000";

const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const AssetsPlugin = require('assets-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const fs = require('fs');

const swiss = require('kouto-swiss')
const rupture = require('rupture')


// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());

function resolveApp(relativePath) {
  return path.resolve(appDirectory, relativePath);
}

const paths = {
  appSrc: resolveApp('src'),
  appBuild: resolveApp('dist'),
  appIndexJs: resolveApp('src/index.js'),
  appNodeModules: resolveApp('node_modules'),
};

const DEV = process.env.NODE_ENV === 'development';

module.exports = {
  bail: !DEV,
  mode: DEV ? 'development' : 'production',
  // We generate sourcemaps in production. This is slow but gives good results.
  // You can exclude the *.map files from the build during deployment.
  target: 'web',
  entry: [paths.appIndexJs],
  output: {
    path: paths.appBuild,
    filename: DEV ? 'bundle.js' : 'bundle.[hash:8].js'
    // filename: 'bundle.js'
  },
  module: {
    rules: [
      // Disable require.ensure as it's not a standard language feature.
      { parser: { requireEnsure: false } },
      // Transform ES6 with Babel
      {
        test: /.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
        use: "url-loader?limit=10000"
      },
      {
        test: /\.pug$/,
        use: ['pug-loader']
      },
      {
        test: /\.styl$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
          },
          {
            loader: "postcss-loader",
            options: {
              ident: "postcss", // https://webpack.js.org/guides/migrating/#complex-options
              plugins: () => [ autoprefixer() ]
            }
          },
          {
            loader: 'stylus-loader',
            options: {
              use: [swiss(), rupture()],
              'include css': true,
              preferPathResolver: 'webpack',
            },
          }
          ],
        },
        {
          test: /\.css/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
            },
            ],
          }
    ],
  },
  optimization: {
    minimize: !DEV,
    minimizer: [
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: {
          map: {
            inline: false,
            annotation: true,
          }
        }
      }),
      new TerserPlugin({
        terserOptions: {
          compress: {
            warnings: false
          },
          output: {
            comments: false
          }
        },
        sourceMap: true
      })
    ]
  },
  plugins: [
    !DEV && new CleanWebpackPlugin(['dist'], {
      root: path.join(__dirname, '..')
    }),
    new HtmlWebpackPlugin({
      template: './src/index.pug'
    }),
    new MiniCssExtractPlugin({
      filename: DEV ? 'bundle.css' : 'bundle.[hash:8].css'
      // filename: 'bundle.css'
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development', // use 'development' unless process.env.NODE_ENV is defined
      DEBUG: false,
    }),
    new AssetsPlugin({
      path: paths.appBuild,
      filename: 'assets.json',
    }),
    new CopyWebpackPlugin([
      {from:'src/images',to:'images'},
    ]),
    DEV &&
      new FriendlyErrorsPlugin({
        clearConsole: false,
      }),
    DEV &&
      new BrowserSyncPlugin({
          notify: true,
          host: 'localhost',
          port: 4000,
          logLevel: 'silent',
          server: { baseDir: ['dist'] },
          minify: false,
          // proxy: url_proxy,
          // logFileChanges: true,
          // logLevel: 'debug',
          files: [{
            match: ['**/*.css', 'src/**/*.js', 'src/**/*.pug'],
            fn: (event, file) => {
              if (event == 'change') {
                const bs = require("browser-sync").get("bs-webpack-plugin");
                if (file.split('.').pop() == 'js' || file.split('.').pop() == 'pug') {
                  bs.reload();
                } else {
                  bs.reload("*.css");
                }
              }
            }
          }]
        }, {
          // disable reload from the webpack plugin - not browserSync itself
          reload: false,
          name: 'bs-webpack-plugin',
          injectCss: true,
        }
      ),
  ].filter(Boolean),
};
