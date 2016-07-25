Spogliani.net
=============
Sources to build http://spogliani.net


Dependencies
------------
The following tools and frameworks are used to build or in this website.

### Tools

  * [Bower](https://bower.io/)
  * [Hugo](https://gohugo.io/)
  * [Make](https://www.gnu.org/software/make/)
  * [Node/NPM](https://nodejs.org/en/)
  * [Sass](http://sass-lang.com/)
  * [Webpack](http://webpack.github.io/)

### Frameworks

  * [Bootstrap](https://getbootstrap.com/)
  * [FontAwesome](http://fontawesome.io/)
  * [jQuery](https://jquery.com/)


Updating the site
-----------------
This is mostly for myself so I do not have to remember.
The site is hosted on AWS through S3 and CloudFront (for HTTPS).

The AWS account is configured though [terraform](https://www.terraform.io/)
and `make upload` uses `aws s3 --profile=spogliani-net sync ...`.
