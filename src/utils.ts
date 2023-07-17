import { User, UserID } from 'types';
import { users } from './users';

export function isValidUser(
  ReqBody: string,
  upDateUser?: User,
  id?: UserID,
) {
  try {
    let user = JSON.parse(ReqBody.toString());
    if (upDateUser && id) {
      user = {
        ...users.get(id),
        ...upDateUser,
      };
    }
    const hasOwnProperty = ['username', 'age', 'hobbies'].every((key) => key in user);
    const isUserHobbiesString = user.hobbies.every((key: string) => typeof key === 'string');

    return !!(hasOwnProperty
    && typeof user.username === 'string'
    && typeof user.age === 'number'
    && user.hobbies instanceof Array
    && isUserHobbiesString);
  } catch {
    return false;
  }
}
