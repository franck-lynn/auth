import path from 'path'
import { newEnforcer } from 'casbin'
// dbInstance 代表从数据库中获取的模型和策略进行的判断
export const dbInstance = (async () => {
    // 返回的是一个 promise
    const model = path.join(__dirname, '../casbin/conf/rbac_model.conf')
    const adapter = path.join(__dirname, '../casbin/conf/rbac_policy.csv')
    return (await newEnforcer(model, adapter))
})()

export { isAuthenticated } from './isAuthenticated'
export { hasRole } from './hasRole'
