import swaggerJsDoc from 'swagger-jsdoc';

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Store API',
            version: '1.0.0',
            description: 'API documentation for the E-commerce platform',
            contact: {
                name: 'Vipin Kumar',
                email: 'your-email@example.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000', // Change to your live URL when deployed
            },
        ],
    },
    apis: ['./index.js'], // Path to the API docs (your main file)
};

// Generate Swagger specifications
const specs = swaggerJsDoc(swaggerOptions);

// Export the specs for use in your Express app
export default specs;
