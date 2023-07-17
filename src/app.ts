/* eslint-disable class-methods-use-this */
import {
  IncomingMessage, ServerResponse, createServer, request,
} from 'http';
import cluster from 'cluster';
import { cpus } from 'os';
import { getUsers, createUser, updateUser } from './users';

class App {
  private PORT: number;

  private server = createServer();

  static currentPortIndex = 0;

  static workerPorts: number[] = [];

  constructor(PORT: number) {
    this.PORT = PORT;
  }

  private balancer(req: IncomingMessage, res: ServerResponse) {
    if (cluster.isPrimary) {
      const options = {
        port: App.workerPorts[App.currentPortIndex],
        path: req.url,
        method: req.method,
        headers: req.headers,
      };
      const workerRequest = request(options, (workerReq) => {
        res.writeHead(
          Number(workerReq.statusCode),
          workerReq.statusMessage,
          workerReq.headers,
        );
        workerReq.pipe(res);

        App.currentPortIndex === App.workerPorts.length - 1
          ? App.currentPortIndex = 0
          : App.currentPortIndex += 1;
      });
      req.pipe(workerRequest);
    }
  }

  private handleRequest(req: IncomingMessage, res: ServerResponse) {
    if (process.env.NODE_ENV === 'multi') {
      this.balancer(req, res);
    }
    if ((process.env.NODE_ENV === 'multi' && cluster.isWorker)
        || (process.env.NODE_ENV === 'production' && cluster.isPrimary)) {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      });
      // res.write(`I am ${process.pid}, port ${process.env.PORT}`);
      switch (req.method) {
        case 'GET':
          getUsers(req, res);
          break;
        case 'POST':
          createUser(req, res);
          break;
        case 'PUT':
          updateUser(req, res);
          break;
        default: console.log('=(');
      }
      // res.end(JSON.stringify(users));
    }
  }

  private multi() {
    cpus().forEach((_, i) => {
      const workerPort = this.PORT + 1 + i;
      App.workerPorts.push(workerPort);

      cluster.fork({ PORT: workerPort })
        .on('exit', (worker) => {
          console.log(`Worker ${worker} was killed`);
        });
    });
  }

  run() {
    this.server.on('request', (req, res) => {
      this.handleRequest(req, res);
    });
    this.server.listen(this.PORT, () => {
      if (cluster.isPrimary && process.env.NODE_ENV === 'multi') {
        console.log(`The server started listening to requests on port ${this.PORT}`);
        this.multi();
      } else if (cluster.isWorker) {
        console.log(`Worker ${process.pid} started on port: ${process.env.PORT}`);
      } else {
        console.log(`The server started listening to requests on port ${this.PORT}`);
      }
    });
  }
}

export default App;
