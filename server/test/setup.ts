// Every test app boots without TURNSTILE_SECRET; the one-line warning is expected noise here.
const warn = console.warn.bind(console);
console.warn = (...args: unknown[]) => {
  if (/TURNSTILE_SECRET/.test(String(args[0]))) return;
  warn(...args);
};
