const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    entry: path.resolve('./src/index.ts'),
    output: {
        path: path.resolve('./dist'),
        filename: 'index.min.js',
        clean: true
    },
    resolve: {
        extensions: ['.ts', '.js', '.json']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                use: ['style-loader', 'css-loader', { loader: 'sass-loader', options: { api: 'modern' } }]
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    devServer: {
        host: '127.0.0.1',
        port: 8080,
        static: './dist'
    },
    performance: { hints: false },
    plugins: [
        new CopyWebpackPlugin({ patterns: [{ from: './assets', to: 'assets' }] }),
        new HtmlWebpackPlugin({
            minify: false,
            inject: 'body',
            template: 'assets/index.html'
        })
    ]
};
