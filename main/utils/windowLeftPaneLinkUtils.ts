/* eslint-disable @typescript-eslint/no-var-requires */
import path from "path";
import fs from "fs";
import { app } from "electron";
import { promisify } from "util";
import regedit from "regedit";

import { IS_DEV } from "../../common/Platform";
import {
  createShortcutLink,
  getShortcutLinkTargetPath,
  updateShortcutLink,
} from "./windowShortcutLink";

const promisifiedRegedit = regedit.promisified;

function isWin10orLater() {
  let win10orLater = true;
  try {
    if (parseInt(process.getSystemVersion().split(".")[0], 10) < 10) {
      win10orLater = false;
    }
  } catch (err) {
    console.error("isWin10orLater error", err);
  }
  return win10orLater;
}

function getResourcesPath() {
  let resources = path.join(path.dirname(app.getPath("exe")), "./resources");
  if (IS_DEV) {
    resources = path.join(
      path.dirname(app.getPath("exe")),
      "../../../resources"
    );
  }
  return resources;
}

export function getSyncLinkShowName(locale?: string) {
  console.log(locale);
  const appName = "企业网盘";
  return appName;
  // if (!locale) {
  //   return i18n_t(appName);
  // }
  // return i18n_td(appName, locale);
}

const leftPanelLinkInWin7 = {
  async getQuickLinkPath() {
    let linkPath = path.join(
      app.getPath("home"),
      `Links\\${getSyncLinkShowName("zh-CN")}.lnk`
    );
    let isExist = await promisify(fs.exists)(linkPath);
    if (isExist) {
      console.info("getWin7QuickLinkPath zh-CN", linkPath);
      return linkPath;
    }
    linkPath = path.join(
      app.getPath("home"),
      `Links\\${getSyncLinkShowName("en-US")}.lnk`
    );
    isExist = await promisify(fs.exists)(linkPath);
    if (isExist) {
      console.info("getMacLinkPath en-US", linkPath);
      return linkPath;
    }

    linkPath = path.join(
      app.getPath("home"),
      `Links\\${getSyncLinkShowName()}.lnk`
    );
    return linkPath;
  },
  async create(targetPath: string) {
    const linkPath = await this.getQuickLinkPath();
    const resources = getResourcesPath();
    const iconPath = path.join(resources, "icons/favicon.ico");
    await createShortcutLink(targetPath, linkPath, iconPath);
  },
  async get(): Promise<string> {
    const linkPath = await this.getQuickLinkPath();
    return getShortcutLinkTargetPath(linkPath);
  },
  async update(targetPath: string) {
    const linkPath = await this.getQuickLinkPath();
    return updateShortcutLink(linkPath, targetPath);
  },
  async remove() {
    try {
      const linkPath = await this.getQuickLinkPath();
      await promisify(fs.unlink)(linkPath);
    } catch (err) {
      console.error("leftPanelLinkInWin7 remove error", err);
    }
  },
};

