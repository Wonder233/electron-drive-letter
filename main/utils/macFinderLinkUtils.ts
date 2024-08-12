// import path from "path";
// import fs from "fs";
// import { promisify } from "util";
// import { app } from "electron";
// import nodeAddon from "node-addon";
// import { getSyncLinkShowName } from "./windowLeftPaneLinkUtils";
// import {
//   createLocalDir,
//   deleteLocalDir,
//   listLocalDirectory,
// } from "./pathHelper";

// async function getMacLinkPath() {
//   let linkPath = path.join(
//     app.getPath("documents"),
//     `${getSyncLinkShowName("zh-CN")}`
//   );
//   let isExist = await promisify(fs.exists)(linkPath);
//   if (isExist) {
//     console.info("getMacLinkPath zh-CN", linkPath);
//     return linkPath;
//   }
//   linkPath = path.join(
//     app.getPath("documents"),
//     `${getSyncLinkShowName("en-US")}`
//   );
//   isExist = await promisify(fs.exists)(linkPath);
//   if (isExist) {
//     console.info("getMacLinkPath en-US", linkPath);
//     return linkPath;
//   }

//   linkPath = path.join(app.getPath("documents"), `${getSyncLinkShowName()}`);
//   console.info("getMacLinkPath auto", linkPath);
//   return linkPath;
// }

// async function isSameDir(linkPath: string, targetFolderPath: string) {
//   const isExist = await promisify(fs.exists)(linkPath);
//   if (!isExist) {
//     console.info("isSameDir linkPath no exist", linkPath, targetFolderPath);
//     return false;
//   }

//   const linkFileList = await listLocalDirectory(linkPath);
//   const targetFileList = await listLocalDirectory(targetFolderPath);
//   if (linkFileList.length !== targetFileList.length) {
//     console.info("isSameDir size no same", linkPath, targetFolderPath);
//     return false;
//   }
//   let isSame = true;
//   for (let i = 0; i < linkFileList.length; i++) {
//     if (linkFileList[i] !== targetFileList[i]) {
//       isSame = false;
//       console.info(
//         "isSameDir diff",
//         linkFileList[i],
//         targetFileList[i],
//         linkPath,
//         targetFolderPath
//       );
//       break;
//     }

//     const linkFileFilePath = path.join(linkPath, linkFileList[i]);
//     const linkTargePath = await promisify(fs.readlink)(linkFileFilePath);

//     const targetFolderFileFilePath = path.join(
//       targetFolderPath,
//       targetFileList[i]
//     );
//     const targetFolderTargePath = await promisify(fs.readlink)(
//       targetFolderFileFilePath
//     );

//     if (linkTargePath.toLowerCase() !== targetFolderTargePath.toLowerCase()) {
//       isSame = false;
//       console.info(
//         "isSameDir diff",
//         linkTargePath,
//         targetFolderTargePath,
//         linkPath,
//         targetFolderPath
//       );
//       break;
//     }

//     console.info(
//       "isSameDir same",
//       linkFileList[i],
//       targetFileList[i],
//       linkPath,
//       targetFolderPath
//     );
//   }
//   console.info("isSameDir result", isSame, linkPath, targetFolderPath);
//   return isSame;
// }

// async function copyDir(linkPath: string, targetFolderPath: string) {
//   try {
//     await deleteLocalDir(linkPath);
//   } catch (err) {
//     console.error("copyDir error", err, linkPath);
//   }

//   await createLocalDir(linkPath);

//   const targetFileList = await listLocalDirectory(targetFolderPath);
//   await Promise.all(
//     targetFileList.map(async (item) => {
//       const filePath = path.join(targetFolderPath, item);
//       const linkTargePath = await promisify(fs.readlink)(filePath);

//       const newFilePath = path.join(linkPath, item);
//       console.info("copyDir item", linkTargePath, newFilePath);
//       await promisify(fs.symlink)(linkTargePath, newFilePath, "junction");
//     })
//   ).catch((error) => {
//     console.error("copyDir error", error, targetFolderPath, linkPath);
//   });
// }

// export async function addMacFinderLink(targetFolderPath: string) {
//   console.info("addMacFinderLink start", targetFolderPath);
//   const linkPath = await getMacLinkPath();
//   const isSame = await isSameDir(linkPath, targetFolderPath);
//   if (isSame) {
//     console.info("copyDir same Dir", targetFolderPath);
//     return;
//   }
//   const showName = path.basename(linkPath);
//   await copyDir(linkPath, targetFolderPath);
//   nodeAddon.macFinder.removeMacFinderLink(showName);
//   console.info("addMacFinderLink add", linkPath, showName);
//   nodeAddon.macFinder.addMacFinderLink(showName, `file:////${linkPath}`);
// }

// export async function removeMacFinderLink() {
//   console.info("removeMacFinderLink start");
//   const linkPath = await getMacLinkPath();
//   const isExist = await promisify(fs.exists)(linkPath);
//   if (!isExist) {
//     console.info("removeMacFinderLink linkPath no exist", linkPath);
//     return;
//   }

//   await deleteLocalDir(linkPath);
//   const showName = path.basename(linkPath);
//   nodeAddon.macFinder.removeMacFinderLink(showName);
// }
