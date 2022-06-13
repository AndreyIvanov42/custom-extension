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
runner.setInput('Overwrite', 'false');
let answers = {
    checkPath: {},
    find: {},
};
answers.checkPath[path.normalize('/srcDir')] = true;
runner.setAnswers(answers);
runner.registerMockExport('find', (itemPath, options) => {
    if (!options.allowBrokenSymbolicLinks) {
        throw new Error("");
    }
    return ['/srcDir/file1'];
});
// as a precaution, disable fs.chmodSync. it should not be called during this scenario.
fs.chmodSync = null;
runner.registerMock('fs', fs);
runner.run();
