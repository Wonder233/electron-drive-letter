import { IS_PC_IN_MAC, IS_PC_IN_WIN } from "../../common/Platform";
import { IpcEvents } from "../../common/IpcEvent";

import { createLocalDir, getSyncLinkDirPath } from "../utils/pathHelper";
import ipc from "./ipc";
import {
  addWindowLeftPaneLink,
  getWindowLeftPaneLinkTargetPath,
  removeWindowLeftPaneLink,
  updateWindowLeftPaneLinkTargetPath,
} from "../utils/windowLeftPaneLinkUtils";
// import {
//   addMacFinderLink,
//   removeMacFinderLink,
// } from "../utils/macFinderLinkUtils";

// eslint-disable-next-line @typescript-eslint/ban-types
const EventFnMap: Record<string, Function> = {
  async addSysSyncEntry() {
    console.log("addSysSyncEntry");
    try {
      const targetPath = await getSyncLinkDirPath();
      await createLocalDir(targetPath);

      if (IS_PC_IN_WIN) {
        await this.checkWindowSysSyncEntry(targetPath);
      } else if (IS_PC_IN_MAC) {
        // await this.checkMacSysSyncEntry(targetPath);
        console.log("addSysSyncEntry no support Sys");
      } else {
        console.log("addSysSyncEntry no support Sys");
      }
      return true;
    } catch (err) {
      console.error("addSysSyncEntry error", err);
    }
    return false;
  },

  async removeSysSyncEntry() {
    console.log("removeSysSyncEntry");
    try {
      if (IS_PC_IN_WIN) {
        const regTargetPath = await getWindowLeftPaneLinkTargetPath();
        if (regTargetPath.length > 0) {
          await removeWindowLeftPaneLink();
        } else {
          console.log(
            "removeSysSyncEntry removeWindowLeftPaneLink have remove"
          );
        }
      } else if (IS_PC_IN_MAC) {
        // await removeMacFinderLink();
        console.log("removeSysSyncEntry no support Sys");
      } else {
        console.log("removeSysSyncEntry no support Sys");
      }
      return true;
    } catch (err) {
      console.error("removeSysSyncEntry error", err);
    }
    return false;
  },

  async checkWindowSysSyncEntry(targetPath: string) {
    // 判断是否有指向当前同步盘的路径
    const regTargetPath = await getWindowLeftPaneLinkTargetPath();
    if (targetPath === regTargetPath) {
      console.log("checkSysSyncEntry same targetPath", targetPath);
      return false;
    }

    if (!regTargetPath.length) {
      console.log("checkSysSyncEntry addWindowLeftPaneLink", targetPath);
      await addWindowLeftPaneLink(targetPath);
    } else {
      console.log(
        "checkSysSyncEntry updateWindowLeftPaneLinkTargetPath",
        targetPath
      );
      await updateWindowLeftPaneLinkTargetPath(targetPath);
    }
  },

  async checkMacSysSyncEntry(targetPath: string) {
    console.log("checkMacSysSyncEntry", targetPath);
    // addMacFinderLink(targetPath);
  },
};

/**
 * @description 监听渲染进程事件，操作主进程
 * @export
 */
export function setupListeners(mainWindow: Electron.BrowserWindow): void {
  ipc.on(IpcEvents.ON_OPERATE_MAIN_LISTENER, (e, props) => {
    const fn = props.event;
    if (EventFnMap[fn]) {
      EventFnMap[fn](mainWindow, props.params);
    }
  });
}

/**
 * @description 监听渲染进程事件，并返回给渲染进程结果
 * @export
 */
export function setupInvokerHandles(win: Electron.BrowserWindow): void {
  try {
    ipc.handle(
      IpcEvents.INVOKE_OPERATE_MAIN_LISTENER,
      async (e, props): Promise<any> => {
        const fn = props.event;
        if (EventFnMap[fn]) {
          const res = await EventFnMap[fn](win, props.params);
          return res;
        }
        return null;
      }
    );
  } catch (error) {
    console.error("setupInvokerHandles error", error);
  }
}
