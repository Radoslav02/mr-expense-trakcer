type ClassValue = string | number | boolean | null | undefined;

export const cn = (...classes: ClassValue[]): string =>
  classes.filter((value): value is string => typeof value === 'string' && value !== '').join(' ');