const leftPanelLinkAfterWin7 = {
  async addReg(
    syncLinkShowName: string,
    iconPath: string,
    targetFolderPath: string
  ) {
    try {
      // TODO: 下面的CLSID后面的数据({104B5E4D-3DC4-4868-83B1-80C3CCC500AE})应该生成一个新的CLSID
      await promisifiedRegedit.createKey([
        "HKCU\\Software\\Classes\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}",
        "HKCU\\Software\\Classes\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}\\DefaultIcon",
        "HKCU\\Software\\Classes\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}\\InprocServer32",
        "HKCU\\Software\\Classes\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}\\ShellFolder",
        "HKCU\\Software\\Classes\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}\\Instance",
        "HKCU\\Software\\Classes\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}\\Instance\\InitPropertyBag",
        "HKCU\\Software\\Classes\\WOW6432Node\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}",
        "HKCU\\Software\\Classes\\WOW6432Node\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}\\DefaultIcon",
        "HKCU\\Software\\Classes\\WOW6432Node\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}\\InprocServer32",
        "HKCU\\Software\\Classes\\WOW6432Node\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}\\ShellFolder",
        "HKCU\\Software\\Classes\\WOW6432Node\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}\\Instance",
        "HKCU\\Software\\Classes\\WOW6432Node\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}\\Instance\\InitPropertyBag",
        "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Desktop\\NameSpace\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}",
      ]);

      await promisifiedRegedit.putValue({
        "HKCU\\Software\\Classes\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}\\DefaultIcon":
          {
            default: {
              value: iconPath,
              type: "REG_DEFAULT",
            },
          },
        "HKCU\\Software\\Classes\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}\\InprocServer32":
          {
            default: {
              value: "%SystemRoot%\\system32\\shell32.dll",
              type: "REG_DEFAULT",
            },
            ThreadingModel: {
              value: "Apartment",
              type: "REG_SZ",
            },
          },
        "HKCU\\Software\\Classes\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}\\ShellFolder":
          {
            Attributes: {
              value: 4034920525,
              type: "REG_DWORD",
            },
            FolderValueFlags: {
              value: 40,
              type: "REG_DWORD",
            },
          },
        "HKCU\\Software\\Classes\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}\\Instance":
          {
            CLSID: {
              value: "{0E5AAE11-A475-4c5b-AB00-C66DE400274E}",
              type: "REG_SZ",
            },
          },
        "HKCU\\Software\\Classes\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}\\Instance\\InitPropertyBag":
          {
            Attributes: {
              value: 17,
              type: "REG_DWORD",
            },
            TargetFolderPath: {
              value: targetFolderPath,
              type: "REG_SZ",
            },
          },
        "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\HideDesktopIcons\\NewStartPanel":
          {
            "{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}": {
              value: 1,
              type: "REG_DWORD",
            },
          },
        "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Desktop\\NameSpace\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}":
          {
            default: {
              value: syncLinkShowName,
              type: "REG_DEFAULT",
            },
          },
        "HKCU\\Software\\Classes\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}":
          {
            default: {
              value: syncLinkShowName,
              type: "REG_DEFAULT",
            },
            SortOrderIndex: {
              value: 66,
              type: "REG_DWORD",
            },
            "System.IsPinnedToNameSpaceTree": {
              value: 1,
              type: "REG_DWORD",
            },
          },
        "HKCU\\Software\\Classes\\WOW6432Node\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}":
          {
            default: {
              value: syncLinkShowName,
              type: "REG_DEFAULT",
            },
            SortOrderIndex: {
              value: 66,
              type: "REG_DWORD",
            },
            "System.IsPinnedToNameSpaceTree": {
              value: 1,
              type: "REG_DWORD",
            },
          },
        "HKCU\\Software\\Classes\\WOW6432Node\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}\\DefaultIcon":
          {
            default: {
              value: iconPath,
              type: "REG_DEFAULT",
            },
          },
        "HKCU\\Software\\Classes\\WOW6432Node\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}\\InprocServer32":
          {
            default: {
              value: "%SystemRoot%\\system32\\shell32.dll",
              type: "REG_DEFAULT",
            },
            ThreadingModel: {
              value: "Apartment",
              type: "REG_SZ",
            },
          },
        "HKCU\\Software\\Classes\\WOW6432Node\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}\\ShellFolder":
          {
            Attributes: {
              value: 4034920525,
              type: "REG_DWORD",
            },
            FolderValueFlags: {
              value: 40,
              type: "REG_DWORD",
            },
          },
        "HKCU\\Software\\Classes\\WOW6432Node\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}\\Instance":
          {
            CLSID: {
              value: "{0E5AAE11-A475-4c5b-AB00-C66DE400274E}",
              type: "REG_SZ",
            },
          },
        "HKCU\\Software\\Classes\\WOW6432Node\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}\\Instance\\InitPropertyBag":
          {
            Attributes: {
              value: 17,
              type: "REG_DWORD",
            },
            TargetFolderPath: {
              value: targetFolderPath,
              type: "REG_SZ",
            },
          },
      });
    } catch (err) {
      console.error("add64Reg error", err);
    }
  },
  async create(targetPath: string) {
    const resources = getResourcesPath();
    const vbsDirectory = path.join(resources, "vbs");
    const iconPath = path.join(resources, "icons/favicon.ico");

    regedit.setExternalVBSLocation(vbsDirectory);

    console.info(
      "leftPanelLinkAfterWin7 create start",
      vbsDirectory,
      iconPath,
      targetPath
    );
    await this.addReg(getSyncLinkShowName(), iconPath, targetPath);
    console.info("leftPanelLinkAfterWin7 create end");
  },
  async get(): Promise<string> {
    const vbsDirectory = path.join(getResourcesPath(), "vbs");
    regedit.setExternalVBSLocation(vbsDirectory);
    console.info("getWindowLeftPaneLinkTargetPath start", vbsDirectory);

    const promisifiedRegedit = require("regedit").promisified;
    try {
      const listResult = await promisifiedRegedit.list(
        "HKCU\\Software\\Classes\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}\\Instance\\InitPropertyBag"
      );
      const { TargetFolderPath } =
        listResult[
          "HKCU\\Software\\Classes\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}\\Instance\\InitPropertyBag"
        ].values;
      const targetPath = TargetFolderPath && TargetFolderPath.value;
      console.info("getWindowLeftPaneLinkTargetPath", targetPath, listResult);
      return targetPath || "";
    } catch (err) {
      console.error("getWindowLeftPaneLinkTargetPath error", err);
    }
    return "";
  },
  async update(targetPath: string) {
    const vbsDirectory = path.join(getResourcesPath(), "vbs");
    regedit.setExternalVBSLocation(vbsDirectory);
    console.info(
      "updateWindowLeftPaneLinkTargetPath",
      vbsDirectory,
      targetPath
    );

    const promisifiedRegedit = require("regedit").promisified;
    try {
      await promisifiedRegedit.putValue({
        "HKCU\\Software\\Classes\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}\\Instance\\InitPropertyBag":
          {
            Attributes: {
              value: "17",
              type: "REG_DWORD",
            },
            TargetFolderPath: {
              value: targetPath,
              type: "REG_SZ",
            },
          },
      });
      return true;
    } catch (err) {
      console.error("setWindowLeftPaneLinkTargetPath error", err);
    }
    return false;
  },
  async remove() {
    const vbsDirectory = path.join(getResourcesPath(), "vbs");
    regedit.setExternalVBSLocation(vbsDirectory);
    console.info("leftPanelLinkAfterWin7.remove start", vbsDirectory);

    try {
      await promisifiedRegedit.deleteKey([
        "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Desktop\\NameSpace\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}",
      ]);
    } catch (err) {
      console.error("leftPanelLinkAfterWin7.remove NameSpace error", err);
    }

    try {
      await promisifiedRegedit.deleteKey([
        "HKCU\\Software\\Classes\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}\\Instance\\InitPropertyBag",
        "HKCU\\Software\\Classes\\WOW6432Node\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}\\Instance\\InitPropertyBag",
      ]);
      await promisifiedRegedit.deleteKey([
        "HKCU\\Software\\Classes\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}\\DefaultIcon",
        "HKCU\\Software\\Classes\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}\\InprocServer32",
        "HKCU\\Software\\Classes\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}\\ShellFolder",
        "HKCU\\Software\\Classes\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}\\Instance",
        "HKCU\\Software\\Classes\\WOW6432Node\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}\\DefaultIcon",
        "HKCU\\Software\\Classes\\WOW6432Node\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}\\InprocServer32",
        "HKCU\\Software\\Classes\\WOW6432Node\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}\\ShellFolder",
        "HKCU\\Software\\Classes\\WOW6432Node\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}\\Instance",
      ]);
      await promisifiedRegedit.deleteKey([
        "HKCU\\Software\\Classes\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}",
        "HKCU\\Software\\Classes\\WOW6432Node\\CLSID\\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}",
      ]);
    } catch (err) {
      console.error("leftPanelLinkAfterWin7.remove CLSID error", err);
    }

    try {
      await promisifiedRegedit.putValue({
        "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\HideDesktopIcons\\NewStartPanel":
          {
            "{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}": {
              value: 0,
              type: "REG_DWORD",
            },
          },
      });
    } catch (err) {
      console.error("leftPanelLinkAfterWin7.remove NewStartPanel error", err);
    }
    console.info("leftPanelLinkAfterWin7.remove end");
  },
};

export async function addWindowLeftPaneLink(targetFolderPath: string) {
  if (!isWin10orLater()) {
    await leftPanelLinkInWin7.create(targetFolderPath);
  } else {
    await leftPanelLinkAfterWin7.create(targetFolderPath);
  }
}

export async function removeWindowLeftPaneLink() {
  if (!isWin10orLater()) {
    await leftPanelLinkInWin7.remove();
  } else {
    await leftPanelLinkAfterWin7.remove();
  }
}

export async function getWindowLeftPaneLinkTargetPath(): Promise<string> {
  if (!isWin10orLater()) {
    return leftPanelLinkInWin7.get();
  }
  return leftPanelLinkAfterWin7.get();
}

export async function updateWindowLeftPaneLinkTargetPath(targetPath: string) {
  if (!isWin10orLater()) {
    return leftPanelLinkInWin7.update(targetPath);
  }
  return leftPanelLinkAfterWin7.update(targetPath);
}
