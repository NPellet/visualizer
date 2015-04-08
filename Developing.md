# Developing

Information for the core developers of the project.

## Versioning and release procedure

The Visualizer project tries to follow [semantic versioning](http://semver.org/).  
The current version is 2.x.y and a major bump (to 3.0.0) would only be done if
there is a important redesign of the project.

The are two kinds of actions that result in bumping the version number:

* Releasing a new version of the project
* Making a change that requires a view migration script

In both cases, the procedure is done using the Grunt script `bump`.  

### Bump version without releasing

This will most likely be used when the version number needs to be incremented for
a view migration script.  
Example: `$ grunt build:prerelease`. "prerelease" can be replaced by any string 
accepted by the [semver](https://www.npmjs.com/package/semver) module for incrementation.  
"pre"-versions are preferred if no release is done.

This command just updates the numbers in `version.js`. No commit is created.

### Bump and release

To release a new version of the Visualizer, run a command like `grunt build:patch --release`.  
This will bump the version number, commit the files with a release message, 
tag the release in Git, then it will immediately bump the version to the next
prerelease, commit again and push the changes to GitHub.
