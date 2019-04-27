const path = require("path")

// webpack.config.js
module.exports = {
    entry: "./src/sketch.js",
    output: {
        path: path.resolve(__dirname, "build"),
        filename: "sketch.js",
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: "babel-loader",
                query: {
                    presets: ["@babel/preset-env"],
                },
            },
            {
                test: /\.vert$/i,
                use: "raw-loader",
            },
            {
                test: /\.frag$/i,
                use: "raw-loader",
            },
        ],
    },
    devServer: {
        contentBase: path.join(__dirname, "public"),
        publicPath: path.join(__dirname, "build"),
        compress: true,
        port: 3000,
    },
}
