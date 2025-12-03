// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     turbopack: {}, // silence turbopack warnings
  
//     webpack: (config) => {
//       // Required for hot reload inside /mnt/c on WSL2
//       config.watchOptions = {
//         poll: 1000,            // check for file changes every 1s
//         aggregateTimeout: 300, // delay rebuild slightly
//         ignored: /node_modules/, 
//       };
//       return config;
//     },
//   };
  
//   module.exports = nextConfig;