# actions-license
This action forked from [actions-license](https://github.com/thalleslmF/actions-license) and do some customization.

# Usage

1. create `.github/license-check.json` or specify concrete path in `action inputs: config-path` like the following:

```
"copyright": [
    "Copyright",
    "Licensed under the **, Version 2.0 (the \"License\");", // Put your license here in a array format
  ],
"include": [
    "**/*.*" // Put the file pattern you want to include on the check, default is **/*.*
],  
"ignore": [
    "**/node_modules/**", // Put the file pattern you want to ignore on the check
    "**/.git/**",
    "**/.gradle/**",
    "**/.DS_Store/**",
    "**/.nyc_output/**",
    "**/.vscode/**",
    "**/.vs/**",
    "**/.idea/**",
    "**/*.xcworkspace/**",
    ".github/**",
    "docs/**"
  ],
"startDateLicense": 2020 // Specify the license date to check, it is not required
```

2. You can also manually trigger workflow through set `commit-from` and `commit-to` ids.
