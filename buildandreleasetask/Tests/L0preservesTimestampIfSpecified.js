"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const mockrun = require("azure-pipelines-task-lib/mock-run");
const path = require("path");
const { promisify } = require('util');
let taskPath = path.join(__dirname, '..', 'copyfiles.js');
let runner = new mockrun.TaskMockRunner(taskPath);
runner.setInput('Contents', '**');
runner.setInput('SourceFolder', path.normalize('/srcDir'));
runner.setInput('TargetFolder', path.normalize('/destDir'));
runner.setInput('CleanTargetFolder', 'false');
runner.setInput('Overwrite', 'false');
runner.setInput('preserveTimestamp', 'true');
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
    path.normalize('/srcDir/someOtherDir2'),
    path.normalize('/srcDir/someOtherDir2/file1.file'),
    path.normalize('/srcDir/someOtherDir2/file2.file'),
    path.normalize('/srcDir/someOtherDir2/file3.file'),
    path.normalize('/srcDir/someOtherDir3'),
];
runner.setAnswers(answers);
runner.registerMockExport('stats', (itemPath) => {
    console.log('##vso[task.debug]stats ' + itemPath);
    switch (itemPath) {
        case path.normalize('/srcDir/someOtherDir'):
        case path.normalize('/srcDir/someOtherDir2'):
        case path.normalize('/srcDir/someOtherDir3'):
            return { isDirectory: () => true };
        case path.normalize('/srcDir/someOtherDir/file1.file'):
        case path.normalize('/srcDir/someOtherDir/file2.file'):
        case path.normalize('/srcDir/someOtherDir2/file1.file'):
        case path.normalize('/srcDir/someOtherDir2/file2.file'):
        case path.normalize('/srcDir/someOtherDir2/file3.file'):
            return { isDirectory: () => false };
        default:
            throw { code: 'ENOENT' };
    }
});
fs.utimes = promisify(function (targetPath, atime, mtime, err) {
    console.log('Calling fs.utimes on', targetPath);
});
runner.registerMock('fs', fs);
runner.run();
