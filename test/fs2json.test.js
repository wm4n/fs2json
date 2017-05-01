var fs2json = require('../src/fs2json');

var expect = require('expect');

describe('fs2json:', function() {
    it('should exist', function() {
        expect(fs2json).toExist();
    });

    describe('fs2json.fs', function() {
        it('should exist for fs2json.fs', function() {
            expect(fs2json.fs).toNotExist();
        });
    });

    describe('fs2json.from', function() {
        it('should produce error if empty argument', function() {
            expect(() => fs2json.from()).toThrow(/Usage: fs2json.from\(targetPath, callback\)/);
        });

        it('should produce error if the 1st argument is not a string', function() {
            expect(() => fs2json.from(1)).toThrow(/The first arugment must be string/);
        });

        it('should parse folder correctly', function(done) {
            fs2json.from('test_data/test_folder', (err, fs) => {
                expect(err).toNotExist();
                expect(fs).toExist();
                expect(fs.length).toEqual(1); // test_folder
                const filesystem = fs[0];
                expect(filesystem.type).toEqual('directory'); // fs.type
                expect(filesystem.name).toEqual('test_folder'); // fs.name
                expect(filesystem.location).toEqual('test_data/test_folder'); // fs.location
                expect(filesystem.size).toEqual(2);
                done();
            })
        });

        it('should parse file correctly', function(done) {
            fs2json.from('test_data/test_file', (err, fs) => {
                expect(err).toNotExist();
                expect(fs).toExist();
                expect(fs.length).toEqual(1); // test_folder
                const root = fs[0];

                expect(root.type).toEqual('directory'); // fs.type
                expect(root.name).toEqual('test_file'); // fs.name
                expect(root.location).toEqual('test_data/test_file'); // fs.location
                expect(root.size).toEqual(3);
                expect(root.fs.length).toEqual(3);

                expect(root.fs[0].type).toEqual('file');
                expect(root.fs[0].name).toEqual('art.png');
                expect(root.fs[0].location).toEqual('test_data/test_file/art.png');
                expect(root.fs[0].size).toEqual(0);
                expect(root.fs[0].fs).toNotExist();

                expect(root.fs[1].type).toEqual('file');
                expect(root.fs[1].name).toEqual('document.doc');
                expect(root.fs[1].location).toEqual('test_data/test_file/document.doc');
                expect(root.fs[1].size).toEqual(0);
                expect(root.fs[1].fs).toNotExist();

                expect(root.fs[2].type).toEqual('file');
                expect(root.fs[2].name).toEqual('photo.jpg');
                expect(root.fs[2].location).toEqual('test_data/test_file/photo.jpg');
                expect(root.fs[2].size).toEqual(0);
                expect(root.fs[2].fs).toNotExist();

                done();
            })
        });

        it('should parse recursive file structure correctly', function(done) {
            fs2json.from('test_data/test_recur', (err, fs) => {
                expect(err).toNotExist();
                expect(fs).toExist();
                expect(fs.length).toEqual(1); // test_folder
                const root = fs[0];

                expect(root.type).toEqual('directory'); // fs.type
                expect(root.name).toEqual('test_recur'); // fs.name
                expect(root.location).toEqual('test_data/test_recur'); // fs.location
                expect(root.size).toEqual(1);
                expect(root.fs.length).toEqual(1);

                expect(root.fs[0].type).toEqual('directory');
                expect(root.fs[0].name).toEqual('video');
                expect(root.fs[0].location).toEqual('test_data/test_recur/video');
                expect(root.fs[0].size).toEqual(1);
                expect(root.fs[0].fs).toExist();

                expect(root.fs[0].fs[0].type).toEqual('file');
                expect(root.fs[0].fs[0].name).toEqual('v.avi');
                expect(root.fs[0].fs[0].location).toEqual('test_data/test_recur/video/v.avi');
                expect(root.fs[0].fs[0].size).toEqual(0);
                expect(root.fs[0].fs[0].fs).toNotExist();

                done();
            })
        });
    });

});