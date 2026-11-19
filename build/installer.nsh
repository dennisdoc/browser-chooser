; Makes "URL Router" appear in Windows > Settings > Default apps > Web browser
!macro customInstall
  WriteRegStr HKCU "Software\Classes\URLRouterURL" "" "URL Router URL"
  WriteRegStr HKCU "Software\Classes\URLRouterURL" "URL Protocol" ""
  WriteRegStr HKCU "Software\Classes\URLRouterURL\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME},0"
  WriteRegStr HKCU "Software\Classes\URLRouterURL\shell\open\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\URLRouter" "" "URL Router"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\URLRouter\Capabilities" "ApplicationName" "URL Router"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\URLRouter\Capabilities" "ApplicationDescription" "Routes links to the browser of your choice"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\URLRouter\Capabilities\URLAssociations" "http" "URLRouterURL"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\URLRouter\Capabilities\URLAssociations" "https" "URLRouterURL"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\URLRouter\shell\open\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}"'
  WriteRegStr HKCU "Software\RegisteredApplications" "URLRouter" "Software\Clients\StartMenuInternet\URLRouter\Capabilities"
!macroend
!macro customUnInstall
  DeleteRegKey HKCU "Software\Classes\URLRouterURL"
  DeleteRegKey HKCU "Software\Clients\StartMenuInternet\URLRouter"
  DeleteRegValue HKCU "Software\RegisteredApplications" "URLRouter"
!macroend
