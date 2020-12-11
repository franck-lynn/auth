import passport from 'koa-passport'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt"
import { getUserByEmail } from './passport-user'
// 环境变量中设置口令
import { SECRET } from '../constants'

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: SECRET // 数字签名，与生成token时的一样，不能告诉用户
}

// 使用的是邮箱进行注册, 邮箱有唯一性, initialize 是 passport 的配置部分
const initialize = (app) => {
    app.use(passport.initialize())
    // 验证用户邮箱和密码的函数
    const authenticateEmail = async (email, password, done) => {
        // console.log("02, 初始化时获取的值", email, password)
        const user = await getUserByEmail(email)
        // console.log("03, 数据库中获取的值: ", user)
        if (user === null || user === undefined) {
            return done(null, false, { message: '没有此邮箱' })
        }
        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user)
            } else {
                return done(null, false, { message: '密码错误' })
            }
        } catch (e) {
            return done(e)
        }
    }
    //! passport 使用本地验证策略, 使用 email 字段和验证邮箱和密码的函数
    passport.use(new LocalStrategy({ usernameField: 'email', session: false }, authenticateEmail))

    passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
        // console.log("解析登录后返回用户id= ", jwt_payload)
        if (jwt_payload) {
            done(null, jwt_payload)
        } else {
            done(null, false)
        }
    }))
}

// 登录时进行授权的函数, 在登录时使用
const authenticated = async (ctx) => {
    // console.log("01, 客户端传过来的参数", ctx.request.body)
    //! 1. 当登录时, 调用了这个验证函数, 首先进入这个函数
    //! 2. 接着, 进入 passport 的初始化程序, 进行邮箱和密码的验证.
    //!    邮箱, 密码验证是先通过邮箱在数据库中查找, 找到邮箱说明邮箱正确, 在比对密码, 都正确, 返回相应信息
    return await passport.authenticate('local', async (err, user /* , info, status */ ) => {
        // 传入 authenticate, 这里是 authenticateEmail 函数
        //! 3. 验证正确时传过来的只有 user, 第1个参数是 error 必须要有, user 作为第2个参数
        // console.log(`验证正确时传过来的参数只有 user--> ${user._id}-${user.name}--${user.email}-${user.password}`)
        //! 这里还需要增加一些错误处理的逻辑, 给客户端以提示.
        // https://blog.csdn.net/weixin_43352901/article/details/109132357
        //! 4. 如果有 user, 签发 token
        if (user) {
            //! 注意, 签发 token 的目标 应该是一个字符串, 而不应该是 ObjectId 对象
            // 5秒后 token 失效
            // const token = jwt.sign({ id: String(user._id) }, SECRET, { expiresIn: '1h' })
            // ctx.header.authorization = token 
            // 以对象的形式签发的 token 是动态的, 即使不设过期时间也是一样的
            // 设置过期时间的 token 必须以对象的形式签发
            const token = jwt.sign({ id: String(user._id) }, SECRET, { expiresIn: '1h' })
            // console.log("04. 签发 token", token)
            ctx.status = 200
            //! 客户端在获取到签发的 token 后, 从响应体中取出, 保存到请求头中, 
            //! 后续访问时带上这个请求头
            ctx.body = { token }
        }
    })(ctx)
}


// 把验证 token 加到 context 上下文, 这里相当于做了 认证?
const checkedToken = async (ctx) => {
    // console.log("检查的请求头", ctx.headers.authorization)
    return await passport.authenticate('jwt', async (err, user /* , info, status */ ) => {
        if (user) {
            // console.log("通过口令验证过的", user) // 可以获取到登录用户的 id
            ctx.currentUser = user
        } else {
            ctx.body = "你需要重新登录"
        }
    })(ctx)
}

export { initialize, authenticated, checkedToken }