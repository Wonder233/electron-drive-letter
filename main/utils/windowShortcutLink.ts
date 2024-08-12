import { shell } from "electron";
import fs from "fs";
import { promisify } from "util";

export async function createShortcutLink(
  targetPath: string,
  linkPath: string,
  iconPath?: string
) {
  try {
    shell.writeShortcutLink(linkPath, "create", {
      target: targetPath,
      icon: iconPath,
      iconIndex: 0,
    });
    return true;
  } catch (err) {
    console.error("createShortcutLink error", err, linkPath, targetPath);
  }
  return false;
}

export async function updateShortcutLink(linkPath: string, targetPath: string) {
  const isExist = await promisify(fs.exists)(linkPath);
  if (!isExist) {
    console.info("updateShortcutLink linkPath no exist", linkPath);
    return false;
  }

  try {
    const info = shell.readShortcutLink(linkPath);
    info.target = targetPath;
    shell.writeShortcutLink(linkPath, "update", info);
    return true;
  } catch (err) {
    console.error("updateShortcutLink error", err);
  }
  return false;
}

export async function getShortcutLinkTargetPath(
  linkPath: string
): Promise<string> {
  const isExist = await promisify(fs.exists)(linkPath);
  if (!isExist) {
    console.info("getShortcutLinkTargetPath linkPath no exist", linkPath);
    return "";
  }
  try {
    const info = shell.readShortcutLink(linkPath);
    return info.target;
  } catch (err) {
    console.error("getShortcutLinkTargetPath error", err);
  }
  return "";
}
