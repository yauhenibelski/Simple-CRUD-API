export function ifValidUser(ReqBody: string) {
  try {
    const user = JSON.parse(ReqBody.toString());
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
