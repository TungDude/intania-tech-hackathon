/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Add support for Phaser
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules\/phaser/,
      use: {
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env"],
        },
      },
    });
    return config;
  },
};

export default nextConfig;
