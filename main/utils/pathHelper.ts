import path from "path";
import fs from "fs";
import { app } from "electron";
import { promisify } from "util";

export async function getSyncLinkDirPath() {
  const dirPath = path.join(app.getPath("userData"), `drive_link/`);
  return dirPath;
}

export async function createLocalDir(
  dirPath: string,
  maxDeep = 20
): Promise<Array<string>> {
  const rootDirPath = path.dirname(dirPath);
  const createList = new Array<string>();

  if (maxDeep <= 0) {
    throw { code: "over max deep" };
  }
  let isExist = await promisify(fs.exists)(rootDirPath);
  if (!isExist) {
    const retCreateList = await createLocalDir(rootDirPath, maxDeep - 1);
    retCreateList.forEach((item) => {
      createList.push(item);
    });
  }

  isExist = await promisify(fs.exists)(dirPath);
  if (!isExist) {
    await promisify(fs.mkdir)(dirPath);
    createList.push(dirPath);
  } else {
    const stats = await promisify(fs.stat)(dirPath);
    if (stats.isFile()) {
      throw { code: "create dir have file" };
    }
  }
  return createList;
}

export async function deleteLocalDir(dirPath: string) {
  const isExist = await promisify(fs.exists)(dirPath);
  if (!isExist) {
    return true;
  }

  const list = await listLocalDirectory(dirPath);
  if (list.length === 0) {
    await promisify(fs.rmdir)(dirPath);
    return;
  }

  await Promise.all(
    list.map(async (item) => {
      const filePath = path.join(dirPath, item);
      await promisify(fs.unlink)(filePath);
    })
  ).catch((error) => {
    throw error;
  });

  await promisify(fs.rmdir)(dirPath);
  return true;
}

export async function listLocalDirectory(dirPath: string) {
  return await promisify(fs.readdir)(dirPath);
}
