function getPlatform(): string {
  try {
    if (window.process) {
      return String(window.process.platform);
    }
  } catch (error) {
    return process.platform;
  }
  return "browser";
}

export const platform: string = getPlatform();

export const IS_PC_IN_WIN = platform === "win32";
export const IS_PC_IN_MAC = platform === "darwin";
/** 当前所处平台环境（浏览器环境） */
export const IS_BROWSER = platform === "browser";
/** 当前所处平台环境（打开客户端应用） */
export const IS_PC = !IS_BROWSER;

export const IS_DEV = process.env.NODE_ENV === "development";
