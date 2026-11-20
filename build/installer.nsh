; Makes "Browser Chooser" appear in Windows > Settings > Default apps > Web browser
!macro customInstall
  WriteRegStr HKCU "Software\Classes\BrowserChooserURL" "" "Browser Chooser URL"
  WriteRegStr HKCU "Software\Classes\BrowserChooserURL" "URL Protocol" ""
  WriteRegStr HKCU "Software\Classes\BrowserChooserURL\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME},0"
  WriteRegStr HKCU "Software\Classes\BrowserChooserURL\shell\open\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\BrowserChooser" "" "Browser Chooser"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\BrowserChooser\Capabilities" "ApplicationName" "Browser Chooser"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\BrowserChooser\Capabilities" "ApplicationDescription" "Routes links to the browser of your choice"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\BrowserChooser\Capabilities\URLAssociations" "http" "BrowserChooserURL"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\BrowserChooser\Capabilities\URLAssociations" "https" "BrowserChooserURL"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\BrowserChooser\shell\open\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}"'
  WriteRegStr HKCU "Software\RegisteredApplications" "BrowserChooser" "Software\Clients\StartMenuInternet\BrowserChooser\Capabilities"
!macroend
!macro customUnInstall
  DeleteRegKey HKCU "Software\Classes\BrowserChooserURL"
  DeleteRegKey HKCU "Software\Clients\StartMenuInternet\BrowserChooser"
  DeleteRegValue HKCU "Software\RegisteredApplications" "BrowserChooser"
!macroend
