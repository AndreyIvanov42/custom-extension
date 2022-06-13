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
runner.setInput('Overwrite', 'true');
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
        case path.normalize('/destDir/someOtherDir'):
            return { isDirectory: () => true };
        case path.normalize('/srcDir/someOtherDir/file1.file'):
        case path.normalize('/srcDir/someOtherDir/file2.file'):
            return { isDirectory: () => false };
        case path.normalize('/destDir/someOtherDir/file1.file'):
            return {
                isDirectory: () => false,
                mode: (4 << 6) + (4 << 3) + 4,
            };
        default:
            throw { code: 'ENOENT' };
    }
});
// override fs.chmodSync
fs.chmodSync = (path, mode) => {
    console.log(`##vso[task.debug]chmodSync ${path} ${mode}`);
};
runner.registerMock('fs', fs);
runner.run();
