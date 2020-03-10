---
layout: post
title:  "Brainstorm: Cooperative Computing"
author: daball
date:   2011-12-19 03:08:00
tags: web node.js
redirect_from: "/2011/12/brainstorm-cooperative-computing.html"
disqus_id: 5205df8573e2710200000001
---
<table class="tr-caption-container" style="float: right; margin-left: 1em; text-align: right;" cellpadding="0" cellspacing="0"><tbody>
<tr><td style="text-align: center;"><span style="clear: right; margin-bottom: 1em; margin-left: auto; margin-right: auto;"><a href="http://nodejs.org/" target="_blank"><img src="http://1.bp.blogspot.com/-FkfxugSUulE/TyFXMYFb2iI/AAAAAAAAANg/pc9m0clpV6c/s1600/nodejs-light.png" border="0"></a></span></td></tr>
<tr><td class="tr-caption" style="text-align: center;"><a href="http://nodejs.org/" target="_blank">node.js</a></td></tr>
</tbody></table>

What if one could leverage Node.js to replace entire system configuration tools? Maybe that should be my next project: a web-based, service-oriented control panel for every OS (but specializing in Linux). How much easier might it be to aggregate and centralize administration for entire networks?

<div id="extended"></div>

I mean, how cool would it be, you could monitor everything from CPU usage, running processes, event logs, machine states, IP addresses, PCI / USB hardware, service configurations, and 50 million dozen other facets of data, and have it rendered in a pretty AJAX interface. If the servers were set up properly, one could tap into things like Ubuntu Upstart and subscribe to hardware notifications in real-time. How awesome would it be for an administrator to be completely aware that Susan in Marketing just plugged in her Ipod Touch via the front USB port on Terminal N87-E2-204.

Forget for a moment that everyone lives in a Windows world. Imagine an enterprise organization with, say 100,000 Linux workstations in one building. I'm willing to bet that the majority of those workstations may not be touched at least 35% of a given working day. With Linux workstations locked down properly by network administration, the user isn't necessarily aware of anything going on in the background. So, what happens in /var/ stays in /var/ and nobody is the wiser.

Assuming that each of these 100,000 workstations has at least an Intel Core 2 Duo / AMD Athlon X2 CPU and a KVM installation, it would be extremely easy to push an extra web server onto 100 workstations at once, perhaps even on-demand by a centralized state monitoring tool that makes enterprise-wide adjustments on-the-fly.

A centralized tool could also permit network administrators to see that out of, say 1,000 CPUs, you might only be using 20% of that resource in a given moment, and you could get really brave and push real work out onto idle machines. Who needs a data center if you have an entire enterprise that's sitting still? Best of all, nobody would even know that R&D just ran 10,000 seconds of 3D model mathematics on 20 machines while those employees were out on break.

I could call this idea of mine cooperative computing. Or, at least it would be a great thesis topic.
