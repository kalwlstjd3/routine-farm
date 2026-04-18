// TODO: 출시 전 제거 예정

export interface CapturedLog {
  level: 'error' | 'warn';
  message: string;
  time: string;
}

const MAX_LOGS = 10;
const logs: CapturedLog[] = [];
const listeners: Array<(logs: CapturedLog[]) => void> = [];

function notify() {
  const snapshot = [...logs];
  listeners.forEach((fn) => fn(snapshot));
}

function addLog(level: CapturedLog['level'], args: unknown[]) {
  const message = args
    .map((a) => {
      if (a instanceof Error) return `${a.name}: ${a.message}`;
      if (typeof a === 'object' && a !== null) {
        try { return JSON.stringify(a); } catch { return String(a); }
      }
      return String(a);
    })
    .join(' ');

  const time = new Date().toLocaleTimeString('ko-KR');
  logs.unshift({ level, message, time });
  if (logs.length > MAX_LOGS) logs.splice(MAX_LOGS);
  notify();
}

export function setupConsoleCapture() {
  const origError = console.error.bind(console);
  const origWarn = console.warn.bind(console);

  console.error = (...args: unknown[]) => {
    origError(...args);
    addLog('error', args);
  };

  console.warn = (...args: unknown[]) => {
    origWarn(...args);
    addLog('warn', args);
  };
}

export function subscribeConsoleLogs(fn: (logs: CapturedLog[]) => void): () => void {
  listeners.push(fn);
  fn([...logs]); // 구독 즉시 현재 상태 전달
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

export function clearConsoleLogs() {
  logs.splice(0);
  notify();
}
