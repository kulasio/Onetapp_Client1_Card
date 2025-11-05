export function installConsoleGuard() {
  if (process.env.NODE_ENV !== 'production') return;

  try {
    const noop = () => {};
    console.log = noop; // eslint-disable-line no-console
    console.info = noop; // eslint-disable-line no-console
    console.debug = noop; // eslint-disable-line no-console
    console.trace = noop; // eslint-disable-line no-console

    // Simple banner to discourage console pasting
    // eslint-disable-next-line no-console
    console.warn('%cStop!','font: 700 36px/1.2 sans-serif; color:#d93025');
    // eslint-disable-next-line no-console
    console.warn('This console is for developers. Pasting code here can compromise your account.');
  } catch (_) {
    // ignore
  }
}


