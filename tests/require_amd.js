import requirejs from 'requirejs';
requirejs.config({
  baseUrl: new URL('../src/', import.meta.url).pathname,
});

export function requireAmd(deps) {
  if (typeof deps === 'string') {
    return new Promise((resolve, reject) => {
      requirejs([deps], resolve, reject);
    });
  } else if (Array.isArray(deps)) {
    return new Promise((resolve, reject) => {
      requirejs(deps, (...args) => resolve(args), reject);
    });
  } else {
    throw new Error(`Unexpected amd dependency: ${deps}`);
  }
}
