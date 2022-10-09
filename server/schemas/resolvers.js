const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models')
const { signToken } = require('../utils/auth');

const resolvers = {
    // get a single user by id or username
    Query: {
        getSingleUser: async (parent, { user = null, params }) => {
            return User.findOne({
                $or: [{ _id: user ? user._id : params.id }, { username: params.username }],
            });
        },
        me: async (parent, context) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id })
            }
            throw new AuthenticationError('You need to be logged in!');
        }
    },
    Mutation: {
        // username, email, password
        // create a user and sign a token
        createUser: async (parent, { body }) => {
            const user = await User.create({ body });
            const token = signToken(user);
            return { token, user };
        },
        // login a user and sign a token
        login: async (parent, { body }) => {
            const user = await User.findOne({
                $or: [{ username: body.username }, { email: body.email }]
            });

            if (!user) {
                throw new AuthenticationError('Incorrect credentials')
            };

            const correctPw = await user.isCorrectPassword(body.password);
            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials')
            }

            const token = signToken(user);
            return { token, user };
        },
        // save a book to user's SavedBooks
        saveBook: async (parent, { body }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: body } },
                    { new: true, runValidators: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError('You need to be logged in!');
        },
        //  remove a book from 'savedbooks'
        deleteBook: async (parent, { params }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId: params.bookId } } },
                    { new: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError('You need to be logged in!');
        }
    }
};

module.exports = resolvers;

