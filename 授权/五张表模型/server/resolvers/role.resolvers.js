import { composeResolvers } from '@graphql-tools/resolvers-composition'
// import { users } from '../db/five-table'
import { isAuthenticated, hasRole } from '../auth'
import { Role } from '../model/role'


const roleResolver = {
    Query: {
        queryRoles: async () => {
            // return users
            return await Role.find()
        },
    },
    Mutation: {
        addRole: async (_, { name }) => {
            const hasThisRole = await Role.findOne({ name })
            if (hasThisRole) {
                return { isMutationSuccess: false, msg: '已经有这个角色, 不用再添加了' }
            } else {
                const res = await Role.create([{ name }])
                const isSuccess = res ? true : false
                return { isMutationSuccess: isSuccess, msg: '添加角色成功' }
            }
        }
    }
}


// 组合认证和授权
const resolversComposition = {
    "Query.queryRoles": [isAuthenticated() /*, hasRole() */ ],
    // 'Mutation.publishArticle': [isAuthenticated(), hasRole('EDITOR')]
}
// 组合解析器, 变量名是过去式
const composedResolvers = composeResolvers(roleResolver, resolversComposition)

export default composedResolvers