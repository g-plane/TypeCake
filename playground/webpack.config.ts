import type { Configuration } from 'webpack'
import merge from 'webpack-merge'
import HtmlWebpackPlugin from 'html-webpack-plugin'

const baseConfig: Configuration = {
  entry: './src/index.tsx',
  output: {
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.tpc$/,
        type: 'asset/source',
      },
    ],
  },
  plugins: [new HtmlWebpackPlugin({ title: 'Typacro Playground' })],
  resolve: {
    extensions: ['.js', '.tsx', '.ts'],
  },
  cache: {
    type: 'filesystem',
  },
  // @ts-expect-error
  devServer: {
    hot: true,
  },
  stats: 'errors-warnings',
  ignoreWarnings: [/size limit/i],
}

export default (_: Record<string, string>, argv: Record<string, string>) => {
  if (argv.mode === 'development') {
    return merge(baseConfig, {
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            loader: 'swc-loader',
            options: {
              jsc: {
                transform: {
                  react: {
                    runtime: 'automatic',
                    development: true,
                  },
                },
              },
            },
          },
        ],
      },
    })
  }

  return merge(baseConfig, {
    output: {
      filename: '[name].[contenthash:8].js',
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'swc-loader',
          options: {
            jsc: {
              transform: {
                react: {
                  runtime: 'automatic',
                },
              },
            },
          },
        },
      ],
    },
  })
}
