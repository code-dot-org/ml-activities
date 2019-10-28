module.exports = {
  devtool: 'eval-cheap-module-source-map',
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  entry: {
    demo: './src/demo/index.jsx',
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'umd',
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: "babel-loader",
    },
    {test: /\.css$/, loader: 'style-loader!css-loader'},
    {
      test: /\.jsx$/,
      enforce: 'pre',
      exclude: /(node_modules)/,
      use: [{
        loader: 'babel-loader',
        options: {
          presets: ['react', 'env'],
          plugins: ["transform-class-properties"]
        }
      }]
    }],
  },
};
