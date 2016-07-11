+++
date = "2014-12-14T11:08:53+01:00"
title = "So many things, so little time"
active_menu = "content.blog"

type = "blog"
tags = ["Catch-up"]
+++


Lately I have been busy studying some things trying out others, so this is a quick overview of what I was doing and why.
Ideally I will write up a proper post for each of these.

Reading the Linux kernel
========================
So this first thing is fun!
Several months ago at work we were having problems with memory overuse and so I had a chance to look at Linux memory allocation.
I found it as confusing as it was interesting, mostly the buddy system, and I could not find satisfyingly detailed documentation so I started reading the kernel itself (still at the early boot stages but it takes a lot of time 🙂).

Process containers
==================
Containers (and namespaces) are tools offered by the Linux kernel to segregate and isolate processes running on a system.
Most people think Docker here but I want to know how they work so I have decided to skip it for now and look at what the kernel does (this is of course linked to the first point too).

The devops movement
===================
While still unsure what the most appropriate definition of DevOp is I decided I don’t care.
I am a developer and I want to understand and care for service infrastructures just as much as I care for my own code.
Turns out that, while increasingly easier nowadays, it is not such a simple task to get close to a live system event to observe it.

Log collection
==============
This is one of the few things I have managed to complete in the last four months and I will definitely post more details about it.
I was able to set up FluentD to push logs to a centralised server where events are processed and stored (in ElasticSearch) and accessed through Kibana.
The cool bit was the parsing of messages as the type/structure of information extracted depended on each individual event and not just the source.

CollectD and StatsD
===================
After collecting logs it seems fair to collect statistics about systems.
What I wanted was the ability to push data from CollectD to a centralised StatsD.
After that is all a breeze with InfluxDB and Grafana.

Implementing a service managing daemon
======================================
The origin story of this is quite long but it boils down to wanting to know the ticks and challenges of cluster management software, so I decided to start writing one …
Of course that was not going to work so the idea is to write a (C++ linux) daemon that can be extended with new features and start by starting processes and checking up on them.
The interesting fact is that the more I think about it the more I it shapes itself as a combination of Docker (at some point I want to support containers and stuff), Mesos (well it would be cool to say “run this” and have it pick a machine in a cluster and run a service) and quite a lot of any SysInit system ever.
The cool thing so far is that it revolves around a versioned approach to configuration: the config will be loaded from a git repo so you will be able to just commit changes locally and then update the configuration used by the server.
This will be released as soon as it can start anything.

Finally
=======
I am also looking into speeding up the website itself by minifying and compressing the code as well as publish it on GitHub.
More on this soon.
