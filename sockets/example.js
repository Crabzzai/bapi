// Export route module
module.exports = (configs, utils, db, io, socket) => {
    obj = {};

    obj.namespace = '/';

    obj.socket = (testArg) => {
        console.log('idk', testArg);
    }

    return obj;
}