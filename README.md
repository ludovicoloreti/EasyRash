# EasyRash
Is a platform for reviewing and modifying scientific papers submitted to conferences. To submit and view a paper the format must be RASH, a special HTML format developed by University of Bologna that aims at providing an alternative for PDF papers with the final objective of enabling fast annotations for semantic web. In fact, the application supports RDF annotations and is able to read and show any metadata present in file. 

The application works in Node.js and AngularJS. 

For more information about rash visit the follwing: [website](https://github.com/essepuntato/rash)

## Guide

(1) Install all:

```
    npm install
```

(2) If necessary, modify mongo URL:
```
    config/server/database.js
```

(3) Start the server
```
    nodemon server.js
```

(4) Open the browser at this location:
```
    http://localhost:8080
```
