import { User, UserID } from 'types';
import { RequestListener } from 'http';
// import { v4 as uuidv4 } from 'uuid';

export const users = new Map<UserID, User>();

export const getUsers: RequestListener = async (req, res) => {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const [userId] = url.pathname.split('/').reverse();
  if (url.pathname === '/api/users') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
    });
    res.end(JSON.stringify([...users.values()]));
  } else if (users.has(userId)) {
    res.writeHead(200, {
      'Content-Type': 'application/json',
    });
    res.end(JSON.stringify(users.get(userId)));
  } else {
    res.writeHead(404);
    res.end();
  }
};
