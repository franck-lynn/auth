// 判断用户有没有登录
const isAuthenticated = () => (next) => async (root, args, context, info) => {
    if (!context.currentUser) {
        throw new Error('没有登录, 抛出没有登录异常')
    }else{
        return next(root, args, context, info)
    }
}
export { isAuthenticated }