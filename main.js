/*
 * Copyright 2021 ZUP IT SERVICOS EM TECNOLOGIA E INOVACAO SA
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const core = require('@actions/core')
const { checkLicense } = require("./license");
const { readFile } = require("./file")
const chalk = require('chalk')
fs = require('fs');
glob = require('glob')
const configFilePath = ".github/license-check.json"
const fileData = readFile(configFilePath)
if (fileData) {
 let dataObject = JSON.parse(fileData)
 let copyrightContent = dataObject.copyright
 let ignore = dataObject.ignore
 let startDateLicense = dataObject.startDateLicense
 glob(
     "**/*.*",
     {cwd: process.cwd(), ignore}, async (err, fileNames) => {
         const error = await checkLicense(fileNames, {
             copyrightContent: copyrightContent,
             startDateLicense: startDateLicense
         })
         if (error) {
             console.log(chalk.red(error.title))
             console.log(chalk.red(error.details))
             core.setFailed('Action failed');
         }
     }
 )
}
