---
layout: post
title:  "Windows, Meet Linux. Linux, Meet RemoteApp!"
author: daball
date:   2011-11-28 05:40:00
tags: linux ubuntu windows python bash gnome office
redirect_from: "/2011/11/windows-meet-linux-linux-meet-remoteapp.html"
disqus_id: 5204d0c8f7e8beaa5a000003
---
It has been forever and a dream for me to run Windows apps and Linux apps seamlessly on one Linux box. I have dreamed up almost every imaginable scenario. That day has now arrived. Here were some failed ideas:

<div id="extended"></div>

  + Wine has always been about 50 steps behind Windows in terms of the API. It doesn't run the apps I need it to. In fact, outside of World of Warcraft via Wine, which was a difficult configuration, I've never really been able to get anything to work like it should. That especially goes for my important applications, like Microsoft Office and Adobe Fireworks.

  + Virtualization works well but gets a bit in the way sometimes on the local machine. Virtualization is an optional part of the solution, though I recommend using a dedicated virtualization server or locally-hosted private compute cloud. Well, that is unless you have much more RAM in your notebook than I do.

  + Seamless virtualization with VirtualBox seemed almost promising with the advent of separate desktops via virtualization. For the same reasons, it was in the way when running locally, which was the only time that seamless mode ever seemed to work for me at all. Still there was the awkward minimizable taskbar and I wanted a full integration so that I could easily launch my Windows apps from my GNOME menus by simply running the application.

  + VNC works for single apps, so it would follow that it could be modified to push certain apps out by using a server launcher. The key problem with VNC is that two remoted apps must share a single desktop workspace, and that real-estate is limited by the physical screen resolution and the number of actual monitors. That won't work for running many remote apps simultaneously.

  + Windows Remote Desktop, RDP, always seemed like the closest solution to the problem. But, then you're stuck with the whole workspace again. Along came RemoteApp for Windows Server, but there was no Linux support for RemoteApp via the established rdesktop RDP client. Until now...

Meet <a href="http://www.freerdp.com/" target="_blank">FreeRDP</a>, a coming-of-age RDP client for Linux destined to replace rdesktop as the popular client. It is a shiny new drop-in replacement for rdesktop. Let us first talk about setup.

