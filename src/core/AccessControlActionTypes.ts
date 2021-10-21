export type AccessControlConfigParam =
  | string
  | (() => Promise<string> | string);
