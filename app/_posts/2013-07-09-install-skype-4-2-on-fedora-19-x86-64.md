---
layout: post
title:  "Install Skype 4.2 on Fedora 19 (x86_64) using rpm"
author: daball
date:   2013-07-09 00:08:00
tags: linux fedora skype
redirect_from: "/2013/07/install-skype-42-on-fedora-19-x8664.html"
disqus_id: 52060c692bbfd30200000005
---
The following directions work on Fedora 19, x86_64, to install Skype 4.2 using the RPM Package Manager.

<div id="extended"></div>

# Configure environment, if needed

{% highlight bash %}
mkdir $HOME/Downloads
cd $HOME/Downloads
{% endhighlight %}

# Install updates, if any

{% highlight bash %}
sudo yum update
{% endhighlight %}

# Install wget

{% highlight bash %}
sudo yum install wget
{% endhighlight %}

# Install Skype dependencies

{% highlight bash %}
sudo yum install alsa-lib.i686 libXv.i686 libXScrnSaver.i686 qt.i686 qt-x11.i686 pulseaudio-libs.i686 pulseaudio-libs-glib2.i686 alsa-plugins-pulseaudio.i686 qtwebkit.i686
{% endhighlight %}

# Download Skype

{% highlight bash %}
wget --trust-server-names http://www.skype.com/go/getskype-linux-beta-fc10
{% endhighlight %}

# Install Skype

Assuming this is the only Skype `.rpm` file in your `Downloads` folder, this command will work.

{% highlight bash %}
sudo rpm -i skype-*.rpm
{% endhighlight %}

# All done

Run Skype!

    skype
