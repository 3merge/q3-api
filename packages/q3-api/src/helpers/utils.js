import connect from 'connect';

export default null;

export const compose = (a) => {
  const chain = connect();
  a.forEach(chain.use.bind(chain));
  return chain;
};
