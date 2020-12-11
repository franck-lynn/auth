import path from 'path'
import Koa from 'koa'
import moment from 'moment'
// 语言环境导入
import 'moment/locale/zh-cn'
import { ApolloServer } from 'apollo-server-koa'
import bodyParser from 'koa-body'
import session from 'koa-session'
import koaStatic from 'koa-static'
import { SchemaDirectiveVisitor, gql } from 'apollo-server'
import { defaultFieldResolver } from 'graphql'
import { v4 as uuidv4 } from 'uuid'
// 连接 mongodb 数据库
import mongoose from 'mongoose'
import { newEnforcer } from 'casbin'
import { composeResolvers } from '@graphql-tools/resolvers-composition'

import pinyin from 'pinyin'
import { flatten, toUpper, reduce } from 'ramda'
const app = new Koa()
//url 带上复制集
const url = 'mongodb://localhost:27017/test?replicaSet=my_repl'
mongoose.connect(url, { useUnifiedTopology: true }, () => console.log('数据库连接成功!'))
// 错误信息, 绑定错误信息处理, 以便定位错误,
mongoose.connection.on('error', console.error.bind(console, 'mongoDB连接异常'))

const typeDefs = gql `
    # 定义新的指令 directive, 定义语句如下:
    directive @hasRole on FIELD_DEFINITION 
    # 定义查询 schema, schema 不能为空
    type Commodity {
        item_no: String
        catalog_number: String
    }
    type Contract {
        _id: ID
        contract_no: String
        detail: [Commodity]
    }
    input DetailInput {
        catalog_number: String
    }
    # 权利证明 rightCertification
    # 权利设计的乃是这样的, 所有权 owner 可以继承, 
    type rightCertification {
        _id: ID!
        createBy: String!
        owner: [String]
        sharedTo: [String]
    }
    type contractConnection {
        # 合同关联权利
        contract: Contract
        right: rightCertification
    }
    type Mutation {
        # insertContract(input: [DetailInput]): Contract # 输入商品明细, 返回一个合同
        insertContract(input: [DetailInput]): contractConnection # 输入商品明细, 返回一个合同
    }
    type Query {
        queryContract: [Contract]
        queryRights: [rightCertification]
    }
`
// 模拟数据库
const contracts = [{ _id: "004a498b-841b-4d93-93ad-d1b509f871af", contract_no: "HZHTLRY20201206-8460", detail: [{ item_no: "1", catalog_number: '2NU-CCGW060204-T' }] }] // 数组代表数据库
const users = [
    { username: "任盈盈", role: "admin", location: "北京" },
    { username: "高圆圆", role: "saler", location: "杭州" },
    { username: "周芷若", role: "manager", location: "杭州" },
    { username: "贾静雯", role: "saler", location: "上海" },
    { username: "大表姐", role: "saler", location: "苏州" },
    { username: "群姐", role: "saler", location: "合肥" },
]
const rights = []

// dbInstance 代表从数据库中获取的模型和策略进行的判断
const dbInstance = (async () => {
    // 返回的是一个 promise
    const model = path.join(__dirname, './conf/rbac_model.conf')
    const adapter = path.join(__dirname, './conf/rbac_policy.csv')
    return (await newEnforcer(model, adapter))
})()


// 工具函数 获取汉字首字母拼音, 参数为汉字中文名字
const getNameFirstLetter = (cname) => {
    const letters = pinyin(cname, { style: pinyin.STYLE_FIRST_LETTER })
    return toUpper(reduce((x, y) => x + y, '', flatten(letters)))
}
// 工具函数, 获取流水号字符串并转成数字, 只设置 4 位
const getSequence = (str) => {
    // 获取形如: HZHTLRY20201206-0060 字符串 -号后的数字, 并转成 int 类型
    const num = parseInt(str.match(/(?<=-)\d+/)[0]) + 1
    // int 类型再转成字符串并增加前导0
    return String(num).padStart(4, '0')
}
// 工具函数, 生成流水号
// 工具函数 生成合同编号
const generateContractNo = (context) => {
    const contractDate = moment().format('YYMMDD')
    const nameFirstLetter = getNameFirstLetter(context.currentUser)
    // 后期采用数据库自增id 来生成这个合同号, 这里采用数组最后一个合同的序号+1的方式
    const lastContract = contracts[contracts.length - 1].contract_no
    const sequence = getSequence(lastContract)
    return "HTHZ" + nameFirstLetter + contractDate + "-" + sequence
}

