// Imports
const router = require('express').Router();

// Export route module
module.exports = (configs, utils, db) => {
    obj = {};

    /**
     * Set to true if you want to use standard authentication
     * Set to false if you either dont want to use authentication or you want to use your own authentication
     */ 
    obj.auth = true;

    obj.router = () => {
        // All requests go to the root goes here
        router.all('/', (req, res) => {
            res.send('Hello World!');
        });
    
        // Return route
        return router;
    }

    return obj;
}