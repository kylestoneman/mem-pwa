# Progressive Web App

This site uses [metalsmith](http://www.metalsmith.io/) to build a static website.

## Developing Locally

1. Download or clone this repository, and open it in your terminal
2. Run `yarn` to install dependencies
3. Run `yarn start` to start a server locally and watch changes to files

## Deploying

Commits to the `master` branch trigger automatic deploys in [Netlify](https://netlify.com). These are generally available 20-40 seconds after the commit is made. To run a deploy, Netlfiy pulls the latest version of `master`, runs the command `yarn build`, and then serves the resulting static site that has been generated in the directory `/build`.

### Deploying somewhere else

The site can easily be connected into other build tools by replicating the process described in the Deploying section, or by adding a `release` command to `package.json` that builds the site and then uses `scp` to put the latest version in place.

## What are we using Metalsmith to do?

We're using Metalsmith as a lightweight CMS. It can let us expand the site in the future easily. More importantly, in the short term it gets us some nice things:

* Markdown
* CSS prefixing
* HTML partials & templates
* Local development server

It can also do (but currently isn't doing) things like...

* Asset Fingerprinting (for more predictable caching)
* Creating collections (blog posts, news articles, etc)
* Pagination
* Sitemaps
* Testing & linting
