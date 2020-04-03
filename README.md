# Personal Site
This is the source code for (the latest version of) my personal website.


## Building
The theme requires some NPM modules to build correctly:

```bash
$ cd themes/hello-friend-ng-adapted
$ npm ci
$ cd ../../
$ hugo
```


## Publishing
The site is published to GitHub Pages as a user site.
This requires the `master` branch to store the rendered site
so `source` is the main branch for this repo.

The `public/` directory is a [git worktree](https://git-scm.com/docs/git-worktree)
pointing to `master` so updates can be published more easily.

```bash
# Remove currently published version.
rm -rf public/*

# Generate the new site.
hugo

# Commit latest version to the master branch.
cd public && git add --all && git commit -m "Publishing to GH Pages" && cd ..

# Publish the new version by pushing master to GitHub"
git push --all
