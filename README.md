1. This repository is a static media storage
hosted on GitHub. The static HTML repository
contents can be browsed at https://media.gprb.su/

2. Re-generating static HTML entrypoints (index.html)
is done via a GitHub Actions script that clones the
repo, runs the staticgen.js script and pushes everything
that has changed (at this moment only HTML entrypoints).

3. Considering the automated nature of HTML entrypoints,
it is not recommended to put one manually in any
directories that are not marked as ignored in the
configuration file.
