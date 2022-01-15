import { get, RestApplication } from '@loopback/rest';
// process.kill(process.pid, 'SIGUSR1');

class StatusController {
  status() {
    return 'ok';
  }
}

get('/status')(StatusController.prototype, 'status', {});

class TestApplication extends RestApplication {
  constructor() {
    super();

    this.controller(StatusController);
  }
}

const app = new TestApplication();

app.start();
