import { logger, consoleTransport } from 'react-native-logs';

// 콘솔 로그를 파일로 저장하는 기능도 추가할 수 있습니다
const defaultConfig = {
  severity: 'debug',
  transport: consoleTransport,
  transportOptions: {
    color: true,
  },
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  },
  async: true,
  dateFormat: 'time',
  printLevel: true,
  printDate: true,
  enabled: true,
};

// @ts-ignore - 타입 오류 무시
const log = logger.createLogger(defaultConfig);

// 로그 레벨에 따른 함수들
export const debug = (message: string, ...args: any[]) => {
  log.debug(`[FRONT-DEBUG] ${message}`, ...args);
};

export const info = (message: string, ...args: any[]) => {
  log.info(`[FRONT-INFO] ${message}`, ...args);
};

export const warn = (message: string, ...args: any[]) => {
  log.warn(`[FRONT-WARN] ${message}`, ...args);
};

export const error = (message: string, ...args: any[]) => {
  log.error(`[FRONT-ERROR] ${message}`, ...args);
};

// 특정 기능별 로거
export const createLogger = (module: string) => ({
  debug: (message: string, ...args: any[]) => debug(`[${module}] ${message}`, ...args),
  info: (message: string, ...args: any[]) => info(`[${module}] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => warn(`[${module}] ${message}`, ...args),
  error: (message: string, ...args: any[]) => error(`[${module}] ${message}`, ...args),
});

export default {
  debug,
  info,
  warn,
  error,
  createLogger,
}; 