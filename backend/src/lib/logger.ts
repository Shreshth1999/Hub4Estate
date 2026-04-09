type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  event: string;
  timestamp: string;
  requestId?: string;
  userId?: string;
  duration?: number;
  [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const MIN_LEVEL = (process.env.LOG_LEVEL as LogLevel) || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL];
}

function emit(entry: LogEntry): void {
  if (!shouldLog(entry.level)) return;
  const output = JSON.stringify(entry);
  if (entry.level === 'error') {
    process.stderr.write(output + '\n');
  } else {
    process.stdout.write(output + '\n');
  }
}

export const logger = {
  debug: (event: string, meta?: Record<string, unknown>) =>
    emit({ level: 'debug', event, timestamp: new Date().toISOString(), ...meta }),
  info: (event: string, meta?: Record<string, unknown>) =>
    emit({ level: 'info', event, timestamp: new Date().toISOString(), ...meta }),
  warn: (event: string, meta?: Record<string, unknown>) =>
    emit({ level: 'warn', event, timestamp: new Date().toISOString(), ...meta }),
  error: (event: string, meta?: Record<string, unknown>) =>
    emit({ level: 'error', event, timestamp: new Date().toISOString(), ...meta }),
};
