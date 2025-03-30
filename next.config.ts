import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Add support for Phaser
    config.module.rules.push({
      test: /\.js$/,
      use: 'babel-loader',
    });
    return config;
  },
};

export default nextConfig;
