import { readFileSync } from 'fs';
import { join } from 'path';

const JSON_CONFIG_FILENAME = 'src/app-config.json';

export default () => {
  return JSON.parse(readFileSync(join(JSON_CONFIG_FILENAME), 'utf8')) as Record<
    string,
    any
  >;
};
