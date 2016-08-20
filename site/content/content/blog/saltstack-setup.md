+++
date = "2016-08-04T23:04:05+01:00"
active_menu = "content.blog"
title = "My home SaltStack setup"

type = "blog"
tags = ["SaltStack", "Infra", "Automation"]
+++


I have three or four [RaspbarryPi](https://www.raspberrypi.org/) at home that 
I use to run stuff I am curious about or that I find helpful (i.e, OwnCloud).
Since this is supposed to be for fun I have no intention of spending hours
managing them individually.
On top of that I find [SaltStack](https://saltstack.com/) to be
a very interesting project with a lot of potential but also a
somewhat steep learning curve.

I say SaltStack has a steep learning curve because starting is very easy but
organising states for more complex deployments was not obvious to me.
For this reason I have decided to write this post with
**my suggested** configuration for a small, fast evolving,
and potentially growing deployment.


Components overview
===================
<div class="alert alert-info" role="alert">
<p>
  The aim of this post is to organise my experience with SaltStack, Chef,
  and Bash based automation into a more organic structure for a brand new
  SaltStack instance.
</p>
<p>
  This means that the full system or the states are not implemented at the
  time of writing but it is being designed and implemented in the future
  (and a link will be added to my GitHub repo).
</p>
</div>

{{< figure src="/blog/saltstack-setup/overview.png"
    title="Overview of SaltStack components"
    class="normal text-center" >}}

SaltStack is many things and in this case I will describe the configuration
automation aspect of it and the design of the system and release process
for new states and configurations.

The focus will be on extensibility and speed of iteration.
At the same time it is important to minimise
[cognitive load](https://en.wikipedia.org/wiki/Cognitive_load) on users
and states developers.

For this reason the structure of the system is directed by the structure
of the states and by the release process.

The following ideas drive the entire design:

  * Packages isolate changes (thus allow faster iterations on components).
  * Packages allow reuse ...
    * ... of common states, which leads to standardisation.
    * ... of community states, which speeds things up.
  * Top level states and configurations are only a mean to glue other packages.
  * States and packages are updated and applied easily and,
    optionally, automatically.


Configuration, packages, and states
===================================
A fully functional `salt-master` requires a few configuration changes and
a set of states to deploy to `salt-minion`s.
States can be then either reusable logic or glue states.
All these things can be stored and deployed in salt packages.

Every sysadmin also has a set of scripts they use to automate tasks
or otherwise help themselves.

Thus we have two things to store and deploy:

  1. Salt packages for config, states, and glue states.
  2. Tools and scripts for development and deployment.

Depending on how complex packages are you may want to isolate them into
dedicated repository but I suspect that one will work nicely.

On the other hand tools and scripts should be separate.


Package repository
------------------
So you have the repository with all of your state packages now what?

Packages need to be built and uploaded to a repository in order to be
available for SPM to install.
We will cover bootstrapping the entire SaltStack deployment at the end but
for now we will assume that an [nginx](https://www.nginx.com/) instance is
available to host our repository.

[SPM documentation](https://docs.saltstack.com/en/latest/topics/spm/)
explains how to structure and build a package so I am not going to
cover it but I am going to look at strategies to update and publish updates.

The solutions I believe to be best are below and start with a git repository
storing our packages and submodules for the community packages we use.

### The build server
One option is to have a server checkout our packages repo, build the
packages, and `scp` them to our repo server (or copy them to the right
place if the build server also hosts the repository).

After packages have been copied to the repo server we run
`spm create_repo` to update the metadata.

Nginx is configured to serve the packages as static files.

### The local build
As I mentioned my setup is a small, personal, and low power setup.
As such having a server building packages is an overkill.

Much simpler is to build the packages locally and `scp` them to the
salt-master/spm repo server.

Both methods will need a bit of scripting to automate them.


Installing packages
-------------------
Packages are installed on the salt-master by creating a `.repo` file in
`/etc/salt/spm.repos.d/` and `spm update_repo && spm install PACKAGE`.

This is fine if only one file needs to be installed but I prefer to have a
wrapper around `spm install` to make it similar to
`pip install -r requirements.txt`.

At the moment `spm install` also does not seem to support updates so
it may be necessary to support version upgrades/downgrades with uninstall
and re-install.

Once such script with a `requirements.txt` is available we can use
[salt orchestrate](https://docs.saltstack.com/en/latest/topics/orchestrate/orchestrate_runner.html)
to ensure packages are installed before they are used.


Secrets
-------
[SaltStack best practices](https://docs.saltstack.com/en/latest/topics/best_practices.html#storing-secure-data)
suggest storing sensitive data in pillars so that only the master and the
targeted minion(s) have access to it.
This means that access to (at least some of) the pillar files must be
restricted and they cannot be stored in version control.

**But there is more!**
SaltStack comes with a built in GPG renderer.
This allows users to store GPG encrypted values in pillars so that they can
only be decoded by the master and committed to version control.

SaltStack [GPG renderer](https://docs.saltstack.com/en/latest/ref/renderers/all/salt.renderers.gpg.html)
documentation explains how to set up your master and your local machine
to create a GPG key and export it so you can encrypt secrets for your master.

The advantage of this is that now the only secret that needs to be managed
securely is the GPG private key stored on the master and backed up in case
you have to re-build your master.

Key rotation is also possible but automating it sounds a bit messy as you
need to decode|encode all your pillar files or re-generate all the secrets.
Either way there is an update to all your pillar secrets in one go to do ...


Pillars
-------
SPM is a special archive to copy files to the master.
Pillar support is limited to the `pillar.example` file which is copied
into the pillars root and renamed to `<PACKAGE>.sls.orig`.
So state management is automated but pillar data is managed manually,
unless we trick SPM to deploy our pillar files with the state files.

As discussed later I prefix my states and files with `sp` to make them
more unique so my states have path following the pattern
`sp/<PACKAGE>/**.sls` and the `top_level_dir` for my packages is `sp/`.
This means that all files in `<FORMULA_DIR>/sp/` are deployed to the master.

To have pillar data deployed too I have `/srv/spm/salt/sp/pillar/` configured
as a pillar root and store pillar files in
`<FORMULA_DIR>/sp/pillar/sp/<PACKAGE>/**.sls`

Why do I want to package pillar data?
Well, most formulas would not include pillar data but only the `pillar.example`
but based on the idea of Chef's wrapper cookbooks we can have wrapper formulas
which would then deploy pillar data too.


Package names
=============
While the ability to reuse states and modules from the community is great,
there is a downside in systems that do not have namespaces built in.

I maintain a `chef` managed environment and many cookbook use the `python`
community cookbook.
This sounds great until you discover that the `python` cookbook has been
deprecated by `poise-python` which has the same `resource` names but sometimes
different arguments or semantics.

When I saw that I wanted to cry because of course the transition from one
cookbook to the other (not decided by us but "imposed" by the community)
now comes with occasional conflicts and inconsistencies.

This is why I think that states/cookbooks/whatever should be careful when
using names that may cause conflicts.

Namespaceing
------------
First of all states should always be namespaced to avoid conflict in
the salt-master file-server.
This way my own alternative to the community `apache` formula can be
`sp.apache` and more importantly if someone comes up with a better
implementation the two can co-exist in the same setup.

State ids should be prefixed too.
This is because ids are global across included state files and therefore
if two `sls` files where to define the same function with the same id
there would be clashes.

Extensibility and integrability
-------------------------------
(This comes from my Chef experience more then my SaltStack where cookbook
default recipes do everything without you having a say)

It is important to recognise that users have needs that you cannot expect.
This is especially important when it comes to things like `service`s that
need to integrate into other frameworks.

Just because a distribution comes by default with a specific init system
does not mean you can use the `os_family` to determine which kind of
init system to use and configure.
Some users will use non-standard init systems or process supervisors
built on top of an init system.

Let the user choose what features they want to use and let them create states
to compensate for custom needs they may have that the community may not share.


Testing packages
================
[KitchenCI](http://kitchen.ci/) is one of those tools you never think about
using until you try it and then never let go.

It is simple in concept and very extensible.
It is built for Chef but can be used for many other tools and I suspect even
a few projects that have nothing to do with server management.
It creates VMs/Docker containers/EC2 instances/others and then provision them
with one of many strategies.

We are likely to use [kitchen-salt](https://github.com/simonmcc/kitchen-salt)
to have kitchen install SaltStack and run salt-call on our states being
tested.
Kitchen-salt also support a (undocumented?)
[`:dependencies`](https://github.com/simonmcc/kitchen-salt/blob/master/lib/kitchen/provisioner/salt_solo.rb#L196)
option that allows us to include dependencies we need in order to test our
formula.

Kitchen can be used to develop formulas and test them locally as well as in
a CI pipeline (I will not do that as VMs on RPi is not a nice trip!).
In short: **Use it!!!**


Dependencies in SPM
===================
SPM is still evolving but is is evolving fast.

As of salt 2016.3.2 and based on the
[source code](https://github.com/saltstack/salt/blob/v2016.3.2/salt/spm/__init__.py#L173)
SPM allows the fields `dependencies`, `optional`, and `recommended` in the
`FORMULA` file but they are not of much use yet: `dependencies` is just ignored
while `optional` and `recommended` are printed for the user.
This is already changed in the development branch of SaltStack so it is
likely that the next release version will support more dependencies features.

I still want something like `requirement.txt`, `package.json`, take your pick!


Bootstrapping
=============
The most amazing results I have seen usually are backed by some complex
combination of multiple special-purpose solutions working together.
I am a strong believer of "Do one thing, do it well" when it comes to
software (or individual components of pluggable software).

This leads to a problem though: combining multiple tools requires ways to
coordinate, configure, and manage those tools.
When we reach lower level of infrastructure tools often the management tools
we use require the tools they are meant to configure (think for example DNS
servers where tools use DNS to reach the servers they need to configure).

It is easy to reach loops that prevent us from creating the infrastructure
out of nowhere.
And as time passes and systems evolve we also add tools and forget to update
our bootstrapping processes, assuming we had them to begin with!

While software needs to be built to accommodate for different use cases,
bootstrapping solutions should be small, simple, and custom made to target
what they are bootstrapping.
While my described SaltStack configuration can be used by many, it is not
wise to suggest a generic bootstrap system because generality add complexity.

A bootstrap system is a script/image/package or (most likely) set of them
that, given a vanilla system it expects, configures and starts all the
needed services to run our solution.

My bootstrap solution for a RPi SaltStack is a bash script to install
and configure the salt-master so that I can start it and have it bootstrap
other systems.

Remember that bootstrap solutions can also be layered to have requirements
build on top of other requirements, but be careful about the complexity
of your bootstrap solution: you should **always** be able to start fast.


Conclusions
===========
This is my idea of a SaltStack setup but the following points are important:

  * Many other options are available.
  * Salt package manager is in early development and relatively new.
  * Do what fits for you, not what others say.
  * This solution is untested and may not work as expected, implement
    at your own risk.


References
----------

  1. Example of using Kitchen for formula testing https://github.com/saltstack-formulas/influxdb-formula
  2. Example of a salt package https://github.com/saltstack-formulas/mysql-formula
  3. My salt-tools and kitchen master repository https://github.com/stefano-pogliani/salt-tools
  4. My salt-packages repository https://github.com/stefano-pogliani/salt-packages
