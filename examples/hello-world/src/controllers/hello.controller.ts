import { controller, definePath } from '@kraftr/http-framework';
export const getHello = controller(function getHello() {
  const { message, name } = definePath('GET', '/:name/:message');

  return async () => {
    return { text: `${name.value}: ${message.value}` };
  };
});
