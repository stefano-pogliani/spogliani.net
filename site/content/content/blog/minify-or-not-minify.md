+++
date = "2015-01-16T23:14:34+01:00"
title = "To minify or not to minify?"
active_menu = "content.blog"

type = "blog"
tags = ["optimisation", "web-app"]
+++


Since I last re-wrote this website I noticed it became really slow.
The site is built as an [Ember.JS](http://emberjs.com/) application and all the
pages (except of the blog posts content) are [Require.JS](http://requirejs.org/)
modules defining Ember routes and views with their
[Hanlebars.JS](http://handlebarsjs.com/) template in a separate file.
<!--more-->

<div class="alert alert-warning" role="alert">
  While the message of this post is still valid, the website has been
  re-implemented with as a static site.

  As such, most comments no longer apply to this specific site,
  but simply as a general comment.
</div>

This means a couple of files to set the application up and two files for each
page that are loaded the first time a page is requested.

The reason having all these separate files was a problem for my website is that
the server is in the US and I’m in Europe so loading it was painfully slow.

{{< figure src="/blog/minify-or-not-minify/projects-slow.png"
    title="Timeline view of 'projects' page loading (slow)" >}}

So I removed the lazy loading of modules and used
[R.JS](http://requirejs.org/docs/optimization.html) in my
[Grunt.JS](http://gruntjs.com/) file to minify all the JavaScript and inline
the templates in one "large" (597 KB) file.
This reduced the number of requests from 91 to 10 and got loading time down to 2.36 seconds.

{{< figure src="/blog/minify-or-not-minify/projects-no-comp.png"
    title="Timeline view of 'projects' page loading (one file, no compression)" >}}

While better than nothing, this is hardly what I was hoping for.  
And I still believed that for large and modular applications,
where the user often needs a fraction of all the modules,
it could hurt performance to have one huge file.

So I looked at a second step to improve speed: compression.  
The modules, event though optimised, all share the same structure and the
templates are inlined but not minified so there is a lot that compression can do.  
Modern browser can receive compressed content form a server and
[Nginx](http://wiki.nginx.org/Main) easily deals with compressed files so
[Apache HTTPD](http://httpd.apache.org/) must too.  
I updated my grunt task to gzip all files and updated the `.htaccess`
file to prefer the `.gz` version of CSS, HTML and JS files if it exists.


    SetEnv no-gzip
    RewriteCond %{HTTP:Accept-Encoding} gzip
    RewriteCond %{REQUEST_FILENAME}.gz -s
    RewriteRule ^(.+)\.(css|html|js)$ $1.$2.gz [L]
    
    # Update types
    <FilesMatch \.css\.gz$>
      ForceType text/css
      Header set Content-Encoding gzip
    </FilesMatch>
    
    <FilesMatch \.html\.gz$>
      ForceType text/html
      Header set Content-Encoding gzip
    </FilesMatch>
    
    <FilesMatch \.js\.gz$>
      ForceType text/javascript
      Header set Content-Encoding gzip
    </FilesMatch>


{{< figure src="/blog/minify-or-not-minify/projects-fast.png"
    title="Timeline view of 'projects' page loading (one compress file)" >}}

The final result is that the website now loads in approximately two seconds less than before!

But let us look at a few more numbers.  
First of all let me point out that this are all numbers base on one single test.  
The results are therefore not reliable but a very interesting exercise nonetheless.

<table class="table">
  <thead>
    <tr>
      <th>Configuration</th>
      <th># Requests</th>
      <th>Size</th>
      <th>Time</th>
    </th>
  </thead>
  <tbody>
    <tr>
      <td>Individual files</td>
      <td>91</td>
      <td>976 KB</td>
      <td>3.27s</td>
    </tr>
    <tr>
      <td>Minified</td>
      <td>10</td>
      <td>768 KB</td>
      <td>2.36s</td>
    </tr>
    <tr>
      <td>Minified & compressed</td>
      <td>10</td>
      <td>380 KB</td>
      <td>1.41s</td>
    </tr>
  </tbody>
</table>

So minification reduced the number of requested resources by 89%
(81 requests) but transferred size only by 21%.  
Compression is than going to save us another 50% in size and bring
us to a total of 61% (596 KB in total).  
As for speed, which was the original issue, both solutions together
bring a 56.8% improvement (1.8 seconds).  
Minification took away 27.8% of transfer time while compression
took away 40.2% of it.

So minification is a bit better in term of time saved compared to space
saved but has less to work with than compression.  
This is because the point of minification is to reduce the number of requests
made to the server and not the amount of content transferred.  
Reducing the number of requests avoids the need to open a new
TCP connection and exchange HTTP headers.  
Each request will account for very little data overhead but it involves the
three-way handshake, which is the lengthy operation,
followed by the HTTP GET request itself.

If you know of other examples of site minification/compression versus a non
minified/compressed version please let me know.
