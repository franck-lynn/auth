// 角色表的模式文件
import { model, Schema } from 'mongoose'

const roleSchema = new Schema({
    name: { type: String, required: true }
})

const Role = model('Role', roleSchema)

export { Role }