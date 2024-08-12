import { IS_BROWSER, IS_PC } from "common/Platform";
import {
  IpcEvents,
  ipcRendererEvents,
  RENDERER_EVENTS_MAP,
} from "common/IpcEvent";

let ipcRenderer: typeof import("electron").ipcRenderer;
if (IS_PC) {
  ipcRenderer = (window.parent as any).require("electron")
    .ipcRenderer as typeof import("electron").ipcRenderer;
}
const getList = Symbol("getList");
type Callback = (type?: any, params?: any) => void | Promise<void>;
interface Listener extends Callback {
  once?: boolean;
}
type Listeners = Record<string, Array<Listener>>;

/**
 * 渲染进程通信类
 * 1. 给主进程发送 ipc 通信
 * 2. 在渲染进程间通信
 *
 * @class IpcManager
 * @extends {EventEmitter}
 *
 * 调用方法：
 * https://www.electronjs.org/docs/api/ipc-renderer#ipcrenderer
 *
 * 与主进程通信相关（与主进程）
 * ipc = new IpcRendererManager();
 * 1. ipc.send() --> 通过channel向主进程发送异步消息，可以发送任意参数。
 * 2. ipc.invoke() --> 通过channel向主进程发送消息，并异步接收主进程返回的值。
 * 3. ipc.ipcRenderer.on() --> 监听 channel，当接收到主进程发来的新消息时 listener 会以 listener(event, args...) 的形式被调用
 * 4. ipc.ipcRenderer.once() --> 添加一次性 listener 函数。被调用该监听器会被移除
 *
 * 事件相关调用（在渲染进程内）
 * 1. ipc.on
 * 2. ipc.once
 * 3. ipc.emit
 * ...
 *
 */
class IpcRendererManager {
  listeners: Listeners;
  RENDERER_EVENTS_MAP: typeof RENDERER_EVENTS_MAP;
  public ipcRenderer = ipcRenderer;
  constructor() {
    this.listeners = {};
    this.RENDERER_EVENTS_MAP = RENDERER_EVENTS_MAP;
    this.ipcRenderer = ipcRenderer;
    if (IS_PC) {
      ipcRendererEvents.forEach((name) => {
        ipcRenderer.removeAllListeners(name);
        ipcRenderer.on(name, (...args: Array<any>) => {
          this.emit(name, ...args);
        });
      });
    }
  }
  public send(channel: IpcEvents, ...args: Array<any>) {
    if (IS_PC) {
      this.ipcRenderer.send(channel, ...args);
    }
  }

  public sendTo(
    webContentsId: number,
    channel: IpcEvents,
    ...args: Array<any>
  ) {
    if (!IS_BROWSER) {
      this.ipcRenderer.sendTo(webContentsId, channel, ...args);
    }
  }

  public invoke(channel: IpcEvents, ...args: Array<any>) {
    return this.ipcRenderer.invoke(channel, ...args);
  }
  [getList](action: string): Array<Listener> {
    if (!this.listeners[action]) {
      this.listeners[action] = [];
    }
    return this.listeners[action];
  }
  on(action: string, callback: Listener): IpcRendererManager {
    this[getList](action).push(callback);
    return this;
  }
  once(action: string, callback: Listener): IpcRendererManager {
    if (!callback) return this;
    const listener = callback;
    listener.once = true;
    this.on(action, listener);
    return this;
  }
  off(action: string, callback: Listener | "*"): IpcRendererManager {
    const list = this[getList](action);
    if (callback === "*") {
      for (let i = list.length - 1; i >= 0; i -= 1) {
        list.splice(i, 1);
      }
    } else {
      for (let i = list.length - 1; i >= 0; i -= 1) {
        if (callback === list[i]) {
          list.splice(i, 1);
        }
      }
    }
    return this;
  }
  emit(action: string, ...args: any[]): IpcRendererManager {
    const list = this[getList](action).map((cb) => cb);
    for (const callback of list) {
      callback(...args);
      if (callback.once) {
        this.off(action, callback);
      }
    }
    return this;
  }
}
const ipcRendererManager = new IpcRendererManager();
export default ipcRendererManager;
export { IpcEvents };
