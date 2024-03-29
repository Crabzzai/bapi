// Imports
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cron = require('node-cron');
const http = require('http');
const server = http.createServer(app);
const fs = require('fs');
const path = require('path');

/**
 * Get locations of all files inside a directory. It searches through all subdirectories too.
 * Shorten your searching by specifying specific file extensions.
 * @param {String} dirPath Full path to the parent directory
 * @param {Undefined | String | Array<String>} extname The extension of seeking file name, for example '.js'
 * @returns {Array<String>}
 */
 function getFileLocations(dirPath, extname) {
    files = fs.readdirSync(dirPath);

    arrayOfFiles = [];

    files.forEach(file => {
        if (fs.statSync(`${dirPath}/${file}`).isDirectory()) arrayOfFiles = [...arrayOfFiles, ...getFileLocations(`${dirPath}/${file}`, extname)]; 
        else if ((((extname != null) && ((Array.isArray(extname) && ((extname.includes(path.extname(file)) || (extname.filter((el) => {return (/^\s*$/.test(String(el))) == false}).length == 0))))) || (path.extname(file) == extname))) || (extname == null || /^\s*$/.test(String(extname)))) arrayOfFiles.push(`${dirPath}/${file}`);
    });

    return arrayOfFiles;
}

/**
 * Get all files inside the directory 'configs' and store them in an object and remove the extension.
 */
let configs = {};
getFileLocations('configs', '.json').forEach(file => {
    configs[file.replace('configs/', '').replace('/', '.').replace('.json', '')] = require(`${__dirname}/${file}`);
});

/**
 * Get all files inside the directory 'utils' and store them in an object and remove the extension.
 */
let utils = {};
getFileLocations('utils', '.js').forEach(file => {
    utils[file.replace('utils/', '').replace('/', '.').replace('.js', '')] = require(`${__dirname}/${file}`);
});
utils.getFileLocations = getFileLocations;

// Server setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS setup
app.use(utils.allowCrossDomain); // for allowing cross origin requests

// Main async thread
(async () => {
    // Database setup
    db = {};
    console.log(configs.database.enabled ? 'Database is enabled' : 'Database is disabled');
    if (configs.database.enabled) {
        let databaseHost = `${configs.database.host}:${configs.database.port}`,
            connectOptions = configs.database.username != '' ? `${configs.database.username}:${encodeURIComponent(configs.database.password)}@${databaseHost}` : databaseHost,
            url = `mongodb://${connectOptions}/admin?retryWrites=true`;
        utils.database(url, async (db_err, client) => {
            database = client.db(configs.database.db_name),
            collections = await database.collections();

            //To make validations for all collections and modify them if they is changed.
            let schemas = getFileLocations(`utils/schemas`, '.js');
            let newSchemasExists = false;
            for (let schema of schemas) {
                let _schema = require(`${__dirname}/${schema}`)();
                if (collections.some(col => col.collectionName == _schema.collectionName)) {
                    database.command({
                        collMod: _schema.collectionName,
                        validator: _schema.validator
                    });
                } else {
                    database.createCollection(_schema.collectionName, {
                        validator: _schema.validator
                    });
                    newSchemasExists = true;
                }
            }
            
            //To get the created collections by schemas, if they doesn't exists in the old collections variable.
            if (newSchemasExists) collections = await database.collections();
            console.log('Collections: '+collections.map(x => x.collectionName))
            
            for (let collection of collections) {
                db[collection.collectionName] = collection;
            }

            console.log('Database connected!');
        });
    }

    // Load API routes
    let routes = getFileLocations(`routes`, '.js');
    console.log('Loading routes...');
    routes.forEach(routePath => {
        let route = require(`${__dirname}/${routePath}`)(configs, utils, db),
            routeName = utils.convertPathToRouteName(routePath),
            router = route.router();
        if (route.auth) app.use(`${routeName}`, utils['auth.standard'], router);
        else app.use(`${routeName}`, router);
        router.stack.forEach((stack) => {
            let routePath = stack.route.path == '/' ? routeName : `${routeName}${stack.route.path.slice(1)}/`,
                routeMethods = stack.route.methods,
                routeMethod = routeMethods._all ? 'ALL' : routeMethods.get ? 'GET' : routeMethods.post ? 'POST' : routeMethods.put ? 'PUT' : routeMethods.delete ? 'DELETE' : routeMethods.options ? 'OPTIONS' : 'UNKNOWN';
            console.log(`${routeMethod}: ${routePath}`);
        });
    });
    console.log('Routes loaded.');

    // Socket.io setup
    console.log(configs.socket.server.enabled ? 'Socket.io is enabled' : 'Socket.io is disabled');
    if (configs.socket.server.enabled) {
        const io = require('socket.io')(server);
        let sockets = getFileLocations(`sockets`, '.js');        
        let namespaces = sockets.map(x => utils.convertPathToRouteName(x));
        namespaces.forEach((namespace) => {
            io.of(namespace).on('connection', async socket => {
                sockets.forEach(socketPath => {
                    let socketFile = socketPath.split('/').pop()
                    let socketObj = require(`${__dirname}/${socketPath}`)(configs, utils, db, io, socket);
                    socket.on(socketFile === 'index.js' && utils.convertPathToRouteName(socketPath) === namespace ? '/' : socketFile.slice(0, -3), async (...args) => {
                        if (socketObj.auth && !utils['auth.standardSocket'](configs, utils, db, io, socket)) return;
                        await socketObj.socket(...args);
                    });
                });
            });
        })
    }

    // Loading automatic tasks
    let tasks = getFileLocations(`tasks`, '.js');
    console.log('Loading tasks...');
    tasks.forEach(taskPath => {
        let task = require(`${__dirname}/${taskPath}`)(configs, utils, db);
        if (task.enabled) {
            cron.schedule(task.cron, async () => {
                await task.execute();
            });
        }
    });
    console.log('Tasks loaded.');

    // Listen server
    let web_server = configs.main.web_server;
    server.listen(web_server.port, web_server.host, () => {
        console.log(`Server is listening on ${web_server.host}:${web_server.port}`);
    });

    // Export app
    module.exports = app;
})();