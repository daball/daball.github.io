---
layout: post
title: "Technician Tools Live Drive"
author: daball
date:  2012-11-26 12:38:00
tags: windows node.js
redirect_from: "/2012/11/technician-tools-live-drive.html"
disqus_id: 520606022bbfd30200000003
---
**NOTICE: THE FOLLOWING ARTICLE REPRESENTS A WORK IN PROGRESS. PLEASE BE PATIENT AS I COMPLETE MY RESEARCH AND COMPILE THE RESULTS HERE. IF YOU HAVE ANY COMMENTS TO IMPROVE THE RESEARCH, BE SURE TO LEAVE A COMMENT BELOW. THANKS!**

This article details my concept of the ideal approach for provisioning a "Technician Tools Live Drive" (TM) environment conducive to installing and repairing Windows 2000, Windows XP, Windows Vista, Windows Server 2008, Windows 7, Windows Server 2008 R2, Windows 8, or Windows Server 2012 environments by deploying customized Windows PE images via PXE network, live USB hard disk, or CD/DVD or ISO image. This could theoretically be deployed in many other ways as well, including deployment over the Internet (or through a proxy) or by arbitrarily inserting entries into the BCD store on the local system.

<div id="extended"></div>

The system will access tools stored on the Technician PC (where available) and/or the boot device (where available). The Windows PE system will leverage Node.js to establish a web server interface to administer Windows Setup either locally or remotely. The Windows PE system will then allow the local user to launch a web browser in order to interact with the system. In addition, remote access to the live system will be provided over the web browser. Moreover, when the target system comes up, the Technician PC will launch the web browser connection to the Windows PE system.

## 1 Prerequisites

You will need at least two machines: the Technician PC and the target PC.

On the Technician PC, you will need the following:

