// Export route module
module.exports = (configs, utils, db, io, socket) => {
    obj = {};

    /**
     * Set to true if you want to use standard authentication
     * Set to false if you either dont want to use authentication or you want to use your own authentication
     */ 
    obj.auth = true;
    
    obj.socket = (...args) => {
        console.log('default Socket.io ;D', args);
    }

    return obj;
}