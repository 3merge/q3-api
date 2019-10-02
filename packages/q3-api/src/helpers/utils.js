import connect from 'connect';

export const cond = (a) => (Array.isArray(a) ? a : []);

export const compose = (a = []) => {
  const chain = connect();
  a.flat().forEach(chain.use.bind(chain));
  return chain;
};
