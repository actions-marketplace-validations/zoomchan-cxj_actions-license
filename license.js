/*
 * Copyright 2020, 2021 ZUP IT SERVICOS EM TECNOLOGIA E INOVACAO SA
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

const core = require('@actions/core');
const github = require('@actions/github');
const fs = require("fs");
const util = require("util");
const chalk = require("chalk");
function hasCorrectCopyrightDate(copyrightFile, file, startDateLicense) {
    const currentYear = new Date().getFullYear();
    let requiredDate = '';
    if (startDateLicense < currentYear) {
        requiredDate = `Copyright ${startDateLicense}, ${currentYear}`;
    } else {
        requiredDate = `Copyright ${startDateLicense}`;
    }
    return copyrightFile.includes(requiredDate);
}

async function openFile(name) {
    return await new Promise(
        (resolve,reject) => {
            fs.open(name, 'r', (error, fd) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(fd);
                }
            });
        });
}

async function checkLicenseFile(file, config, fd) {
    let buffer = Buffer.alloc(8000)
    return await new Promise(
        (resolve, reject) => {
            fs.read(fd, buffer, 0, 8000, 0, (err) => {
                if (err) {
                    console.error(`Error reading file ${err}`);
                }
                const copyrightFile = buffer.toString('utf-8');
                const allCopyrightIncluded = config.copyrightContent.every(
                    line => copyrightFile.includes(line)
                );

                if (!allCopyrightIncluded) {
                    console.log('File '+ chalk.yellow(file.name+": ") + chalk.red('No correct copyright header!'));
                    return reject(file.name);
                } else if (config.startDateLicense) {
                    const correctDate = hasCorrectCopyrightDate(copyrightFile, file, config.startDateLicense);
                    if (correctDate) {
                        console.log('File ' + chalk.yellow(file.name+": ") + chalk.green('ok!'));
                        return resolve();
                    } else {
                        console.log('File '+ chalk.yellow(file.name+": ") + chalk.red('Fix copyright date!'));
                        return reject(file.name);
                    }
                }
                return resolve();
            })
        })
    }

async function checkFilesLicense(filesPr, config) {
    let errors = [];
    for (let file of filesPr) {
        const fd = await openFile(file.name);
        try {
            await checkLicenseFile(file, config, fd);
        } catch (error) {
            errors.push(error);
        }
    }
    if (errors.length) {
        return({
            title: `Quantity of files with copyright errors: ${errors.length}`,
            details: `Files : ${util.inspect(errors)}`
        });
    }
}

function removeIgnoredFiles(filesPr, fileNames) {
    return filesPr.filter(
        file => fileNames.includes(file.name)
    );
}

async function getCreationYear(file, config) {
    const response = await config.octokit.request(`GET /repos/{owner}/{repo}/commits?path=${file.name}`, {
        owner: config.owner,
        repo: config.repo
    });
    const commitsDates = response.data.map(data => new Date(data.commit.author.date));
    const creationDate = Math.min.apply(null, commitsDates);
    return new Date(creationDate).getFullYear();
}

const checkLicense = async (fileNames, config) => {
    const token = core.getInput('token');
    let commitFrom = core.getInput('commit-from');
    let commitTo = core.getInput('commit-to');

    const octokit = github.getOctokit(token);
    const owner = github.context.payload.repository.owner.login;
    const repo = github.context.payload.repository.name;
    if (!commitFrom && !commitTo) {
        const prNumber = github.context.payload.pull_request.number
        config = {
            ...config,
            owner: owner,
            repo: repo,
            octokit: octokit,
        };
        const responsePr = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', ({
            owner: config.owner,
            repo: config.repo,
            pull_number: prNumber
        }));
        commitFrom = responsePr.data.base.sha;
        commitTo = responsePr.data.head.sha;
    }
    console.log(`commit from ${commitFrom} to ${commitTo}`);
    if (!commitFrom || !commitTo) {
        return {
            title: `The range of commit ids is not correct`,
            details: `commitFrom is ${commitFrom ? commitFrom : 'empty'}, commitTo is ${commitTo ? commitTo : 'empty'}.`
        };
    }
    const responseCompare = await octokit.request('GET /repos/{owner}/{repo}/compare/{basehead}', {
        owner: config.owner,
        repo: config.repo,
        basehead: `${commitFrom}...${commitTo}`
    });

    const filesPr = responseCompare.data.files.map(
        file => {
            return {
                name: file.filename,
                status: file.status
            }
        }
    )

    const filesFiltered = removeIgnoredFiles(filesPr, fileNames);
    const filesWithYear = await Promise.all(filesFiltered.map(
         async (file) => {
            return {
                ...file,
                year :  await getCreationYear(file, config)
            }
        }));
    return await checkFilesLicense(filesWithYear, config);
}

exports.checkLicense = checkLicense;
