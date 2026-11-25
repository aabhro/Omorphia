export const debounce = (fn, ms) => {
  let timer = null;

  const run = (...args) => {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, ms);
  };

  run.cancel = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  };

  return run;
};
