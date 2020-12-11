import { ApolloServer } from 'apollo-server-koa'
import { typeDefs } from '../graphql'
import { checkedToken } from '../passport/passport-initialize'
import { resolvers } from '../resolvers'
import { isRoleDirective } from '../resolvers/directives'


const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ ctx }) => {
        await checkedToken(ctx)
        const currentUser = ctx.currentUser
        return { currentUser }
    },
    schemaDirectives: {
        isRole: isRoleDirective
    }
})

export { server }