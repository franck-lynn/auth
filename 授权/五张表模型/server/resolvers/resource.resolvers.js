import { composeResolvers } from '@graphql-tools/resolvers-composition'
import { isAuthenticated, hasRole } from '../auth'
import { typeDefs } from '../graphql'
import { getResource } from './utils/get-resources' // node 打印 object

const allReaources = getResource(typeDefs.definitions)

// console.log("返回的list: ", a)
// console.log("打印完整信息: ", util.inspect(typeDefs.definitions, { showHidden: false, depth: null}))
const resourceResolver = {
    Mutation: {
        insertResources: async() => {
            // 把 导入的所有资源存入数据库
            
        }
    }
}
// 组合认证和授权
const resolversComposition = {
    "Query.queryRoles": [isAuthenticated() /*, hasRole() */ ],
    // 'Mutation.publishArticle': [isAuthenticated(), hasRole('EDITOR')]
}
// 组合解析器, 变量名是过去式
const composedResolvers = composeResolvers(resourceResolver, resolversComposition)

export default composedResolvers