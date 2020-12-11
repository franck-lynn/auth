import { SchemaDirectiveVisitor } from 'apollo-server'
import { defaultFieldResolver } from 'graphql'
// 自定义 directive
class isRoleDirective extends SchemaDirectiveVisitor {
    // ! 2-1. 复写字段
    visitFieldDefinition(field) {
        const { resolve = defaultFieldResolver } = field;
        // ! 2-2. 更改 field 的 resolve function
        // field.resolve = async function(...args) {
        field.resolve = async function(...args) {
            const result = await resolve.apply(null, args)
            if (typeof result === 'string') {
                // 要做的事情
                // console.log("得到的结果是: ", result)
                if (result === args[2].currentUser) {
                    return result
                } else {
                    return null
                }
            }
            //! 2-5. 回传给前端最终值
            return null
        }
    }
}

export { isRoleDirective }