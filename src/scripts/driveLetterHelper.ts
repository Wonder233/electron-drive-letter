import ipc, { IpcEvents } from "@/scripts/ipc";

export async function addSysSyncEntry() {
  console.log("addSysSyncEntry");
  await ipc.invoke(IpcEvents.INVOKE_OPERATE_MAIN_LISTENER, {
    event: "addSysSyncEntry",
  });
}

export async function removeSysSyncEntry() {
  console.log("removeSysSyncEntry");
  await ipc.invoke(IpcEvents.INVOKE_OPERATE_MAIN_LISTENER, {
    event: "removeSysSyncEntry",
  });
}
