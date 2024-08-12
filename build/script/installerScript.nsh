!include "WinVer.nsh"

!macro customUnInstall
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "com.tencent.cofile"
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved\Run" "com.tencent.cofile"

  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\Desktop\NameSpace\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}"
  DeleteRegKey HKCU "Software\Classes\CLSID\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}"
  DeleteRegKey HKCU "Software\Classes\WOW6432Node\CLSID\{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}"
  WriteRegDword HKCU "SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\HideDesktopIcons\NewStartPanel" "{104B5E4D-3DC4-4868-83B1-80C3CCC500AE}" "0"

  IfFileExists "$PROFILE\Links\${PRODUCT_NAME}同步目录.lnk" 0 +2
    Delete "$PROFILE\Links\${PRODUCT_NAME}同步目录.lnk"

  IfFileExists "$PROFILE\Links\${PRODUCT_NAME} Sync Directory.lnk" 0 +2
    Delete "$PROFILE\Links\${PRODUCT_NAME} Sync Directory.lnk"
!macroend