You are going to need:

  1. Windows Server 2008 or 2008 R2 with Terminal Services and RemoteApp enabled and properly licensed.
  2. Any number of Linux clients (I'm sure there is a practical limit somewhere.)
  3. Experience compiling your own software.

I have Ubuntu 11.10 64-bit (amd64) for my clients. For now my Windows Server 2008 R2 is running on bare-metal hardware, but I am picturing moving that to a virtual server in the very near future.

My instructions will be for Ubuntu 11.10 amd64. You can modify them as you will to fit your distribution.

*NOTICE: I have written some scripts to automate this part of the installation. Read the article to see how this process is simplified further. [Linux RemoteApp Just Got Way Easier](/2011/11/linux-remoteapp-just-got-way-easier.html)*

## 1. Install FreeRDP

Basically, here are the steps I took:

{% highlight bash %}
sudo apt-get install build-essential git cmake libssl-dev libx11-dev libxext-dev libxinerama-dev libxcursor-dev libxdamage-dev libxv-dev libxkbfile-dev libasound2-dev libcups2-dev

sudo apt-get install libcunit1-dev libdirectfb-dev xmlto doxygen

mkdir ~/src
cd ~/src

git clone https://github.com/FreeRDP/FreeRDP.git
cd FreeRDP

cmake -DCMAKE_BUILD_TYPE=Debug -DWITH_SSE2=ON .
make
sudo make install
{% endhighlight %}

Then create the file:

{% highlight bash %}
sudo nano /etc/ld.so.conf.d/freerdp.conf
{% endhighlight %}

With the contents:

    /usr/local/lib/freerdp

Save, then run:

{% highlight bash %}
sudo ldconfig
{% endhighlight %}

## 2. Create integration files

Create integration files used to run any of my hosted RemoteApp programs. For this example, my server is hosted at `192.168.1.100` and my user name is `david` and my password is `password` (it isn't really, but you get the idea).

Init these files:

{% highlight bash %}
mkdir ~/bin
touch ~/bin/{remoteapp,convert_local_to_remoteapp}
chmod +x ~/bin/{remoteapp,convert_local_to_remoteapp}
{% endhighlight %}

Create this file:

{% highlight bash %}
nano ~/bin/remoteapp
{% endhighlight %}

With the contents:

{% highlight bash %}
#!/bin/bash
#Description: Launches RemoteApp with command line arguments.
#Syntax: remoteapp <exename> <args>
#Depends: convert_local_to_remoteapp, Python 2.x, pwd, and POSIX $HOME.
#Notice: Should work on just about any Ubuntu.
#Author: David Ball, www.daball.me
REMOTE_HOST=192.168.1.100
REMOTE_USER=david
REMOTE_PASS=password

if [ "$#" == "0" ]; then
echo "$0 <exename> <args>"
echo "Use --convert-linux-path followed by a local path to convert it to a remote path."
echo "Example: remoteapp '||winword' /f --convert-linux-path $HOME/myDoc.docx"
exit 1
fi

REMOTE_COMMAND=$1;shift
REMOTE_COMMAND_ARGS=
CWD=`pwd`
REMOTE_WORKING_DIR=`convert_local_to_remoteapp $CWD`

while (($#)); do
if [ "$1" == "--convert-linux-path" ]; then
shift
REMOTE_COMMAND_ARGS="$REMOTE_COMMAND_ARGS`convert_local_to_remoteapp $1` "
else
REMOTE_COMMAND_ARGS="$REMOTE_COMMAND_ARGS$1 "
fi
shift
done
xfreerdp -z -a 32 -x l --app -u "$REMOTE_USER" -p "$REMOTE_PASS" --plugin rdpsnd --plugin rdpdr --data disk:home:"$HOME" disk:vfsroot:/ -- --plugin "$HOME"/src/FreeRDP/channels/rail/rail.so --data "$REMOTE_COMMAND":"$REMOTE_WORKING_DIR":"$REMOTE_COMMAND_ARGS" -- "$REMOTE_HOST"
{% endhighlight %}

Create the file:

{% highlight bash %}
nano ~/bin/convert_local_to_remoteapp
{% endhighlight %}

With the contents:

{% highlight python %}
#!/usr/bin/python
#Converts local / paths to \\\\tsclient\\\\vfsroot for remoteapp consumption
#Converts local $HOME paths to \\\\tsclient\\\\home for remoteapp consumption
#HACK: When %U (used in GNOME menus/file associations) is found, deliberately
#      return empty string to avoid opening a non-existent path
#Author: David Ball, www.daball.me
import sys, os
server = 'tsclient'
share = 'vfsroot'
#get all of cmd line as a single path, regardless of '' or "" quotations used
path = ' '.join(sys.argv[1:])
#trim all whitespace around edges
path = path.strip()
#trim all quotations around edges, NOTE: has potential problem of ignoring
#a file name that ends with a quotation mark, however rare it would seem to be
path = path.strip('\'\"')
#expand ~/ user paths
path = os.path.expanduser(path)
#get the absolute path, converting ./ and ../ and so on
path = os.path.realpath(path)
#check whether it falls under the \\tsclient\home or \\tsclient\vfsroot scope
if path.find(os.environ['HOME']) != -1:
share = 'home'
path = path[len(os.environ['HOME']):]
#trim leading /
if len(path) > 0 and path[0] == '/': path = path[1:]
#join the base path to the share name to the server to the root
path = '/' + os.path.join('/', server, share, path)
#trim trailing /
if path[-1] == '/': path = path[0:-1]
#convert from unix style to windows-style slashes
path = path.replace('/', '\\\\')
#if the word %U shows up, don't return anything, otherwise print the path
if path != '%U':
print path
{% endhighlight %}

Be sure that your `~/bin` folder is included in your `PATH`. If you aren't sure, edit your `$HOME/.profile` with the command:

{% highlight bash %}
nano ~/.profile
{% endhighlight %}

Make sure it has this:

{% highlight bash %}
# set PATH so it includes user's private bin if it exists
if [ -d "$HOME/bin" ] ; then
PATH="$HOME/bin:$PATH"
fi
{% endhighlight %}

Reload your profile by either logging out and logging back in, or use the command:

{% highlight bash %}
source ~/.profile
{% endhighlight %}

Install Python 2.7.

{% highlight bash %}
sudo apt-get install python2.7
{% endhighlight %}

You may want to log out and log back in your window manager (if you had to create `~/bin`). And, now you can run any hosted RemoteApp using a command such as these:

{% highlight bash %}
remoteapp '||winword'
remoteapp '||iexplore'
remoteapp '||excel'
{% endhighlight %}

The syntax of the command is like this:

{% highlight bash %}
remoteapp '||shared-app-name' command-line-args
{% endhighlight %}

You may also add `--convert-linux-path` to convert a local path to a RemoteApp path on `\\tsclient`.

An elaborate, useful example would be one for Microsoft Office applications for GNOME integration:

{% highlight bash %}
#example command lines useful for GNOME Menus
remoteapp '||winword' /f --convert-linux-path "%U"
remoteapp '||excel' /f --convert-linux-path "%U"
remoteapp '||powerpnt' /O --convert-linux-path "%U"
remoteapp '||msaccess' --convert-linux-path "%U"
{% endhighlight %}

This is the exact integration I have used on my Ubuntu box so that I can load it from the menu launcher as well as by double-clicking files in the File Manager (after setting the default program associations). (Microsoft Access does not work since file locking doesn't currently work across the `\\tsclient`.)

## 3. Create .desktop files

Create `.desktop` files where appropriate. You can try various methods to grab out the icons from the program executable files on the remote end and then convert them to PNG files. I would just recommend looking online first. I think these look better anyways:

{% highlight bash %}
#download example Microsoft Office icons
cd /usr/share/icons
sudo wget http://icons.iconarchive.com/icons/benjigarner/softdimension/256/MS-Word-2-icon.png
sudo wget http://icons.iconarchive.com/icons/benjigarner/softdimension/256/Excel-icon.png
sudo wget http://icons.iconarchive.com/icons/benjigarner/softdimension/256/PowerPoint-icon.png
sudo wget http://icons.iconarchive.com/icons/benjigarner/softdimension/256/Access-icon.png
{% endhighlight %}

Download alacarte.

{% highlight bash %}
sudo apt-get install alacarte
{% endhighlight %}

Use it like this: <a href="http://blog.randell.ph/2011/08/01/how-to-create-custom-application-launchers-in-gnome-3/" target="_blank">How to Create Custom Application Launchers in GNOME 3</a>. Just remember to put your icons in `/usr/share/icons` as root user.

Enjoy your one-click access to freedom. Have a look at what I've got going on here:

<table class="tr-caption-container" style="margin-left: auto; margin-right: auto; text-align: center;" cellpadding="0" cellspacing="0" align="center"><tbody>
<tr><td style="text-align: center;"><a href="http://3.bp.blogspot.com/-XZGZ5w-moIk/TtM6o8-70CI/AAAAAAAAAJU/oviJbShSS00/s320/MS+Office+on+Linux+via+RemoteApp+and+FreeRDP.png" imageanchor="1" style="margin-left: auto; margin-right: auto;"><img src="http://3.bp.blogspot.com/-XZGZ5w-moIk/TtM6o8-70CI/AAAAAAAAAJU/oviJbShSS00/s320/MS+Office+on+Linux+via+RemoteApp+and+FreeRDP.png" height="200" width="320" border="0"></a></td></tr>
<tr><td class="tr-caption" style="text-align: center;">Microsoft Office on Ubuntu 11.10 with RemoteApp and FreeRDP</td></tr>
</tbody></table>

Buyer beware: I've had to manually log in to my server and reset connections when they don't exit properly. For some reason, it doesn't work after 3 concurrent connections; perhaps a licensing glitch on my end. Maximize doesn't render on my screen. The clipboard integration package doesn't work. And, I haven't quite figured out the RemoteFX capabilities on neither Windows Server 2008 R2 nor FreeRDP.

Despite these limitations of the pre-release version, this is perhaps one of the best integration successes I have had to date. <a href="http://www.freerdp.com/" target="_blank">Way to go FreeRDP team!</a>
