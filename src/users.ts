import { User, UserID } from 'types';
import { RequestListener } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { ifValidUser } from './utils';

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
    res.writeHead(400);
    res.end('UserId is invalid');
  }
};

export const createUser: RequestListener = async (req, res) => {
  const url = new URL(req.url!, `http://${req.headers.host}`);

  req.on('data', (body) => {
    switch (url.pathname) {
      case '/api/users':
        if (ifValidUser(body)) {
          const user = JSON.parse(body.toString());
          const userId = uuidv4();

          users.set(userId, {
            id: userId,
            ...user,
          });

          res.writeHead(200);
          res.end();
        } else {
          res.writeHead(400);
          res.end('Body does not contain required fields');
        }
        break;
      default:
        res.writeHead(404);
        res.end();
    }
  });
};
