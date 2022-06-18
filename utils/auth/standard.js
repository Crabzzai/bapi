// Export module
module.exports = (req, res, next) => {
    console.log('Do auth check here.');
    next();
}