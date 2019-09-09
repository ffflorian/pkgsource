import {Router} from 'express';

export const healthCheckRoute = () => Router().get('/_health/?', (req, res) => res.sendStatus(200));
