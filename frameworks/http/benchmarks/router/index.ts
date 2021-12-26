import { add, complete, cycle, save, suite } from 'benny';
// @ts-ignore
import FastRouter from 'fast-router';
import fmw from 'find-my-way';
// @ts-ignore
import routington from 'routington';
import TRouter from 'trouter';
// @ts-ignore
import wayfarer from 'wayfarer';
import { Router } from '../../src/extra/router';
import { HTTPMethod } from '../../src/composition/utils';

const models = [
  'users',
  'products',
  'actions',
  'activities',
  'peoples',
  'employees',
  'providers',
  'deals',
  'invoice',
  'files',
  'modules',
  'sessions',
  'sites',
  'configs'
];

const routes: [HTTPMethod, string, string][] = [
  ['GET', '/', '/'],
  ['POST', '/', '/']
];

for (const model of models) {
  routes.push(['GET', `/${model}`, `/${model}`]);
  routes.push(['GET', `/${model}/:id`, `/${model}/23`]);
  routes.push(['GET', `/${model}/:id/nested`, `/${model}/23/nested`]);
  routes.push(['GET', `/${model}/:id/nested/:nestedId`, `/${model}/23/nested/25`]);
  routes.push([
    'GET',
    `/${model}/:id/nested/:nestedId/nested2/nested3/:nestedId3`,
    `/${model}/abc/nested/25/nested2/nested3/32`
  ]);
  routes.push(['POST', `/${model}`, `/${model}`]);
  routes.push(['DELETE', `/${model}`, `/${model}`]);
  routes.push(['PATCH', `/${model}`, `/${model}`]);
  routes.push(['PATCH', `/${model}/:id`, `/${model}/abc`]);
  routes.push(['PATCH', `/${model}/:id/nested`, `/${model}/abc/nested`]);
  routes.push(['PATCH', `/${model}/:id/nested/:nestedId`, `/${model}/abc/nested/25`]);
  routes.push([
    'PATCH',
    `/${model}/:id/nested/:nestedId/nested2/nested3/:nestedId3`,
    `/${model}/abc/nested/25/nested2/nested3/32`
  ]);
  routes.push(['PUT', `/${model}`, `/${model}`]);
  routes.push(['HEAD', `/${model}`, `/${model}`]);
}
const trouter = new TRouter();
const builtinRouter = new Router();
const rRouter = routington();
const wRouter = wayfarer();
const fastRouter = new FastRouter.Router();
const fmwRouter = fmw();

const noop = () => {};

routes.forEach(([method, route]) => {
  trouter.add(method, route, noop);
  builtinRouter.add(method, route, '');
  rRouter.define(route);
  fastRouter.addRoute(route, '');
  wRouter.on(route, () => {});
  fmwRouter.on(method as never, route, () => {});
});

async function main() {
  await suite(
    'Routers (general)',
    add('Builtin router', () => {
      for (const [method, , route] of routes) {
        builtinRouter.find(method, route);
      }
    }),
    add('trouter', () => {
      for (const [method, , route] of routes) {
        trouter.find(method, route);
      }
    }),
    add('routington', () => {
      for (const [, , route] of routes) {
        rRouter.match(route);
      }
    }),
    add('wayfarer', () => {
      for (const [, , route] of routes) {
        wRouter.match(route);
      }
    }),
    add('fast-router', () => {
      for (const [, , route] of routes) {
        fastRouter.parse(route);
      }
    }),
    add('find-my-way', () => {
      for (const [method, , route] of routes) {
        fmwRouter.find(method as never, route);
      }
    }),
    cycle(),
    complete(),
    save({ file: 'general', folder: 'benchmarks/router', format: 'chart.html' })
  );
}

main().catch;