// 判断用户登录后是不是有权限操作, 权限先要在数据库中定义好
const isAuthorized = () => (next) => async (root, args, context, info) => {
    if (!context.currentUser) {
        throw new Error('没有登录, 抛出没有登录异常')
    }
    // const sub = context.currentUser // 高圆圆
    const sub = "高圆圆" // 高圆圆
    // console.log("是谁访问:", sub)
    const obj = info.fieldName // insertContract
    // console.log("要访问的资源:", obj) 
    const act = String(info.parentType).toLowerCase() // mutation
    // console.log("对资源进行什么操作? ", act)
    // 资源的创建者 createBy: [], 资源的所有者: owner: [], 资源的分享者 sharedTo: []
    const res = await (await dbInstance).enforce(sub, obj, act)
    // console.log("判断的结果: ", res)
    if (res) {
        return next(root, args, context, info)
    } else {
        throw new Error(`授权没通过, 没有权限!`);
    }
}
const resolvers = {
    // Date: DateType, // 定义的标量在 resolvers 里使用
    Mutation: {
        // 采用组合认证的方式再次分离文件
        insertContract: async (root, args, context /* , info */ ) => {
            // 这是该怎样操作就怎样操作
            // 生成合同号
            // console.log("传过来的数组", args.input)
            const contract_no = generateContractNo(context)
            const detail = []
            args.input.forEach((value, index) => {
                const { catalog_number } = value
                detail.push({ item_no: index + 1, catalog_number })
            })
            const _id = uuidv4()
            const contract = { _id, contract_no, detail }
            contracts.push(contract)
            // 在创建合同时把权利证明也制作好
            const createBy = context.currentUser
            // 根据 createBy 查找属于哪个地区, 再过滤出 管理者
            // find --> filter -->propEq
            const owner = getLocation(createBy, users)
            const sharedTo = ['合肥']
            // 把数据写入权利数组
            const right = {_id, createBy, owner, sharedTo}
            rights.push(right)
            // return contract
            return {
                contract, 
                right
            }
        }
    },
    Query: {
        queryContract: async () => {
            return contracts
        },
        queryRights: async () => {
            return rights
        }
    }
}
// 辅助函数, 通过高圆圆找到她的部门, 并将其列为资源的所有者
const getLocation = (name, users) => {
    const u = users.find(user => user.username === name)
    // const s = users.filter(user => user.location === u.location)
    // console.log("u====", u)
    // return s.map(item => item.location)
    return [u.location]
}
const isOwner = (name) => {
    const u = users.find(user => user.username === name)
    
    return false
}
const hasAuthorized = () => next => async (root, args, context, info) => {
    const currentUser = '大表姐'
    // 要查找的资源是所有合同, 提取出所有合同编号, 根据编号在权利里面查找, 看看
    // 是否有大表姐
    
    console.log(info.fieldName)
    // 如果当前登录用户是 创建者, 所有者都是可以查询的
    if(isOwner(currentUser))
        return next(root, args, context, info)
    else
        console.log('没有权限')
}
const resolversComposition = {
    // 进行查询的权限控制, 场景: 创建者可以查询, 属于该创建者的角色管理者可以查询, 平级的不可以查询
    'Query.queryContract': [hasAuthorized()],
    'Mutation.insertContract': [isAuthorized()]
}
// 组合解析器
const composedResolvers = composeResolvers(resolvers, resolversComposition)

// 自定义 directive
class hasRoleDirective extends SchemaDirectiveVisitor {
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

const server = new ApolloServer({
    typeDefs,
    resolvers: composedResolvers,
    context: async () => {
        // 可以 ctx 参数获取上下文中的 currentUser
        return {
            currentUser: '高圆圆'
        }
    },
    schemaDirectives: {
        hasRole: hasRoleDirective
    }
})
server.applyMiddleware({ app })

// 设置session
app.keys = ['super-secret-key']
app.use(session(app))

// body parser  要在路由注册之前调用
app.use(bodyParser());


// 在这个目录下的文件都可以通过服务器对外提供服务, 前端项目也会使用这个html文件, 是做为浏览器的入口文件
app.use(koaStatic(path.join(__dirname, '../public'), {
    // https://www.npmjs.com/package/koa-static
    // 配置一些选项 index: '默认起始文件.html'
    index: 'index.html'
}))

app.listen(3000, _ => {
    console.log(`Server is running at http://localhost:3000/graphql`)
})