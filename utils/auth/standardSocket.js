// Export module
module.exports = (configs, utils, db, io, socket) => {
    console.log('Do socket auth check here.');
    if (socket.handshake.query["example"] === 'example') return true;
    else socket.disconnect(); return false;
}