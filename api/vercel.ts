import {config} from '../src/config.js';
import {Server} from '../src/Server.js';

const app = new Server(config).app;
export default app;
