---
layout: post
title:  "Enable 64-Bit Internet Explorer 10 In Windows 8"
author: daball
date:   2012-12-30 01:58:00
tags: windows
redirect_from: "/2012/12/enable-64-bit-internet-explorer-10-in.html"
disqus_id: 520609812bbfd30200000004
---
Since Internet Explorer 9 on Windows 7 64-bit, Internet Explorer has been available in both 32-bit and 64-bit versions. In Windows 8 64-bit with Internet Explorer 10, only one mode is available at one time and the outer frame runs in 64-bit mode while the tabs individually run in 32-bit mode by default. Here's how to enable 64-bit Internet Explorer on Windows 8.

<div id="extended"></div>

1. Launch **Control Panel**.

2. Click **Network and Internet**.

3. Click **Internet Options**.

*For Final Release Version of Windows 8:* <a href="http://2.bp.blogspot.com/--tPq3sS1jpg/UN_kcyWt2BI/AAAAAAAAAYw/G8mgmKEv5oM/s1600/Windows-8-Internet-Explorer-IE-10-Enable-64-bit.png" style="clear: right; float: right; margin-bottom: 1em; margin-left: 1em;"><img border="0" src="http://2.bp.blogspot.com/--tPq3sS1jpg/UN_kcyWt2BI/AAAAAAAAAYw/G8mgmKEv5oM/s1600/Windows-8-Internet-Explorer-IE-10-Enable-64-bit.png"/></a>

4. Click on the **Advanced** tab.

5. Scroll down past the start of the **Security** section of the settings tree. Check the option **Enable Enhanced Protected Mode**

6. Restart Internet Explorer.

<div style="clear: right;"></div>

*For Consumer Preview Customers Only:* <a href="http://1.bp.blogspot.com/-7BZMAditQ6c/UN_kboDbmHI/AAAAAAAAAYo/ASfZ8l5O3Xw/s1600/Windows-8-Preview-Internet-Explorer-IE-10-Enable-64-bit.jpg" imageanchor="1" style="clear: right; float: right; margin-bottom: 1em; margin-left: 1em;"><img border="0" src="http://1.bp.blogspot.com/-7BZMAditQ6c/UN_kboDbmHI/AAAAAAAAAYo/ASfZ8l5O3Xw/s1600/Windows-8-Preview-Internet-Explorer-IE-10-Enable-64-bit.jpg"/></a></p>

4. Click on the **Security** tab.
5. Check **Enable 64-bit Mode**.
6. Restart Internet Explorer.

<div style="clear: right;"></div>

*Testing for 64-bit Internet Explorer:*

Open Internet Explorer 10 and navigate to <a href="http://whatsmyuseragent.com/" target="_blank">whatsmyuseragent.com</a>.

If your user agent string contains the word **WOW64**, you are in 32-bit mode. If your user agent string contains the word **Win64** and/or **x64**, you are in 64-bit mode.

The user agent string is contained in the Javascript DOM as <a href="http://www.w3schools.com/jsref/prop_nav_useragent.asp" target="_blank">`window.navigator.userAgent`</a>.

If your browser does not switch right away, try restarting your PC after updating the setting, and try testing again the reboot.

*Known Issues:*

+ Most extensions do **NOT** support Enhanced Protected Mode Internet Explorer. Not all extensions are compiled for 64-bit Internet Explorer. You will be warned as the unsupported extensions are disabled.

+ There is currently no way that I am aware of to run both 32-bit and 64-bit Internet Explorer 10 at the same time like Internet Explorer 9 in Windows 7.
