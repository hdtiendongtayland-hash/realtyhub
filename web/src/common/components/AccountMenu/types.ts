export type Lang = 'vi' | 'en';

export const LANG_OPTIONS: { code: Lang; label: string }[] = [
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'en', label: 'English' },
];

export const ADMIN_URL = '/admin';

/** Store khong bao gio doi - chi de phan biet server render voi client render. */
export const neverChanges = () => () => {};