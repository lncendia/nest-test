import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Рекурсивно разворачивает объект в плоский словарь.
 */
function flattenObject(obj: any, prefix = ''): Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value)
      ) {
        Object.assign(acc, flattenObject(value, fullKey));
      } else {
        acc[fullKey] = value;
      }

      return acc;
    },
    {} as Record<string, any>,
  );
}

export default (path: string, required: boolean = true) => {
  const allPath = resolve(process.cwd(), path);

  return () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const json = JSON.parse(readFileSync(allPath, 'utf8'));
      return flattenObject(json);
    } catch (error) {
      if (required) throw error;
      return {};
    }
  };
};
