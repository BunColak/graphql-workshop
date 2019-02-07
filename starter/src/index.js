import { GraphQLServer } from 'graphql-yoga';
const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';
const dbName = 'graphql-workshop';

const typeDefs = `
    type Query {
        hello: String!
    }
`;

const resolvers = {
    Query: {
        hello() {
            return 'Hello there!';
        }
    }
};


MongoClient.connect(url).then((client) => {
    console.log("DB connection successful");
    const server = new GraphQLServer({ typeDefs, resolvers, context: {
        db: client.db(dbName)
    } });

    server.start(() => {
        console.log('Server started!');
    });    
});