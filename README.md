# actions-license
This action forked from [actions-license](https://github.com/thalleslmF/actions-license) and do some customization.

# Usage

create `.github/license-check.json` or specify concrete path in `action inputs: config-path` like the following:

```
"copyright": [
    "Copyright",
    "Licensed under the **, Version 2.0 (the \"License\");", // Put your license here in a array format
  ],
"ignore": [
    "node_modules/**", //Put the file pattern you want to ignore on the check
    "**.md",
    "**.json",
    "**.png",
    "**.idea",
    ".github",
    ".git",
    ".gitignore",
    ".vscode",
    "coverage/**",
    "upgrades/**",
    "**.svg"
  ],
"startDateLicense": 2020
``` 
[Deno license checker]: https://github.com/kt3k/deno_license_checker

 
```
