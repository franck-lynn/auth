import Router from 'koa-router'
import bcrypt from 'bcryptjs'
import { User } from '../model/user'
import { authenticated } from '../passport/passport-initialize'

const userRouter = new Router()

// 登录时 用的是 passport-jwt 和 passport-local
userRouter.post('/login', authenticated)

// 注册时是这个程序单独处理的, 没有用到 passport
userRouter.post('/register', async (ctx) => {
    // 注册的时候, 客户端要传过来用户信息, 通过 ctx.request.body
    const { name, email, password } = ctx.request.body
    // 在数据库里查找
    const hasEmail = await User.findOne({ email })
    if (hasEmail) { // 要用return, 否则继续往下走
        return ctx.body = { msg: '已经注册过了' }
    }

    // 如果没有注册过, 对密码明文进行加密加盐
    const pwd = await bcrypt.hash(password, 12)
    // 生成用户对象
    const user = new User({
        name,
        email,
        password: pwd
    })
    ctx.body = await user.save()
})


export { userRouter }