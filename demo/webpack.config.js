const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    entry: src('./src/index.tsx'),
    output: {
        filename: 'demo-app.js',
        path: src('./demoDist')
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    module:{
        rules: [
            {
                test: /\.tsx?/,
                use: 'ts-loader'
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: src('./src/index.html'),
            inject: 'head',
            scriptLoading: 'defer'
        })
    ]
};

function src(location) {
    return path.resolve(process.cwd(), location);
}
