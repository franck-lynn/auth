import { composeResolvers } from '@graphql-tools/resolvers-composition'
import { User } from '../model/user'
import { Role } from '../model/role'
import { UserRole } from '../model/user-role'

const userRoleResolver = {
    Mutation: {
        addUserRole: async (_, { username, rolename }) => {
            // 根据用户名查找 id, 
            let user
            try {
                user = await User.findOne({ name: username })
            } catch (error) {
                throw new Error({ msg: "没找到这个用户" })
            }
            const user_id = user._id

            // 根据角色名查找 id
            let role
            try {
                role = await Role.findOne({ name: rolename })
            } catch (error) {
                throw new Error({ msg: "没找有设置这个角色" })
            }
            const role_id = role._id
            // 保存 
            const hasUserRole = await UserRole.find({ user_id, role_id })
            if (hasUserRole) {
                const isSuccess = hasUserRole ? false : null
                return { isMutationSuccess: isSuccess, msg: '已经设置过该用户角色, 不用再设置' }
            } else {
                const res = await UserRole.create([{ user_id, role_id }])
                const isSuccess = res ? true : false
                return {
                    isMutationSuccess: isSuccess,
                    msg: "成功设置该用户角色"
                }
            }

        }
    }
}

// 组合认证和授权
const resolversComposition = {
    // "Query.queryUsers": [isAuthenticated(), hasRole()],
    // 'Mutation.publishArticle': [isAuthenticated(), hasRole('EDITOR')]
}
// 组合解析器, 变量名是过去式
const composedResolvers = composeResolvers(userRoleResolver, resolversComposition)

// export default userResolver
export default composedResolvers