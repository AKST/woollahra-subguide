export interface StorageService {
  read: (key: string) => string | null;
  write: (key: string, value: string) => void;
}

/**
 * Hello. Angus here, maybe you're here because you Cmd+F localStorage
 * or something after reading the disclaimer about not saving any user
 * data, and well you're looking at the development build which is not
 * on the offical build, meaning this will never run on any users
 * device besides my own in testing (mostly to prepopulate the form
 * with information so I can test some things).
 *
 * However if you do see this in the offical build please notify me,
 * even so, even if this accidentally shipped, it is still the case
 * that I will never see ever any user data.
 *
 * ---------
 *
 * If you're still intersted, this is only used in a feature when this
 * 1. running in a dev build, 2. the device hostname is localhost or
 * 127.0.0.1 or whatever, basically not the hostname of the website
 * you'll likely see this running on.
 */
export function createLocalStorageService(): StorageService {
  return {
    read: key => localStorage.getItem(key),
    write: (key, value) => localStorage.setItem(key, value),
  };
}
