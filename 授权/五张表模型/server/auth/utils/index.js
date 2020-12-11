// import { users, user_role, roles } from '../../db/five-table'
// import { dbInstance } from './'

import { User } from '../../model/user'

// 从上下文中的登录用户获取用户角色
const getRole = async (context) => {
    // const sub = context.currentUser // 这里是已经登录后的判断
    // currentUser 里保存的是用户 id, 过期时间等对象信息, 应该通过解构解析出来
    const { id } = context.currentUser // 这里是已经登录后的判断
    //! 1. 已知了登录者, 在users 表找到该 _id, 
    // const userId = users.find(user => user.name === sub)._id
    //? 已经是用户 id 了, 不要再去数据库里去找了
    // const user = await User.findById(id)
    //! 2. 根据 user_id 在 user_role 表中找到角色 _id
    // let userRole
    // try {
    //     userRole = user_role.find(userRole => userRole.user_id === userId)
    // } catch {
    //     console.log('没有分配角色')
    // }
    // //! 3. 根据角色 role_id 在角色表中找到 角色名称
    // let r
    // try {
    //     r = roles.find(role => role._id === userRole.role_id)
    // } catch {
    //     console.log('角色库里没有找到对应的权限名称')
    // }
    // return r.name
    return "role_gm"
}
export { getRole }