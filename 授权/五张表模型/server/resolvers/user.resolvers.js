import { composeResolvers } from '@graphql-tools/resolvers-composition'
// import { users } from '../db/five-table'
import { isAuthenticated, hasRole } from '../auth'
import { User } from '../model/user'


const userResolver = {
    Query: {
        queryUsers: async () => {
            // return users
            return await User.find()
        },
    },

}


// 组合认证和授权
const resolversComposition = {
    "Query.queryUsers": [isAuthenticated(), hasRole()],
    // 'Mutation.publishArticle': [isAuthenticated(), hasRole('EDITOR')]
}
// 组合解析器, 变量名是过去式
const composedResolvers = composeResolvers(userResolver, resolversComposition)

// export default userResolver
export default composedResolvers