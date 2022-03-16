import {config} from '../src/config';
import {Server} from '../src/Server';

const app = new Server(config).app;
export = app;
