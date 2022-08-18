// Export route module
module.exports = (configs, utils, db, io, socket) => {
    obj = {};

    obj.socket = (testArg) => {
        console.log('default Socket.io ;D', testArg);
    }

    return obj;
}