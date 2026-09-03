import type { TransformFnParams } from 'class-transformer';

export function trimText({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export function trimOptionalText(parameters: TransformFnParams): unknown {
  const value = trimText(parameters);

  return value === '' ? null : value;
}
