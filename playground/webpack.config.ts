import * as path from 'path'
import type { Configuration } from 'webpack'
import type { Configuration as DevServerConfiguration } from 'webpack-dev-server'
import merge from 'webpack-merge'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin'

export default (_: Record<string, string>, argv: Record<string, string>) => {
  const isDev = argv.mode === 'development'

  const baseConfig: Configuration & { devServer?: DevServerConfiguration } = {
    entry: './src/index.tsx',
    output: {
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true,
                dynamicImport: true,
              },
              transform: {
                react: {
                  runtime: 'automatic',
                  refresh: isDev,
                },
              },
            },
          },
        },
        {
          test: /\.tpc$/,
          type: 'asset/source',
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'public/index.html'),
      }),
    ],
    resolve: {
      extensions: ['.js', '.tsx', '.ts'],
    },
    cache: {
      type: 'filesystem',
    },
    devServer: {
      hot: true,
    },
    devtool: 'eval-cheap-module-source-map',
    stats: 'errors-warnings',
    ignoreWarnings: [/size limit/i],
  }

  if (isDev) {
    return merge(baseConfig, {
      plugins: [new ReactRefreshWebpackPlugin()],
    })
  }

  return merge(baseConfig, {
    output: {
      filename: '[name].[contenthash:8].js',
    },
  })
}
