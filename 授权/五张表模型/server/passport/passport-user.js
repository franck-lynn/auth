import { User } from '../model/user'

const getUserByEmail = async( email) => {
    return await User.findOne({email})
}

export { getUserByEmail }