* *Operating System:* Windows 8, Windows 7, Windows Server 2012, Windows Server 2008 R2, Windows Vista, or Windows Server 2008
* *Installed:* <a href="http://www.microsoft.com/en-us/download/details.aspx?id=30652" target="_blank">Windows Assessment and Deployment Kit (ADK) for Windows 8</a>
* *Installed:* <a href="http://www.microsoft.com/en-us/download/details.aspx?id=5753" target="_blank">Windows Automated Installation Kit (AIK) for Windows 7</a>
* *Installed:* <a href="http://www.nodejs.org/" target="_blank">Node.js for Windows</a>
* *Installed:* <a href="http://msysgit.github.com/" target="_blank">Github for Windows](http://windows.github.com/) *(recommended)* or [Git for Windows</a>
* *Downloaded:* <a href="http://sourceforge.net/projects/dhcpserver/" target="_blank">Open DHCP Server</a> or your choice of another DHCP server on the network.
* *Downloaded:* <a href="http://sourceforge.net/projects/tftp-server/" target="_blank">Open TFTP Server</a> or your choice of another TFTP server on the network.
* DHCP authorization on the current LAN, or an extra NIC in the Technician PC for a second Ethernet.
* Copies of the all of the installation media that you intend to deploy.

The process detailed here should take the average technician and computer between one and two hours besides the amount of time it takes to burn the ISOs to discs, the time it takes to copy files from the installation media, and the time it takes to copy files onto the USB disk. So the total accumulation of time could take anywhere between one hour and eight hours, depending on the amount of data you are copying and the rate at which you can copy the data.

## 2 Prepare Installation Environment

Run the following commands as **Administrator** at the *Deployment and Imaging Tools Environment* command prompt to prepare the installation environment.

<ol>
<li><p>Set system-level environment variables. You may have to adjust `KitsRoot` to your Windows ADK installation location, but `KitsRoot` should already be provided at the *Deployment and Imaging Tools Environment* command prompt. AIK may have to be adjusted to point to your Windows Automated Installation Kit for Windows 7.</p>

```batch
set KitsRoot=C:\Program Files (x86)\Windows Kits\8.0\
call "%KitsRoot%Assessment and Deployment Kit\Deployment Tools\DandISetEnv.bat"
set AIK=C:\Program Files\Windows AIK
```

</li>
<li><p>Set application environment variables.</p>

```batch
set ADK=%KitsRoot%Assessment and Deployment Kit
set pe4cabsx86=%ADK%\Windows Preinstallation Environment\x86\WinPE_OCs
set pe4cabsamd64=%ADK%\Windows Preinstallation Environment\amd64\WinPE_OCs
set pe3cabsx86=%AIK%\Tools\PETools\x86\WinPE_FPs
set pe3cabsamd64=%AIK%\Tools\PETools\amd64\WinPE_FPs
set pe3cabsia64=%AIK%\Tools\PETools\ia64\WinPE_FPs
```

</li>
</li><p>Set configuration environment variables. You may customize these as you wish. I recommend changing `LiveDrive`, `LiveHostName`, `LiveShareName`, `LiveUserName`, and `LiveUserPassword` to accomodate your environment.</p>

```batch
set LiveTitle=Technician Tools Live Drive
set LiveDrive=C:\LiveDrive
set LiveScripts=%LiveDrive%\scripts
set LiveMedia=%LiveDrive%\media
set LiveTools=%LiveDrive%\tools
set LiveHostName=192.168.1.100
set LiveShareName=LiveDrive
set LiveUserName=LiveDrive
set LiveUserPassword=liveDrive012
set ISORoot=%LiveDrive%\ISOs
set TFTPRoot=%LiveDrive%\TFTPRoot
set USBRoot=%LiveDrive%\USBRoot
```

</li>
<li><p>Set more application environment variables.</p>

```batch
set PE4root=%LiveDrive%\TempPE4
set PE4x86=%PE4root%\x86
set PE4amd64=%PE4root%\amd64
set PE3root=%LiveDrive%\TempPE3
set PE3x86=%PE3root%\x86
set PE3amd64=%PE3root%\amd64
set PE3ia64=%PE3root%\ia64
```

</li>
<li><p>Create project structure, e.g., `C:\LiveDrive`.</p>

```batch
mkdir "%LiveDrive%"
mkdir "%LiveScripts%"
mkdir "%LiveMedia%"
mkdir "%LiveTools%"
mkdir "%PE4root%"
mkdir "%PE3root%"
mkdir "%ISORoot%"
mkdir "%ISORoot%"\x86
mkdir "%ISORoot%"\amd64
mkdir "%ISORoot%"\x86amd64combo
mkdir "%ISORoot%"\ia64
mkdir "%TFTPRoot%"
mkdir "%TFTPRoot%"\Boot
mkdir "%USBRoot%"
mkdir "%USBRoot%"\Boot
mkdir "%USBRoot%"\media
```

</li>
<li><p>Create a new user for accessing the remote file share.</p>

```batch
net user "%LiveUserName%" "%LiveUserPassword%" /ADD
```

</li>
<li><p>Share the `LiveDrive` folder onto the network, with a share name like `LiveDrive`.</p>

```batch
net share "%LiveShareName%"="%LiveDrive%" /GRANT:Everyone,FULL /UNLIMITED
```

</li>
<li><p>Set security permissions for the remote access user on the shared project folder.</p>

```batch
icacls "%LiveDrive%" /grant "%LiveUserName%":F /inheritance:e
```

</li>
</ol>

## 3 Custom Scripts

Proceed using the same *Deployment and Imaging Tools Environment* command prompt as **Administrator** to prepare the startup environment for Windows PE.

### 3.1 Batch file: startnet.cmd

This is a replacement for the 'startnet.cmd' script found inside of a generic Windows PE image. Run these commands to generate the 'startnet.cmd' script.

```batch
echo @echo off>"%LiveScripts%"\startnet.cmd
echo set LiveTitle=%LiveTitle%>>"%LiveScripts%"\startnet.cmd
echo set LiveDriveLetter=L:>>"%LiveScripts%"\startnet.cmd
echo set LiveDrive=LiveDriveLetter\>>"%LiveScripts%"\startnet.cmd
echo set LiveHostName=%LiveHostName%>>"%LiveScripts%"\startnet.cmd
echo set LiveShareName=%LiveShareName%>>"%LiveScripts%"\startnet.cmd
echo set LiveUserName=%LiveUserName%>>"%LiveScripts%"\startnet.cmd
echo set LiveUserPassword=%LiveUserPassword%>>"%LiveScripts%"\startnet.cmd
echo title %LiveTitle%>>"%LiveScripts%"\startnet.cmd
echo echo Initializing network services . . .>>"%LiveScripts%"\startnet.cmd
echo wpeinit>>"%LiveScripts%"\startnet.cmd
echo echo Mounting network drive at %LiveDriveLetter% = \\%LiveHostName%\%LiveShareName% . . .>>"%LiveScripts%"\startnet.cmd
echo net use %LiveDriveLetter% "\\%LiveHostName%\%LiveShareName%" /USER:"%LiveUserName%" "%LiveUserPassword%">>"%LiveScripts%"\startnet.cmd
echo cscript.exe /Nologo bootstrap.js>>"%LiveScripts%"\startnet.cmd
REM DISABLED: echo echo Rebooting . . .>>"%LiveScripts%"\startnet.cmd
REM DISABLED: echo wpeutil reboot>>"%LiveScripts%"\startnet.cmd
```

### 3.2 Script: bootstrap.js

Save this script into `scripts\bootstrap.js`:

```js
var fso = WScript.CreateObject("Scripting.FileSystemObject");
var wshsh = WScript.CreateObject("WScript.Shell");
var env = wshsh.Environment("Process");

//array of objects like { path: string, packages: array, type: string }
var discoveredRepos = function detectRepos () {
var repos = [];
var drives = new Enumerator(fso.Drives);
for (; !drives.atEnd(); drives.moveNext()) {
var drive = drives.item();
if (fso.FolderExists(drive.DriveLetter + ":\\tools")
&& fso.FileExists(drive.DriveLetter + ":\\tools\\repo.json")) {
 var pkgsfile = fso.OpenTextFile(drive.DriveLetter + ":\\tools\\repo.json", ForReading=1);
 var pkgstxt = pkgsfile.ReadAll();
 pkgsfile.Close();
 var repoType = function DriveTypeDesc(typeCode) {
  switch (typeCode) {
   case 1: return "Removable";
   case 2: return "Fixed";
   case 3: return "Network";
   case 4: return "CD-ROM";
   case 5: return "RAM Disk";
   default:return "Unknown";
  }
  }(drive.DriveType);
  repos[repos.length] = { path: drive.DriveLetter + ":\\tools\\", packages: eval(pkgstxt), type: repoType };
 }
}
}
}();

livedrive = function () {
var drives = new Enumerator(fso.Drives);
for (; !drives.atEnd(); drives.moveNext()) {
 var drive = drives.item();
 if (fso.FolderExists(drive.DriveLetter + ":\\scripts")) {
  return drive.DriveLetter + ":\\";
 }
}
WScript.StdOut.WriteLine(
 "WARNING: Could not locate scripts folder on the Technician Tools Live Drive.\n" +
 "     Tools will probably be unavailable for this session.\n");
 return "";
}();

var SystemRoot = env("SystemRoot");

/*WScript.Echo("Live Drive found at " + livedrive + ".\nDeploying current version of toolkit to " + windows + " . . .");

var fso = WScript.CreateObject("Scripting.FileSystemObject")
, folder = fso.GetFolder(livedrive + "scripts")
, files = new Enumerator(folder.Files);

for (; !files.atEnd(); files.moveNext()) {
var file = files.item();
WScript.Echo("Copying " + file.Path + " to " + SystemRoot + "\\System32\\" + file.Name);
fso.CopyFile(file.Path, SystemRoot + "\\System32\\" + file.Name);
}*/
```

### 3.3 Node.JS: Acquire web root

You will need to download the following ZIP file and expand it to the `%LiveDrive%\scripts\liveserver` folder.

## 4 Prepare Windows PE 4

Proceed using the same *Deployment and Imaging Tools Environment* command prompt as **Administrator** to prepare the startup environment for Windows PE.

### 4.1 Prepare x86 Image

Create a new Windows PE 4 image for x86.

```batch
copype.cmd x86 "%PE4x86%"
```

Mount the new x86 Windows PE 4 image.

```batch
imagex /mountrw "%PE4x86%"\media\sources\boot.wim 1 "%PE4x86%"\mount
```

Add packages to Windows PE 4 x86 image.

```batch
dism /image:"%PE4x86%"\mount /Add-Package /PackagePath:"%pe4cabsx86%\WinPE-WMI.cab"
dism /image:"%PE4x86%"\mount /Add-Package /PackagePath:"%pe4cabsx86%\WinPE-SecureStartup.cab"
dism /image:"%PE4x86%"\mount /Add-Package /PackagePath:"%pe4cabsx86%\WinPE-NetFx4.cab"
dism /image:"%PE4x86%"\mount /Add-Package /PackagePath:"%pe4cabsx86%\WinPE-Scripting.cab"
dism /image:"%PE4x86%"\mount /Add-Package /PackagePath:"%pe4cabsx86%\WinPE-HTA.cab"
dism /image:"%PE4x86%"\mount /Add-Package /PackagePath:"%pe4cabsx86%\WinPE-PowerShell3.cab"
dism /image:"%PE4x86%"\mount /Add-Package /PackagePath:"%pe4cabsx86%\WinPE-EnhancedStorage.cab"
dism /image:"%PE4x86%"\mount /Add-Package /PackagePath:"%pe4cabsx86%\WinPE-DismCmdlets.cab"
dism /image:"%PE4x86%"\mount /Add-Package /PackagePath:"%pe4cabsx86%\WinPE-StorageWMI.cab"
imagex /commit "%PE4x86%"\mount
```

Install custom scripts into Windows PE 4 x86 image.

```batch
copy /Y "%LiveScripts%"\startnet.cmd "%PE4x86%"\mount\Windows\System32
copy /Y "%LiveScripts%"\bootstrap.js "%PE4x86%"\mount\Windows\System32
imagex /commit "%PE4x86%"\mount
```

### 4.2 Prepare amd64 Image

Create Windows PE 4 image for amd64.

```batch
copype.cmd amd64 "%PE4amd64%"
```

Mount the new amd64 Windows PE 4 image.

```batch
imagex /mountrw "%PE4amd64%"\media\sources\boot.wim 1 "%PE4amd64%"\mount
```

Add packages to Windows PE 4 amd64 image.

```batch
dism /image:"%PE4amd64%"\mount /Add-Package /PackagePath:"%pe4cabsamd64%\WinPE-WMI.cab"
dism /image:"%PE4amd64%"\mount /Add-Package /PackagePath:"%pe4cabsamd64%\WinPE-SecureStartup.cab"
dism /image:"%PE4amd64%"\mount /Add-Package /PackagePath:"%pe4cabsamd64%\WinPE-NetFx4.cab"
dism /image:"%PE4amd64%"\mount /Add-Package /PackagePath:"%pe4cabsamd64%\WinPE-Scripting.cab"
dism /image:"%PE4amd64%"\mount /Add-Package /PackagePath:"%pe4cabsamd64%\WinPE-HTA.cab"
dism /image:"%PE4amd64%"\mount /Add-Package /PackagePath:"%pe4cabsamd64%\WinPE-PowerShell3.cab"
dism /image:"%PE4amd64%"\mount /Add-Package /PackagePath:"%pe4cabsamd64%\WinPE-EnhancedStorage.cab"
dism /image:"%PE4amd64%"\mount /Add-Package /PackagePath:"%pe4cabsamd64%\WinPE-DismCmdlets.cab"
dism /image:"%PE4amd64%"\mount /Add-Package /PackagePath:"%pe4cabsamd64%\WinPE-StorageWMI.cab"
imagex /commit "%PE4amd64%"\mount
```

Install custom scripts into Windows PE 4 amd64 image.

```batch
copy /Y "%LiveScripts%"\startnet.cmd "%PE4amd64%"\mount\Windows\System32
copy /Y "%LiveScripts%"\bootstrap.js "%PE4amd64%"\mount\Windows\System32
imagex /commit "%PE4amd64%"\mount
```

### 4.3 Assemble Windows PE 4 for ISO/USB/TFTP Boot

Copy files needed for x86 ISO boot.

```batch
xcopy /S /Y "%PE4x86%"\media\*.* "%ISORoot%"\x86
ren "%ISORoot%"\x86\sources\boot.wim bootpe4x86.wim
```

Copy files needed for amd64 ISO boot.

```batch
xcopy /S /Y "%PE4x86%"\media\*.* "%USBRoot%"
del "%USBRoot%"\sources\boot.wim
```

Deploy both images to USB root.

```batch
copy /Y "%PE4x86%"\media\sources\boot.wim "%USBRoot%"\sources\bootpe4x86.wim
copy /Y "%PE4amd64%"\media\sources\boot.wim "%USBRoot%"\sources\bootpe4amd64.wim
```

Copy files needed for PXE boot.

```batch
xcopy /S /Y "%PE4x86%"\media\*.* "%TFTPRoot%"
copy /Y "%PE4x86%"\mount\Windows\Boot\PXE\*.* "%TFTPRoot%"\Boot
del /Q "%TFTPRoot%"\sources\boot*.wim
```

Deploy both images to TFTP root.

```batch
copy /Y "%PE4x86%"\media\sources\boot.wim "%TFTPRoot%"\sources\bootpe4x86.wim
copy /Y "%PE4amd64%"\media\sources\boot.wim "%TFTPRoot%"\sources\bootpe4amd64.wim
```

*Optional:* Usability Hack: Remove the press F12 for Network Servicing prompt.

```batch
ren "%TFTPRoot%"\Boot\pxeboot.com pxeboot.com.disabled
copy /Y "%TFTPRoot%"\Boot\pxeboot.n12 "%TFTPRoot%"\Boot\pxeboot.com
```

### 4.4 Unmount Windows PE 4 images

Unmount both images.

```batch
imagex /unmount "%PE4x86%"\mount
imagex /unmount "%PE4amd64%"\mount
```

### 4.5 Prepare BCD Stores

Edit boot configuration database (BCD) store for x86 ISO container.

```batch
bcdedit /store "%ISORoot%"\x86\Boot\BCD /set {bootmgr} displaybootmenu true
bcdedit /store "%ISORoot%"\x86\Boot\BCD /create {ramdiskoptions} /d "%LiveTitle% - Windows PE 4 CD (x86)"
bcdedit /store "%ISORoot%"\x86\Boot\BCD /set {ramdiskoptions} ramdisksdidevice boot
bcdedit /store "%ISORoot%"\x86\Boot\BCD /set {ramdiskoptions} ramdisksdipath \boot\boot.sdi
bcdedit /store "%ISORoot%"\x86\Boot\BCD /set {default} description "%LiveTitle% - Windows PE 4 CD (x86)"
bcdedit /store "%ISORoot%"\x86\Boot\BCD /set {default} osdevice ramdisk=[boot]\sources\bootpe4x86.wim,{ramdiskoptions}
bcdedit /store "%ISORoot%"\x86\Boot\BCD /set {default} device ramdisk=[boot]\sources\bootpe4x86.wim,{ramdiskoptions}
```

Edit boot configuration database (BCD) store for amd64 ISO container.

```batch
bcdedit /store "%ISORoot%"\amd64\Boot\BCD /set {bootmgr} displaybootmenu true
bcdedit /store "%ISORoot%"\amd64\Boot\BCD /create {ramdiskoptions} /d "%LiveTitle% - Windows PE 4 CD (amd64)"
bcdedit /store "%ISORoot%"\amd64\Boot\BCD /set {ramdiskoptions} ramdisksdidevice boot
bcdedit /store "%ISORoot%"\amd64\Boot\BCD /set {ramdiskoptions} ramdisksdipath \boot\boot.sdi
bcdedit /store "%ISORoot%"\amd64\Boot\BCD /set {default} description "%LiveTitle% - Windows PE 4 CD (amd64)"
bcdedit /store "%ISORoot%"\amd64\Boot\BCD /set {default} osdevice ramdisk=[boot]\sources\bootpe4amd64.wim,{ramdiskoptions}
bcdedit /store "%ISORoot%"\amd64\Boot\BCD /set {default} device ramdisk=[boot]\sources\bootpe4amd64.wim,{ramdiskoptions}
```

Edit boot configuration database (BCD) store for USB container.

```batch
bcdedit /store "%USBRoot%"\Boot\BCD /set {bootmgr} displaybootmenu true
bcdedit /store "%USBRoot%"\Boot\BCD /create {ramdiskoptions} /d "%LiveTitle% - Windows PE 4 USB (amd64)"
bcdedit /store "%USBRoot%"\Boot\BCD /set {ramdiskoptions} ramdisksdidevice boot
bcdedit /store "%USBRoot%"\Boot\BCD /set {ramdiskoptions} ramdisksdipath \boot\boot.sdi
bcdedit /store "%USBRoot%"\Boot\BCD /set {default} description "%LiveTitle% - Windows PE 4 USB (amd64)"
bcdedit /store "%USBRoot%"\Boot\BCD /set {default} osdevice ramdisk=[boot]\sources\bootpe4amd64.wim,{ramdiskoptions}
bcdedit /store "%USBRoot%"\Boot\BCD /set {default} device ramdisk=[boot]\sources\bootpe4amd64.wim,{ramdiskoptions}
for /F "tokens=7 delims=. " %1 in ('bcdedit /store "%USBRoot%"\Boot\BCD /copy {ramdiskoptions} /d "%LiveTitle% - Windows PE 4 USB (x86)"') do set ramdisk=%1
for /F "tokens=7 delims=. " %1 in ('bcdedit /store "%USBRoot%"\Boot\BCD /copy {default} /d "%LiveTitle% - Windows PE 4 USB (x86)"') do set entry=%1
bcdedit /store "%USBRoot%"\Boot\BCD /set %entry% osdevice ramdisk=[boot]\sources\bootpe4x86.wim,%ramdisk%
bcdedit /store "%USBRoot%"\Boot\BCD /set %entry% device ramdisk=[boot]\sources\bootpe4x86.wim,%ramdisk%
bcdedit /store "%USBRoot%"\Boot\BCD /displayorder %entry% /addlast
```

Build boot configuration database (BCD) store for PXE boot.

```batch
bcdedit /store "%TFTPRoot%"\Boot\BCD /set {bootmgr} displaybootmenu true
bcdedit /store "%TFTPRoot%"\Boot\BCD /create {ramdiskoptions} /d "%LiveTitle% - Windows PE 4 PXE (amd64)"
bcdedit /store "%TFTPRoot%"\Boot\BCD /set {ramdiskoptions} ramdisksdidevice boot
bcdedit /store "%TFTPRoot%"\Boot\BCD /set {ramdiskoptions} ramdisksdipath \boot\boot.sdi
bcdedit /store "%TFTPRoot%"\Boot\BCD /set {default} description "%LiveTitle% - Windows PE 4 PXE (amd64)"
bcdedit /store "%TFTPRoot%"\Boot\BCD /set {default} osdevice ramdisk=[boot]\sources\bootpe4amd64.wim,{ramdiskoptions}
bcdedit /store "%TFTPRoot%"\Boot\BCD /set {default} device ramdisk=[boot]\sources\bootpe4amd64.wim,{ramdiskoptions}
for /F "tokens=7 delims=. " %1 in ('bcdedit /store "%TFTPRoot%"\Boot\BCD /copy {ramdiskoptions} /d "%LiveTitle% - Windows PE 4 PXE (x86)"') do set ramdisk=%1
for /F "tokens=7 delims=. " %1 in ('bcdedit /store "%TFTPRoot%"\Boot\BCD /copy {default} /d "%LiveTitle% - Windows PE 4 PXE (x86)"') do set entry=%1
bcdedit /store "%TFTPRoot%"\Boot\BCD /set %entry% osdevice ramdisk=[boot]\sources\bootpe4x86.wim,%ramdisk%
bcdedit /store "%TFTPRoot%"\Boot\BCD /set %entry% device ramdisk=[boot]\sources\bootpe4x86.wim,%ramdisk%
bcdedit /store "%TFTPRoot%"\Boot\BCD /displayorder %entry% /addlast
```

## 5 Prepare Windows PE 3

Proceed using the same *Deployment and Imaging Tools Environment* command prompt as **Administrator** to prepare the startup environment for Windows PE.

### 5.1 Import Windows AIK Environment

By importing the Windows AIK environment, we ensure that the tools that are being used are from the AIK and not the ADK.

```batch
call "%AIK%"\Tools\PETools\pesetenv.cmd
```

### 5.2 Prepare x86 Image

Create a new Windows PE 3 image for x86.

```batch
copype.cmd x86 "%PE3x86%"
```

Mount the new x86 Windows PE 3 image.

```batch
imagex /mountrw "%PE3x86%"\winpe.wim 1 "%PE3x86%"\mount
```

Add packages to Windows PE 3 x86 image.

```batch
dism /image:"%PE3x86%"\mount /Add-Package /PackagePath:"%pe3cabsx86%\winpe-wmi.cab"
dism /image:"%PE3x86%"\mount /Add-Package /PackagePath:"%pe3cabsx86%\winpe-scripting.cab"
dism /image:"%PE3x86%"\mount /Add-Package /PackagePath:"%pe3cabsx86%\winpe-hta.cab"
imagex /commit "%PE3x86%"\mount
```

Install custom scripts into Windows PE 3 x86 image.

```batch
copy /Y "%LiveScripts%"\startnet.cmd "%PE3x86%"\mount\Windows\System32
copy /Y "%LiveScripts%"\bootstrap.js "%PE3x86%"\mount\Windows\System32
imagex /commit "%PE3x86%"\mount
```

### 5.3 Prepare amd64 Image

Create a new Windows PE 3 image for amd64.

```batch
copype.cmd amd64 "%PE3amd64%"
```

Mount the new amd64 Windows PE 3 image.

```batch
imagex /mountrw "%PE3amd64%"\winpe.wim 1 "%PE3amd64%"\mount
```

Add packages to Windows PE 3 amd64 image.

```batch
dism /image:"%PE3amd64%"\mount /Add-Package /PackagePath:"%pe3cabsamd64%\winpe-wmi.cab"
dism /image:"%PE3amd64%"\mount /Add-Package /PackagePath:"%pe3cabsamd64%\winpe-scripting.cab"
dism /image:"%PE3amd64%"\mount /Add-Package /PackagePath:"%pe3cabsamd64%\winpe-hta.cab"
imagex /commit "%PE3amd64%"\mount
```

Install custom scripts into Windows PE 3 amd64 image.

```batch
copy /Y "%LiveScripts%"\startnet.cmd "%PE3amd64%"\mount\Windows\System32
copy /Y "%LiveScripts%"\bootstrap.js "%PE3amd64%"\mount\Windows\System32
imagex /commit "%PE3amd64%"\mount
```

### 5.4 Prepare ia64 Image

Create a new Windows PE 3 image for ia64.

```batch
copype.cmd ia64 "%PE3ia64%"
```

Mount the new ia64 Windows PE 3 image.

```batch
imagex /mountrw "%PE3ia64%"\winpe.wim 1 "%PE3ia64%"\mount
```

Add packages to Windows PE 3 ia64 image.

```batch
dism /image:"%PE3ia64%"\mount /Add-Package /PackagePath:"%pe3cabsia64%\winpe-wmi.cab"
dism /image:"%PE3ia64%"\mount /Add-Package /PackagePath:"%pe3cabsia64%\winpe-scripting.cab"
dism /image:"%PE3ia64%"\mount /Add-Package /PackagePath:"%pe3cabsia64%\winpe-hta.cab"
imagex /commit "%PE3ia64%"\mount
```

Install custom scripts into Windows PE 3 ia64 image.

```batch
copy /Y "%LiveScripts%"\startnet.cmd "%PE3ia64%"\mount\Windows\System32
copy /Y "%LiveScripts%"\bootstrap.js "%PE3ia64%"\mount\Windows\System32
imagex /commit "%PE3ia64%"\mount
```

### 5.5 Assemble Windows PE 3 for ISO/USB/TFTP Boot

Copy files needed for x86 ISO boot.

```batch
copy /Y "%PE3x86%"\winpe.wim "%ISORoot%"\x86\sources\bootpe3x86.wim
```

Copy files needed for amd64 ISO boot.

```batch
copy /Y "%PE3amd64%"\winpe.wim "%ISORoot%"\amd64\sources\bootpe3amd64.wim
```

Copy files needed for ia64 ISO boot.

```batch
xcopy /E /Y "%PE3ia64%"\ISO\*.* "%ISORoot%"\ia64
copy /Y "%PE3ia64%"\winpe.wim "%ISORoot%"\ia64\sources\boot.wim
```

Copy files needed for USB boot.

```batch
copy /Y "%PE3x86%"\winpe.wim "%USBRoot%"\sources\bootpe3x86.wim
copy /Y "%PE3amd64%"\winpe.wim "%USBRoot%"\sources\bootpe3amd64.wim
copy /Y "%PE3ia64%"\winpe.wim "%USBRoot%"\sources\bootpe3ia64.wim
```

Deploy all images to TFTP root.

```batch
copy /Y "%PE3x86%"\winpe.wim "%TFTPRoot%"\sources\bootpe3x86.wim
copy /Y "%PE3amd64%"\winpe.wim "%TFTPRoot%"\sources\bootpe3amd64.wim
copy /Y "%PE3ia64%"\winpe.wim "%TFTPRoot%"\sources\bootpe3ia64.wim
```

### 5.6 Unmount Windows PE 3 images

Unmount all images.

```batch
imagex /unmount "%PE3x86%"\mount
imagex /unmount "%PE3amd64%"\mount
imagex /unmount "%PE3ia64%"\mount
```

### 5.7 Update BCD Stores

Edit boot configuration database (BCD) store for x86 ISO container.

```batch
for /F "tokens=7 delims=. " %1 in ('bcdedit /store "%ISORoot%"\x86\Boot\BCD /copy {ramdiskoptions} /d "%LiveTitle% - Windows PE 3 CD (x86)"') do set ramdisk=%1
for /F "tokens=7 delims=. " %1 in ('bcdedit /store "%ISORoot%"\x86\Boot\BCD /copy {default} /d "%LiveTitle% - Windows PE 3 CD (x86)"') do set entry=%1
bcdedit /store "%ISORoot%"\x86\Boot\BCD /set %entry% osdevice ramdisk=[boot]\sources\bootpe3x86.wim,%ramdisk%
bcdedit /store "%ISORoot%"\x86\Boot\BCD /set %entry% device ramdisk=[boot]\sources\bootpe3x86.wim,%ramdisk%
bcdedit /store "%ISORoot%"\x86\Boot\BCD /displayorder %entry% /addlast
```

Edit boot configuration database (BCD) store for amd64 ISO container.

```batch
for /F "tokens=7 delims=. " %1 in ('bcdedit /store "%ISORoot%"\amd64\Boot\BCD /copy {ramdiskoptions} /d "%LiveTitle% - Windows PE 3 CD (amd64)"') do set ramdisk=%1
for /F "tokens=7 delims=. " %1 in ('bcdedit /store "%ISORoot%"\amd64\Boot\BCD /copy {default} /d "%LiveTitle% - Windows PE 3 CD (amd64)"') do set entry=%1
bcdedit /store "%ISORoot%"\amd64\Boot\BCD /set %entry% osdevice ramdisk=[boot]\sources\bootpe3amd64.wim,%ramdisk%
bcdedit /store "%ISORoot%"\amd64\Boot\BCD /set %entry% device ramdisk=[boot]\sources\bootpe3amd64.wim,%ramdisk%
bcdedit /store "%ISORoot%"\amd64\Boot\BCD /displayorder %entry% /addlast
```

Edit boot configuration database (BCD) store for ia64 ISO container.

```batch
bcdedit /store "%ISORoot%"\ia64\EFI\Microsoft\Boot\BCD /create {ramdiskoptions} /d "%LiveTitle% - Windows PE 3 CD (ia64)"
bcdedit /store "%ISORoot%"\ia64\EFI\Microsoft\Boot\BCD /set {ramdiskoptions} ramdisksdidevice boot
bcdedit /store "%ISORoot%"\ia64\EFI\Microsoft\Boot\BCD /set {ramdiskoptions} ramdisksdipath \boot\boot.sdi
bcdedit /store "%ISORoot%"\ia64\EFI\Microsoft\Boot\BCD /set {default} description "%LiveTitle% - Windows PE 3 CD (ia64)"
bcdedit /store "%ISORoot%"\ia64\EFI\Microsoft\Boot\BCD /set {default} osdevice ramdisk=[boot]\sources\boot.wim,{ramdiskoptions}
bcdedit /store "%ISORoot%"\ia64\EFI\Microsoft\Boot\BCD /set {default} device ramdisk=[boot]\sources\boot.wim,{ramdiskoptions}
```

Integrate Windows PE 3 into existing boot configuration database (BCD) store for USB boot.

```batch
bcdedit /store "%USBRoot%"\Boot\BCD /set {bootmgr} displaybootmenu true
for /F "tokens=7 delims=. " %1 in ('bcdedit /store "%USBRoot%"\Boot\BCD /copy {ramdiskoptions} /d "%LiveTitle% - Windows PE 3 USB (amd64)"') do set ramdisk=%1
for /F "tokens=7 delims=. " %1 in ('bcdedit /store "%USBRoot%"\Boot\BCD /copy {default} /d "%LiveTitle% - Windows PE 3 USB (amd64)"') do set entry=%1
bcdedit /store "%USBRoot%"\Boot\BCD /set %entry% osdevice ramdisk=[boot]\sources\bootpe3amd64.wim,%ramdisk%
bcdedit /store "%USBRoot%"\Boot\BCD /set %entry% device ramdisk=[boot]\sources\bootpe3amd64.wim,%ramdisk%
bcdedit /store "%USBRoot%"\Boot\BCD /displayorder %entry% /addlast
for /F "tokens=7 delims=. " %1 in ('bcdedit /store "%USBRoot%"\Boot\BCD /copy {ramdiskoptions} /d "%LiveTitle% - Windows PE 3 USB (ia64)"') do set ramdisk=%1
for /F "tokens=7 delims=. " %1 in ('bcdedit /store "%USBRoot%"\Boot\BCD /copy {default} /d "%LiveTitle% - Windows PE 3 USB (ia64)"') do set entry=%1
bcdedit /store "%USBRoot%"\Boot\BCD /set %entry% osdevice ramdisk=[boot]\sources\bootpe3ia64.wim,%ramdisk%
bcdedit /store "%USBRoot%"\Boot\BCD /set %entry% device ramdisk=[boot]\sources\bootpe3ia64.wim,%ramdisk%
bcdedit /store "%USBRoot%"\Boot\BCD /displayorder %entry% /addlast
for /F "tokens=7 delims=. " %1 in ('bcdedit /store "%USBRoot%"\Boot\BCD /copy {ramdiskoptions} /d "%LiveTitle% - Windows PE 3 USB (x86)"') do set ramdisk=%1
for /F "tokens=7 delims=. " %1 in ('bcdedit /store "%USBRoot%"\Boot\BCD /copy {default} /d "%LiveTitle% - Windows PE 3 USB (x86)"') do set entry=%1
bcdedit /store "%USBRoot%"\Boot\BCD /set %entry% osdevice ramdisk=[boot]\sources\bootpe3x86.wim,%ramdisk%
bcdedit /store "%USBRoot%"\Boot\BCD /set %entry% device ramdisk=[boot]\sources\bootpe3x86.wim,%ramdisk%
bcdedit /store "%USBRoot%"\Boot\BCD /displayorder %entry% /addlast
```

Integrate Windows PE 3 into existing boot configuration database (BCD) store for PXE boot.

```batch
bcdedit /store "%TFTPRoot%"\Boot\BCD /set {bootmgr} displaybootmenu true
for /F "tokens=7 delims=. " %1 in ('bcdedit /store "%TFTPRoot%"\Boot\BCD /copy {ramdiskoptions} /d "%LiveTitle% - Windows PE 3 PXE (amd64)"') do set ramdisk=%1
for /F "tokens=7 delims=. " %1 in ('bcdedit /store "%TFTPRoot%"\Boot\BCD /copy {default} /d "%LiveTitle% - Windows PE 3 PXE (amd64)"') do set entry=%1
bcdedit /store "%TFTPRoot%"\Boot\BCD /set %entry% osdevice ramdisk=[boot]\sources\bootpe3amd64.wim,%ramdisk%
bcdedit /store "%TFTPRoot%"\Boot\BCD /set %entry% device ramdisk=[boot]\sources\bootpe3amd64.wim,%ramdisk%
bcdedit /store "%TFTPRoot%"\Boot\BCD /displayorder %entry% /addlast
for /F "tokens=7 delims=. " %1 in ('bcdedit /store "%TFTPRoot%"\Boot\BCD /copy {ramdiskoptions} /d "%LiveTitle% - Windows PE 3 PXE (ia64)"') do set ramdisk=%1
for /F "tokens=7 delims=. " %1 in ('bcdedit /store "%TFTPRoot%"\Boot\BCD /copy {default} /d "%LiveTitle% - Windows PE 3 PXE (ia64)"') do set entry=%1
bcdedit /store "%TFTPRoot%"\Boot\BCD /set %entry% osdevice ramdisk=[boot]\sources\bootpe3ia64.wim,%ramdisk%
bcdedit /store "%TFTPRoot%"\Boot\BCD /set %entry% device ramdisk=[boot]\sources\bootpe3ia64.wim,%ramdisk%
bcdedit /store "%TFTPRoot%"\Boot\BCD /displayorder %entry% /addlast
for /F "tokens=7 delims=. " %1 in ('bcdedit /store "%TFTPRoot%"\Boot\BCD /copy {ramdiskoptions} /d "%LiveTitle% - Windows PE 3 PXE (x86)"') do set ramdisk=%1
for /F "tokens=7 delims=. " %1 in ('bcdedit /store "%TFTPRoot%"\Boot\BCD /copy {default} /d "%LiveTitle% - Windows PE 3 PXE (x86)"') do set entry=%1
bcdedit /store "%TFTPRoot%"\Boot\BCD /set %entry% osdevice ramdisk=[boot]\sources\bootpe3x86.wim,%ramdisk%
bcdedit /store "%TFTPRoot%"\Boot\BCD /set %entry% device ramdisk=[boot]\sources\bootpe3x86.wim,%ramdisk%
bcdedit /store "%TFTPRoot%"\Boot\BCD /displayorder %entry% /addlast
```

## 6 Deploy Windows PE Media

### 6.1 Generate x86 ISO Image

Generate x86 image file.

```batch
oscdimg -n -m -o -b"%PE4x86%"\fwfiles\etfsboot.com "%ISORoot%"\x86 "%ISORoot%"\x86.iso
```

### 6.2 Generate amd64 ISO Image

Generate amd64 image file.

```batch
oscdimg -n -m -o -b"%PE4amd64%"\fwfiles\etfsboot.com "%ISORoot%"\amd64 "%ISORoot%"\amd64.iso
```

### 6.3 Generate ia64 ISO Image

Generate ia64 image file.

```batch
oscdimg -n -m -o -b"%PE3ia64%"\efisys.bin "%ISORoot%"\ia64 "%ISORoot%"\ia64.iso
```

### 6.4 Generate x86/amd64 Combination ISO Image

Gather all the files needed.

```batch
xcopy /S /Y "%ISORoot%"\x86\*.* "%ISORoot%"\x86amd64combo
copy /Y "%ISORoot%"\amd64\sources\*.* "%ISORoot%"\x86amd64combo\sources
copy /Y "%ISORoot%"\amd64\sources\*.* "%ISORoot%"\x86amd64combo\sources
copy /Y "%PE4amd64%"\media\Boot\BCD %ISORoot%"\x86amd64combo\Boot
```

Edit boot configuration database (BCD) store for x86/amd64 combined ISO container.

```batch
bcdedit /store "%ISORoot%"\x86amd64combo\Boot\BCD /set {bootmgr} displaybootmenu true
bcdedit /store "%ISORoot%"\x86amd64combo\Boot\BCD /create {ramdiskoptions} /d "%LiveTitle% - Windows PE 4 DVD (amd64)"
bcdedit /store "%ISORoot%"\x86amd64combo\Boot\BCD /set {ramdiskoptions} ramdisksdidevice boot
bcdedit /store "%ISORoot%"\x86amd64combo\Boot\BCD /set {ramdiskoptions} ramdisksdipath \boot\boot.sdi
bcdedit /store "%ISORoot%"\x86amd64combo\Boot\BCD /set {default} description "%LiveTitle% - Windows PE 4 DVD (amd64)"
bcdedit /store "%ISORoot%"\x86amd64combo\Boot\BCD /set {default} osdevice ramdisk=[boot]\sources\bootpe4amd64.wim,{ramdiskoptions}
bcdedit /store "%ISORoot%"\x86amd64combo\Boot\BCD /set {default} device ramdisk=[boot]\sources\bootpe4amd64.wim,{ramdiskoptions}
for /F "tokens=7 delims=. " %1 in ('bcdedit /store "%ISORoot%"\x86amd64combo\Boot\BCD /copy {ramdiskoptions} /d "%LiveTitle% - Windows PE 4 DVD (x86)"') do set ramdisk=%1
for /F "tokens=7 delims=. " %1 in ('bcdedit /store "%ISORoot%"\x86amd64combo\Boot\BCD /copy {default} /d "%LiveTitle% - Windows PE 4 DVD (x86)"') do set entry=%1
bcdedit /store "%ISORoot%"\x86amd64combo\Boot\BCD /set %entry% osdevice ramdisk=[boot]\sources\bootpe4x86.wim,%ramdisk%
bcdedit /store "%ISORoot%"\x86amd64combo\Boot\BCD /set %entry% device ramdisk=[boot]\sources\bootpe4x86.wim,%ramdisk%
bcdedit /store "%ISORoot%"\x86amd64combo\Boot\BCD /displayorder %entry% /addlast
for /F "tokens=7 delims=. " %1 in ('bcdedit /store "%ISORoot%"\x86amd64combo\Boot\BCD /copy {ramdiskoptions} /d "%LiveTitle% - Windows PE 3 DVD (amd64)"') do set ramdisk=%1
for /F "tokens=7 delims=. " %1 in ('bcdedit /store "%ISORoot%"\x86amd64combo\Boot\BCD /copy {default} /d "%LiveTitle% - Windows PE 3 DVD (amd64)"') do set entry=%1
bcdedit /store "%ISORoot%"\x86amd64combo\Boot\BCD /set %entry% osdevice ramdisk=[boot]\sources\bootpe3amd64.wim,%ramdisk%
bcdedit /store "%ISORoot%"\x86amd64combo\Boot\BCD /set %entry% device ramdisk=[boot]\sources\bootpe3amd64.wim,%ramdisk%
bcdedit /store "%ISORoot%"\x86amd64combo\Boot\BCD /displayorder %entry% /addlast
for /F "tokens=7 delims=. " %1 in ('bcdedit /store "%ISORoot%"\x86amd64combo\Boot\BCD /copy {ramdiskoptions} /d "%LiveTitle% - Windows PE 3 DVD (x86)"') do set ramdisk=%1
for /F "tokens=7 delims=. " %1 in ('bcdedit /store "%ISORoot%"\x86amd64combo\Boot\BCD /copy {default} /d "%LiveTitle% - Windows PE 3 DVD (x86)"') do set entry=%1
bcdedit /store "%ISORoot%"\x86amd64combo\Boot\BCD /set %entry% osdevice ramdisk=[boot]\sources\bootpe3x86.wim,%ramdisk%
bcdedit /store "%ISORoot%"\x86amd64combo\Boot\BCD /set %entry% device ramdisk=[boot]\sources\bootpe3x86.wim,%ramdisk%
bcdedit /store "%ISORoot%"\x86amd64combo\Boot\BCD /displayorder %entry% /addlast
```

Generate x86/amd64 image file.

```batch
oscdimg -n -m -o -b"%PE4x86%"\fwfiles\etfsboot.com "%ISORoot%"\x86amd64combo "%ISORoot%"\x86amd64combo.iso
```

### 6.5 Clean up

*Optional:* Remove temporary build environments.

```batch
rmdir /S /Q "%PE4x86%"
rmdir /S /Q "%PE4amd64%"

rmdir /S /Q "%PE3x86%"
rmdir /S /Q "%PE3amd64%"
rmdir /S /Q "%PE3ia64%"

rmdir /S /Q "%ISORoot%"\x86
rmdir /S /Q "%ISORoot%"\amd64
rmdir /S /Q "%ISORoot%"\ia64
rmdir /S /Q "%ISORoot%"\x86amd64combo
```

### 6.6 Copy Your Installation Media

Copy all of your installation media into folders/subfolders inside the `%LiveDrive%\media` folder. The scripts provided earlier will automatically detect the available installation media and provide an interface to launch whichever Windows Setup instances are valid for the given Windows PE session that is booted.

**NOTICE: The scripts do not currently do this. It is a planned feature for the next release of this article.**

### 6.7 Prepare Installation Media for USB Deployment

Now that all of the installation files are tucked away safely inside of `%LiveDrive%\media`, you can adjust the contents of the `%USBRoot%\media` folder as well. You can either copy them directly or create links as I have done.

```batch
for %f in ("%LiveMedia%"\*) do mklink "%USBRoot%\media\%~nf" "%f"
for /d %d in ("%LiveMedia%"\*) do mklink /d "%USBRoot%\media\%~nd" "%d"
```

### 6.8 Deploy USB Root to USB Drive

You will need a USB drive formatted to FAT32 or NTFS (recommended). If it was not formatted in Windows Vista or higher, you may use `bootsect.exe` to update the master boot record and partition record so that it is using the BOOTMGR boot code. The syntax is as follows:

```batch
bootsect /nt60 <USBDriveLetter>: /mbr
```

Replace `<USBDriveLetter>` with the drive letter of your USB drive. Run `bootsect /help` for further information.

Then just copy the contents of your `%USBRoot%` folder to your USB drive's root directory.

```batch
xcopy /E /Y %USBRoot% <USBDriveLetter>:\
```

Replace `<USBDriveLetter>` with the drive letter of your USB drive.

## 7 Setup Technician PC Services

I have chosen to use Open DHCP Server and Open TFTP Server for this portion of the setup. You may use what you want, but this is the configuration I chose because my Technician PC is also a workstation PC.

### 7.1 TFTP Server Setup

Setup Open TFTP Server.

Backup `C:\OpenTFTPServer\OpenTFTPServerMT.ini`.

```batch
copy "C:\OpenTFTPServer\OpenTFTPServerMT.ini" "C:\OpenTFTPServer\OpenTFTPServerMT.ini.original"
```

Edit `C:\OpenTFTPServer\OpenTFTPServerMT.ini` so that it says something like:

```ini
[LISTEN-ON]
#192.168.1.100
[HOME]
C:\LiveDrive\TFTPRoot
[LOGGING]
Errors
[TFTP-OPTIONS]
blksize=65464
```

Restart service:

```batch
net stop TFTPServer
net start TFTPServer
```

### 7.2 DHCP Server Setup

Setup Open DHCP Server.

Backup `C:\OpenDHCPServer\OpenDHCPServer.ini`.

```batch
copy "C:\OpenDHCPServer\OpenDHCPServer.ini" "C:\OpenDHCPServer\OpenDHCPServer.ini.original"
```

Edit `C:\OpenDHCPServer\OpenDHCPServer.ini` so that it says something like:

```ini
[LISTEN_ON]
#192.168.1.100
[LOGGING]
LogLevel=Normal
[RANGE_SET]
DHCPRange=192.168.1.25-192.168.1.75
SubnetMask=255.255.255.0
DomainServer=192.168.1.1,8.8.8.8,8.8.4.4
Router=192.168.1.1
NameServer=192.168.1.1
NextServer=192.168.1.100
BootFileSize=3170304
BootFileName=\Boot\wdsnbp.com
```

Restart service:

```batch
net stop OpenDHCPServer
net start OpenDHCPServer
```

### 7.3 Web Server Setup

## 8 Product Testing

With the exception of USB booting, I use a VirtualBox virtual machine to test all of these boot scenarios. <a href="http://www.virtualbox.org/" target="_blank">VirtualBox</a> doesn't boot directly from USB, so I use a second PC to test USB booting. All of these boot patterns have been tested and work according to design.

If you have any comments or suggestions for improvement, please drop me a line below or find me on Google+. Enjoy the fruits of your labor!
