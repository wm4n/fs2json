## fs2json
A module that parses file system into JSON

### Usage
```javascript
fs2json.from('test_folder/test_file', (err, fs) => {
  
});
```

and you should get below for fs
```javascript
[
{ type: 'directory',
  name: 'test_file',
  location: 'test_data/test_file',
  size: 3,
  fs: 
   [ { type: 'file',
       name: 'art.png',
       location: 'test_data/test_file/art.png',
       size: 0 },
     { type: 'file',
       name: 'document.doc',
       location: 'test_data/test_file/document.doc',
       size: 0 },
     { type: 'file',
       name: 'photo.jpg',
       location: 'test_data/test_file/photo.jpg',
       size: 0 } ] }
]
```
