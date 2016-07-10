var ExtractTextPlugin = require("extract-text-webpack-plugin");
var sass = new ExtractTextPlugin("[name].css");
var bower_dir = __dirname + "/bower_components";

module.exports = {
  entry: "./js/entry.js",
  output: {
    path: "../site/themes/spogliani/static/",
    filename: "[name].js"
  },
  resolve: {
    alias: {
      "bootstrap": bower_dir + "/bootstrap/dist/js/bootstrap.js",
      "jquery": bower_dir + "/jquery/src/jquery.js"
    }
  },

  module: {
    loaders: [{
      test: /\.scss$/,
      loader: sass.extract(["css", "sass"])
    },

    // Copy files from assets to output.
    {
      test: /\.jpg$/,
      loader: "file"
    }, {
      test: /\.png$/,
      loader: "file"
    }, {
      test: /\.gif$/,
      loader: "file"
    },

    // Configuration needed by Bootstrap themes.
    // the url-loader uses DataUrls.
    // the file-loader emits files.
    {
      test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'url?limit=10000&mimetype=application/font-woff'
    }, {
      test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'url?limit=10000&mimetype=application/octet-stream'
    }, {
      test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'file'
    }, {
      test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'url?limit=10000&mimetype=image/svg+xml'
    }]
  },

  plugins: [
    sass
  ]
};
