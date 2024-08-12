export enum IpcEvents {
  ON_OPERATE_MAIN_LISTENER = "ON_OPERATE_MAIN_LISTENER", // 主进程监听渲染进程操作，无回调
  INVOKE_OPERATE_MAIN_LISTENER = "INVOKE_OPERATE_MAIN_LISTENER", // 主进程监听渲染进程操作，有回调
}

export const ipcMainEvents = [IpcEvents.ON_OPERATE_MAIN_LISTENER];

export enum RENDERER_EVENTS_MAP {}

export const ipcRendererEvents = [];

export const WEBCONTENTS_READY_FOR_IPC_SIGNAL =
  "WEBCONTENTS_READY_FOR_IPC_SIGNAL"; // 前端内容已渲染完毕，可开启 IPC 通信
