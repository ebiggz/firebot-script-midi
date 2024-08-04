const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const packageJson = require("./package.json");

/**
 * @type {import("webpack").Configuration}
 */
module.exports = {
  target: "node",
  mode: "production",
  devtool: false,
  entry: {
    main: "./src/main.ts",
  },
  output: {
    libraryTarget: "commonjs2",
    libraryExport: "default",
    path: path.resolve(__dirname, "./dist/firebot-midi"),
    filename: `${packageJson.scriptOutputName}.js`,
  },
  resolve: {
    extensions: [".ts", ".js", ".node"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_fnames: /main/,
          mangle: false,
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "./node_modules/@julusian/midi/prebuilds", to: "./prebuilds" },
      ],
    }),
  ]
};
