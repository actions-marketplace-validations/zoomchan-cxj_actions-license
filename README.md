# actions-license

This action forked from [actions-license](https://github.com/thalleslmF/actions-license) and do some customization.

+ Use `fast-glob` to replace `glob` to improve performance.

+ Support `include` pattern configuration.

+ Support manually trigger workflow through specifying `commit-from` and `commit-to` ids.

+ `Date` check is optional.

# Usage

1. create `.github/license-check.json` or specify concrete path in `action inputs: config-path` like the following:

```
"copyright": [  // Put your license here in a array format
    "Copyright",
    "Licensed under the **, Version 2.0 (the \"License\");"
  ],
"include": [ // Put the file pattern you want to include on the check, default is **/*.*
    "**/*.*"
],  
"ignore": [ // Put the file pattern you want to ignore on the check
    "**/node_modules/**",
    "**/.git/**",
    "**/.gradle/**",
    "**/.DS_Store/**",
    "**/.nyc_output/**",
    "**/.vscode/**",
    "**/.vs/**",
    "**/.idea/**",
    "**/*.xcworkspace/**"
  ],
"startDateLicense": 2020 // Specify the license date to check, it is not required
```

2. You can also manually trigger workflow through set `commit-from` and `commit-to` ids.
