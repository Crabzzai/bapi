/**
 * Converts the path to a route name.
 * @param {String} path Full path to the router file
 * @returns {String}
 */
 function convertPathToRouteName(path) {
    path = pathArr = path.split('/'),
        baseName = `/`;
    for (let j = 1; j < pathArr.length; j++) {
        if (pathArr[j + 1] == 'index.js') baseName += `${pathArr[j]}/`;
        else if ((j > 1) && (j != (pathArr.length - 1))) baseName += `${pathArr[j]}/`;
        else if (pathArr.length - 2 == j && !pathArr[j].contains('.js')) baseName += `${pathArr[j]}/`;
        else if (pathArr[j] != 'index.js') baseName += `${`${pathArr[j]}`.replace('.js', '')}/`;
    }
    return baseName;
}

// Module Export
module.exports = convertPathToRouteName;