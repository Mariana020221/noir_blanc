export const toNumber = ({ value }: { value: unknown }): unknown => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }

  return Number(value);
};

export const toInteger = ({ value }: { value: unknown }): unknown => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }

  return Number.parseInt(String(value), 10);
};

export const toBoolean = ({ value }: { value: unknown }): unknown => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return value;
};
