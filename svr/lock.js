// try {
//   Skey = '***';
//   window[Symbol.for("_mon$")] = (200).toString(36);
//   Object.defineProperty(window, "money", {
//     get() {
//       return parseInt(window[Symbol.for("_mon$")], 36);
//     },
//     set(x) {
//       if (x.toString().startsWith('***'))
//         window[Symbol.for("_mon$")] = parseInt(x.replace('***', '')).toString(36);
//       else
//         console.log('get gooned');
//     },
//     configurable: false,
//   });
// } catch (e) { }