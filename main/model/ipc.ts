import { ipcMain, IpcMain } from "electron";
import { EventEmitter } from "events";

import {
  ipcMainEvents,
  WEBCONTENTS_READY_FOR_IPC_SIGNAL,
} from "../../common/IpcEvent";
// import MainWindow from "../window/MainWindow";

/**
 * 主进程通信类
 * 1. 给渲染进程发送 ipc 通信
 * 2. 在主进程间通信
 *
 * @class IpcManager
 * @extends {EventEmitter}
 *
 * 调用方法：
 * https://www.electronjs.org/docs/api/ipc-main#ipcmain
 *
 * 与渲染进程通信相关（与渲染进程）
 * ipc = new IpcMainManager();
 * 1. ipc.send() --> 通过channel向主进程发送异步消息，可以发送任意参数。
 * 2. ipc.handle() --> 为invoke IPC 通信添加一个处理器，每当渲染进程调用 ipcRenderer.invoke(channel, ...args) 时这个处理器就会被调用
 * 3. ipc.handleOnce() --> 为invoke IPC 通信添加一个处理器，调用一次后该监听器被移除
 * 4. ipc.ipcMain.on() --> 监听 channel，当接收到渲染进程发来的新消息时 listener 会以 listener(event, args...) 的形式被调用
 * 5. ipc.ipcMain.once() --> 添加一次性 listener 函数。被调用该监听器会被移除
 *
 * 事件相关调用（在主进程内）
 * 1. ipc.on
 * 2. ipc.emit
 * ...
 *
 */
class IpcMainManager extends EventEmitter {
  public readyWebContents = new WeakSet<Electron.WebContents>();

  public ipcMain: IpcMain = ipcMain;

  private messageQueue = new WeakMap<
    Electron.WebContents,
    Array<[string, Array<any> | undefined]>
  >();

  constructor() {
    super();

    this.ipcMain = ipcMain;

    ipcMainEvents.forEach((name: string) => {
      this.ipcMain.removeAllListeners(name);
      this.ipcMain.on(name, (...args: Array<any>) => this.emit(name, ...args));
    });

    this.ipcMain.on(
      WEBCONTENTS_READY_FOR_IPC_SIGNAL,
      (event: Electron.IpcMainEvent) => {
        this.readyWebContents.add(event.sender);

        const queue = this.messageQueue.get(event.sender);
        this.messageQueue.delete(event.sender);
        if (!queue) return;
        // eslint-disable-next-line no-restricted-syntax
        for (const item of queue) {
          this.send(event.sender, item[0], item[1]);
        }
      }
    );
  }

  public send(
    target: Electron.WebContents,
    channel: string,
    _args?: Array<any>
  ) {
    // const target = _target || MainWindow.createWindow().webContents;
    const args = _args || [];
    if (!this.readyWebContents.has(target)) {
      const existing = this.messageQueue.get(target) || [];
      this.messageQueue.set(target, [...existing, [channel, _args]]);
      return;
    }
    target.send(channel, ...args);
  }

  public handle(
    channel: string,
    listener: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any
  ) {
    this.ipcMain.removeHandler(channel);
    this.ipcMain.handle(channel, listener);
  }

  public handleOnce(
    channel: string,
    listener: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any
  ) {
    this.ipcMain.handleOnce(channel, listener);
  }
}
const ipc = new IpcMainManager();
export default ipc;
