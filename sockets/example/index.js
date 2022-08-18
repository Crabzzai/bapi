// Export route module
module.exports = (configs, utils, db, io, socket) => {
    obj = {};

    obj.socket = (testArg) => {
        console.log('We live under the folder example, and we is the root of example ;o', testArg);
    }

    return obj;
}