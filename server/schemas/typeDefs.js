const { gql } = require('apollo-server-express');

const typeDefs = gql`
type User {
    _id: ID
    username: String
    email: String
    bookCount: Integer
    savedBooks: [Book]
}

type Book {
    bookId: ID
    authors: [author]
    description: String
    title: String
    image: String
    link: String
}

type Auth {
    token: ID!
    user: User
}

type Query {
    me: User
}

input BookInput {
    authors: [author]
    description: String!
    title: String!
    bookId: ID!
    image: String!
    link: String!
}

type Mutation {
    login(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): Auth
    saveBook(input: BookInput): User
    removebook(bookId: ID): User
}

`;

module.exports = typeDefs;