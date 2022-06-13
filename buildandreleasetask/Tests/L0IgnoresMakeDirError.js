"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const mockrun = require("azure-pipelines-task-lib/mock-run");
const path = require("path");
let taskPath = path.join(__dirname, '..', 'copyfiles.js');
let runner = new mockrun.TaskMockRunner(taskPath);
runner.setInput('Contents', '**');
runner.setInput('SourceFolder', path.normalize('/srcDir'));
runner.setInput('TargetFolder', path.normalize('/destDir'));
runner.setInput('CleanTargetFolder', 'false');
runner.setInput('ignoreMakeDirErrors', 'true');
runner.setInput('Overwrite', 'false');
let answers = {
    checkPath: {},
    find: {},
};
answers.checkPath[path.normalize('/srcDir')] = true;
answers.find[path.normalize('/srcDir')] = [
    path.normalize('/srcDir'),
    path.normalize('/srcDir/someOtherDir'),
    path.normalize('/srcDir/someOtherDir/file1.file'),
    path.normalize('/srcDir/someOtherDir/file2.file'),
];
runner.setAnswers(answers);
runner.registerMockExport('stats', (itemPath) => {
    console.log('##vso[task.debug]stats ' + itemPath);
    switch (itemPath) {
        case path.normalize('/srcDir/someOtherDir'):
            return { isDirectory: () => true };
        case path.normalize('/srcDir/someOtherDir/file1.file'):
        case path.normalize('/srcDir/someOtherDir/file2.file'):
            return { isDirectory: () => false };
        default:
            throw { code: 'ENOENT' };
    }
});
runner.registerMockExport('mkdirP', (p) => {
    console.log(`mkdirP: ${p}`);
    throw "Error during creation of target folder.";
});
// as a precaution, disable fs.chmodSync. it should not be called during this scenario.
fs.chmodSync = null;
runner.registerMock('fs', fs);
runner.run();
