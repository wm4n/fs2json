var fs = require('fs');
var SEP = require('path').sep;

var fs2json = {

    fs: null,

    from: function(targetPath, callback) {
        if(arguments.length <= 0) {
            throw new Error("Invalid Argument! Usage: fs2json.from(targetPath, callback)");
        }
        else if(arguments.length >=1) {
            if(typeof(targetPath) !== "string") {
                throw new Error("Invalid Argument! The first arugment must be string");
            }
        }
        this.fs = [];
        _parse(targetPath, this.fs, callback);
    }

};


function _parse(target, mountPoint, callback) {
    var targetPath = target;
    if( ! Array.isArray(target)) {
        targetPath = [ target ];
    }

    _parsePaths(targetPath, mountPoint)
        .then(() => {
            callback(null,  mountPoint);
        })
        .catch((err) => {
            callback(err);
        });
}

function _parsePaths(targetArray, mountPoint) {
    return new Promise((resolve, reject) => {
        let completeCount = 0;
        targetArray.forEach((value) => {
            _parsePath(value, mountPoint)
                .then(() => {
                    completeCount ++;
                    if (completeCount === targetArray.length) {
                        resolve();
                    }
                })
                .catch(() => {
                    completeCount++;
                    if (completeCount === targetArray.length) {
                        reject(new Error(`Parsing '${value}' failed`));
                    }
                });
        });
    });      
}


function _parsePath(targetPath, mountPoint) {
    return new Promise((resolve, reject) => {
        _parseFile(targetPath)
            .then((stats) => {
                if (stats.isFile()) {
                    // is a file
                    const filename = targetPath.slice(targetPath.lastIndexOf(SEP) + 1);
                    if (_isValidFile(filename)) {
                        // console.log(`[File]\t\t${filename}`);
                        mountPoint.push(
                            {
                                type: 'file',
                                name: filename,
                                location: targetPath,
                                size: stats.size
                            });
                    }
                    resolve();
                } else if (stats.isDirectory()) {
                    // is a directory
                    let dirName = targetPath.slice(targetPath.lastIndexOf(SEP) + 1);
                    if (dirName === '') {
                        const index = targetPath.indexOf(SEP);
                        if (index === 0) {
                            dirName = targetPath.slice(1);
                        } else if (index === targetPath.length - 1) {
                            dirName = targetPath.slice(0, index);
                        } else {
                            dirName = targetPath;
                        }
                    }
                    // console.log(`[Dir]\t\t'${dirName}'`);
                    if (_isValidDir(dirName)) {
                        const thisDir = {
                            type: 'directory',
                            name: dirName,
                            location: targetPath,
                            size: 0,
                            fs: []
                        };
                        mountPoint.push(thisDir);
                        _parseDirectory(targetPath)
                            .then((files) => {
                                //console.log(`parsing directory found ${files.length} files...`);
                                if (files.length === 0) {
                                    // empty directory
                                    thisDir.size = 0;
                                    resolve();
                                } else {
                                    // one or more files
                                    thisDir.size = files.length;
                                    const pathToFiles = files.map((file) => {
                                        if (targetPath.charAt(targetPath.length - 1) === SEP) {
                                            return targetPath + file;
                                        }
                                        return targetPath + SEP + file;
                                    });
                                    _parsePaths(pathToFiles, thisDir.fs)
                                        .then(() => resolve())
                                        .catch((err) => reject(err));
                                }
                            })
                            .catch((err) => {
                                // console.log('Parse directory error!', err);
                                reject(new Error(`Parsing '${targetPath}' failed`));
                            });
                        } else {
                            resolve();
                        }  
                    } else {
                        // is not a file nor directory
                        resolve();
                    }
                })
                .catch((err) => {
                    // console.log('Parse file error!', err);
                    reject(err);
                });
        });
}

function _parseDirectory(pathToParse) {
    return new Promise((resolve, reject) => {
        fs.readdir(pathToParse, (err, files) => {
            if (err) {
                reject(err);
            } else {
                resolve(files);
            }
        });
    });
}

function _parseFile(pathToParse) {
    return new Promise((resolve, reject) => {
        fs.stat(pathToParse, (err, stats) => {
            if (err) {
                reject(err);
            } else {
                resolve(stats);
            }
        });
    });
}

function _isNameValid(filename) {
    if (/^\..*/.test(filename)) {
        return false;
    }
    return true;
}

function _isValidFile(filename) {
    if (/.DS_Store/.test(filename) ||
        /Thumbs.db/.test(filename)) {
        return false;
    }
    return true;
}

function _isValidDir(filename) {
    if (/.DS_Store/i.test(filename)) {
        return false;
    }
    return true;
}

module.exports = fs2json;
