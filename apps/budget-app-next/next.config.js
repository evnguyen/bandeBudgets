const { withTamagui } = require('@tamagui/next-plugin');
module.exports = function (name, { defaultConfig }) {
  let config = {
    ...defaultConfig,
    webpack: (config) => {
      config.resolve.alias = {
        ...config.resolve.alias,
        'react-native-svg': 'react-native-svg-web',
      };
      return config;
    },
    // ...your configuration
  };
  const tamaguiPlugin = withTamagui({
    config: './tamagui.config.ts',
    components: ['tamagui'],
    appDir: true,
  });
  return {
    ...config,
    ...tamaguiPlugin(config),
  };
};
