// Export schema module
module.exports = () => {
    obj = {};
    
    obj.collectionName = 'tester'

    obj.validator = {
        $jsonSchema: {
            bsonType: "object",
            required: ["name", "servings"],
            additionalProperties: false,
            properties: {
                _id: {},
                name: {
                    bsonType: "string",
                    description: "'name' is required and is a string"
                },
                servings: {
                    bsonType: ["int", "double"],
                    minimum: 0,
                    description: "'servings' is required and must be an integer with a minimum of zero."
                }
            }
        }
   }

   return obj;
}