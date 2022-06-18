// Export route module
module.exports = (configs, utils, db, socket) => {
    obj = {};

    obj.socket = (testArg) => {
        console.log('idk', testArg);
    }

    return obj;
}