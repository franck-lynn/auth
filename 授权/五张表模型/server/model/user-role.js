// 用户角色表
import { model, Schema } from 'mongoose'

const userRoleSchema = new Schema({
    user_id: { type: String, require: true },
    role_id: { type: String, require: true },
}, { collection: "user_role" })

const UserRole = model('UserRole', userRoleSchema)
export { UserRole }