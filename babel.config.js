module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
    ],
  };
}; 


// module.exports = function(api) {
//   api.cache(true);

//   // The base presets for React Native
//   const presets = ['module:metro-react-native-babel-preset'];

//   // When the platform is web, we add presets needed for the browser.
//   if (api.caller((caller) => caller && caller.platform === 'web')) {
//     presets.push([
//       '@babel/preset-env', {
//         useBuiltIns: 'usage',
//         corejs: 3,
//         targets: {
//           browsers: '> 0.5%, not dead',
//         },
//       },
//     ]);
//     presets.push('@babel/preset-react');
//   }

//   return {
//     presets,
//     plugins: [
//       // This plugin is often needed for React Native Web
//       'react-native-reanimated/plugin',
//     ],
//   };
// };
