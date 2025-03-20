import { config } from '@tamagui/config/v3';

import { createTamagui } from 'tamagui'; // or '@tamagui/core'
const appConfig = createTamagui({
  ...config,
  themes: {
    ...config.themes,
  },
});
export default appConfig;
