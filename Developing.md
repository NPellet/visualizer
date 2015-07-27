# Developing

Information for the core developers of the project.

## Check code style

The project uses eslint to validate code style.  
Command is `npm run eslint`

## Write conventional commit messages

We follow the rules from AngularJS project: https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit

## Versioning and release procedure

The Visualizer project tries to follow [semantic versioning](http://semver.org/).  
The current version is 2.x.y and a major bump (to 3.0.0) would only be done if
there is a important redesign of the project.

The are two kinds of actions that result in bumping the version number:

* Releasing a new version of the project
* Making a change that requires a view migration script

In both cases, the procedure is done using npm release scripts.  

### Bump version without releasing

This will most likely be used when the version number needs to be incremented for
a view migration script.  
Example: `$ grunt bump:prerelease`. "prerelease" can be replaced by any string 
accepted by the [semver](https://www.npmjs.com/package/semver) module for incrementation.  
"pre"-versions are preferred if no release is done.

This command just updates the numbers in `version.js`. No commit is created.

### Bump and release

To release a new version of the Visualizer, run a command like `npm run release:patch`.
The bump can be applied with `patch`, `minor`, `major` or nothing which defaults to `patch`.  
This will bump the version number, update the changelog, commit the files with a release message, 
tag the release in Git, then it will immediately bump the version to the next
prerelease, commit again and push the changes to GitHub.
