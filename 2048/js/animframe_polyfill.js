// const FRAME_INTERVAL_MS = 16;


// (function polyfillRequestAnimationFrame() {
//   var lastTime = 0;
//   var vendors = ['webkit', 'moz'];
//   for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
//     window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
//     window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
//       window[vendors[x] + 'CancelRequestAnimationFrame'];
//   }

//   if (!window.requestAnimationFrame) {
//     window.requestAnimationFrame = function fallbackRequestAnimationFrame(callback) {
//       var currTime = new Date().getTime();
//       var timeToCall = Math.max(0, FRAME_INTERVAL_MS - (currTime - lastTime));
//       var id = window.setTimeout(function timeoutCallback() {
//         callback(currTime + timeToCall);
//       }, timeToCall);
//       lastTime = currTime + timeToCall;
//       return id;
//     };
//   }

//   if (!window.cancelAnimationFrame) {
//     window.cancelAnimationFrame = function fallbackCancelAnimationFrame(id) {
//       clearTimeout(id);
//     };
//   }
// })();

const FRAME_INTERVAL_MS = 16;

(() => {
  let lastTime = 0;
  const vendors = ['webkit', 'moz'];

  // tenta mapear requestAnimationFrame e cancelAnimationFrame dos prefixes
  for (let i = 0; i < vendors.length && !window.requestAnimationFrame; i++) {
    const vp = vendors[i];
    window.requestAnimationFrame = window[`${vp}RequestAnimationFrame`];
    window.cancelAnimationFrame =
      window[`${vp}CancelAnimationFrame`] ||
      window[`${vp}CancelRequestAnimationFrame`];
  }

  // se não existe natívamente, define fallback
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (callback) => {
      const currTime = Date.now();
      const timeToCall = Math.max(0, FRAME_INTERVAL_MS - (currTime - lastTime));
      const id = window.setTimeout(() => {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = (id) => clearTimeout(id);
  }
})();
