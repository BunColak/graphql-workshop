import { GraphQLServer } from 'graphql-yoga';
const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';
const dbName = 'graphql-workshop';

const typeDefs = `
    type Query {
        me: User!
        users(limit: Int, size: String): [User!]!
        user(email: String!): User
    }

    type Mutation {
        createUser(name: String!, email: String!, age: Int!, size: String!): User!
    }

    type User {
        name: String!
        email: String!
        age: Int!
        size: String!
    }
`;

const resolvers = {
    Query: {
        me() {
            return {
                name: 'Bünyamin Çolak',
                email: 'bunyamincolak@gmail.com',
                age: 24,
                size: 'M'
            };
        },
        async users(parent, args, ctx, info) {
            const limit = args.limit;
            const size = args.size.toUpperCase();
            if (size)
                return await ctx.db
                    .collection('users')
                    .find({ size }, { limit })
                    .toArray();
            else
                return await ctx.db
                    .collection('users')
                    .find({}, { limit })
                    .toArray();
        },
        async user(parent, args, ctx, info) {
            const email = args.email;
            return await ctx.db.collection('users').findOne({ email });
        }
    },
    Mutation: {
        async createUser(parent, args, ctx, info) {
            const userExists = await ctx.db.collection('users').findOne({ email: args.email });
            if (userExists) {
                throw new Error('User already exists');
            }

            const response = await ctx.db.collection('users').insert(args);
            const user = response.ops[0];

            return user;
        }
    }
};

MongoClient.connect(url).then(client => {
    console.log('DB connection successful');
    const server = new GraphQLServer({
        typeDefs,
        resolvers,
        context: {
            db: client.db(dbName)
        }
    });

    server.start(() => {
        console.log('Server started!');
    });
});
