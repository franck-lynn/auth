import path from 'path'
import Koa from 'koa'
import { ApolloServer } from 'apollo-server-koa'
import bodyParser from 'koa-body'
import session from 'koa-session'
// 处理静态文件, 静态文件夹一般放是项目文件根目录下的 public
import koaStatic from 'koa-static'
// import Router from 'koa-router'
// import { defaultFieldResolver, GraphQLScalarType } from 'graphql'
// import { Kind } from 'graphql/language'
import { SchemaDirectiveVisitor, gql } from 'apollo-server'
import { defaultFieldResolver } from 'graphql'
import { v4 as uuidv4 } from 'uuid'
// 连接 mongodb 数据库
import mongoose from 'mongoose'
import { newEnforcer } from 'casbin'
import { composeResolvers } from '@graphql-tools/resolvers-composition'
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
    type Author {
        _id: ID
        name: String @hasRole
    }
    type Mutation {
        insertAuthor(name: String): Author
    }
    type Query {
        queryAuthor: [Author]
    }
`

// 自定义标量
// const 标量名称Type = new GraphQLScalarType({
//     name: '标量名称Type',
//     description: '自定义的日期类型',
//     serialize: (value) => value.toString(), // 序列化函数, 用于将结果转换成适合 http 传输的数据类型
//     parseValue: (value) => { // 解析函数, 用于将客户端通过 variables 参数传递的数据为定义的类型
//         if (typeof value === 'string') return new Date(value)
//         throw new Error('参数类型错误')
//     },
//     // 配置中的 parseValue, parseLiteral 都用于解析客户端参数, 分别处理两种参数传递的方式
//     parseLiteral: (ast) => { // 解析函数, 将客户端传递的字面量参数解析为Date 类型
//         if (ast.kind === Kind.STRING) {
//             return ???
//         }
//         return null;
//     }
// })

const authors = [
    { _id: "004a498b-841b-4d93-93ad-d1b509f871af", name: "赵敏" }
] // 数组代表数据库
// dbInstance 代表从数据库中获取的模型和策略进行的判断
const dbInstance = (async () => {
    // 返回的是一个 promise
    const model = path.join(__dirname, './conf/rbac_model.conf')
    const adapter = path.join(__dirname, './conf/rbac_policy.csv')
    return (await newEnforcer(model, adapter))
})()

// 提取权限判断的函数
// const auth = async (root, args, context, info) => {
//     const sub = context.currentUser
//     const obj = info.fieldName
//     const act = String(info.parentType).toLowerCase()
//     const res = await (await dbInstance).enforce(sub, obj, act)
//     return res
// }
// 是登录者本人吗?
const isSelf = () => (next) => async (root, args, context, info) => {
    if (!context.currentUser) {
        throw new Error('没有登录, 抛出没有登录异常')
    }
    const sub = context.currentUser
    const obj = info.fieldName
    const act = String(info.parentType).toLowerCase()
    const res = await (await dbInstance).enforce(sub, obj, act)
    console.log("判断的结果: ", res)
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
        insertAuthor: async (root, args, /* context, info */ ) => {
            // 这是该怎样操作就怎样操作
            const author = { _id: uuidv4(), name: args.name }
            authors.push(author)
            return author
        }
        /*
          insertAuthor: async (root, args, context, info) => {
            // 这里增加权限的判断, 如果登录者是 author, 则可以插入
            // console.log(await dbInstance)  //! 要在 await dbInstance 整个加上 括号
            // console.log(String(info.parentType).toLowerCase())
            // const sub = context.currentUser //从上下文中获取的用户名或者角色
            // const obj = info.fieldName // 获取这个 insertAuthor 字段, 代表者资源
            // const act = String(info.parentType).toLowerCase() // 获取 act 的操作符名称, 代表操作
            // const res = await (await dbInstance).enforce(sub, obj, act)
            const res = await auth(root, args, context, info)
            console.log("权限判断结果: ", res)
            if (res) {
                const author = { _id: uuidv4(), name: args.name }
                authors.push(author)
                return author
            } else {
                console.log("没有权限")
            }
          }
        */
    },
    Query: {
        queryAuthor: async () => {
            return authors
        }
    }
}

const resolversComposition = {
    // 'Query.queryAuthor': [],
    'Mutation.insertAuthor': [isSelf()]
}
// 组合解析器
const composedResolvers = composeResolvers(resolvers, resolversComposition)

// 自定义 directive
class hasRoleDirective extends SchemaDirectiveVisitor {
    // ! 2-1. 复写字段
    visitFieldDefinition(field) {
        // console.log("这里复写的字段是加载在哪个字段后面就是哪一个: ", field.name)
        /*
         {
             name: 'name',
             description: undefined,
             type: String,
             args: [],
             resolve: undefined,
             subscribe: undefined,
             isDeprecated: false,
             deprecationReason: undefined,
             extensions: undefined,
             astNode: {
                 kind: 'FieldDefinition',
                 description: undefined,
                 name: { kind: 'Name', value: 'name', loc: [Object] },
                 arguments: [],
                 type: { kind: 'NamedType', name: [Object], loc: [Object] },
                 directives: [
                     [Object]
                 ],
                 loc: { start: 66, end: 87 }
             }
         }
        */
        //! 这句话的意思是如果field对象里如果有resolve值, 就用它, 没有这个值就给它一个默认的值
        //! 在 await resolve 中用到了
        const { resolve = defaultFieldResolver } = field;
        // ! 2-2. 更改 field 的 resolve function
        // field.resolve = async function(...args) {
        field.resolve = async function(...args) {
            // console.log("这里的args是: ", args)
            /*
             [
                 //! args 第1个是返回的数据, 作为resolve()函数的第1个参数 root 参数
                 { _id: 'e5299a8b-b4b9-4406-9fa4-4a8a74e9d850', name: '高圆圆' },
                 //! 第2个返回的数据作为resolve()函数的第2个参数args
                 {},
                 //! 第3个参数作为 resolve()函数的第3个参数context
                 {
                     currentUser: '高圆圆',
                     _extensionStack: GraphQLExtensionStack { extensions: [] }
                 },
                 //! 第4个参数作为 resolve() 函数的第 4个参数 info
                 {
                     fieldName: 'name',
                     fieldNodes: [
                         [Object]
                     ],
                     returnType: String,
                     parentType: Author,
                     path: { prev: [Object], key: 'name', typename: 'Author' },
                     schema: GraphQLSchema {
                         __validationErrors: [],
                         description: undefined,
                         extensions: undefined,
                         astNode: undefined,
                         extensionASTNodes: [],
                         _queryType: Query,
                         _mutationType: Mutation,
                         _subscriptionType: undefined,
                         _directives: [Array],
                         _typeMap: [Object: null prototype],
                         _subTypeMap: [Object: null prototype] {},
                         _implementationsMap: [Object: null prototype] {},
                         _extensionsEnabled: true
                     },
                     fragments: [Object: null prototype] {},
                     rootValue: undefined,
                     operation: {
                         kind: 'OperationDefinition',
                         operation: 'mutation',
                         name: undefined,
                         variableDefinitions: [],
                         directives: [],
                         selectionSet: [Object],
                         loc: [Object]
                     },
                     variableValues: {},
                     cacheControl: { setCacheHint: [Function: setCacheHint], cacheHint: {} }
                 }
             ]
            */
            // ! 2-3. 取得原先的 field resolver 的计算结果, 因为 field resolver 
            // ! 传回来的有可能是 promise 故使用 await
            /*
            resolve()函数: 
            function defaultFieldResolver(source, args, contextValue, info) {
                // ensure source is a value for which property access is acceptable.
                if ((0, _isObjectLike.default)(source) || typeof source === 'function') {
                    var property = source[info.fieldName];

                    if (typeof property === 'function') {
                        return source[info.fieldName](args, contextValue, info);
                    }

                    return property;
                }
            }
            */
           //! 这个 resolve() 函数返回的 source 也就是查询或变更返回的函数结果
           //! 这里也可以实施拦截, 进行授权
            const result = await resolve.apply(null, args)
            
            // ! 2-4. 将取得的结果再做预取的计算
            if (typeof result === 'string') {
                // 要做的事情
                console.log("得到的结果是: ", result)
                if(result === args[2].currentUser){
                    return result
                }else{
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


/*
{
    fieldName: 'insertAuthor',
    fieldNodes: [{
        kind: 'Field',
        alias: undefined,
        name: [Object],
        arguments: [Array],
        directives: [],
        selectionSet: [Object],
        loc: [Object]
    }],
    returnType: Author,
    parentType: Mutation,
    path: { prev: undefined, key: 'insertAuthor', typename: 'Mutation' },
    schema: GraphQLSchema {
        __validationErrors: [],
        description: undefined,
        extensions: undefined,
        astNode: undefined,
        extensionASTNodes: [],
        _queryType: Query,
        _mutationType: Mutation,
        _subscriptionType: undefined,
        _directives: [@cacheControl, @include, @skip, @deprecated, @specifiedBy],
        _typeMap: [Object: null prototype] {
            Author: Author,
            ID: ID,
            String: String,
            Mutation: Mutation,
            Query: Query,
            CacheControlScope: CacheControlScope,
            Upload: Upload,
            Int: Int,
            Boolean: Boolean,
            __Schema: __Schema,
            __Type: __Type,
            __TypeKind: __TypeKind,
            __Field: __Field,
            __InputValue: __InputValue,
            __EnumValue: __EnumValue,
            __Directive: __Directive,
            __DirectiveLocation: __DirectiveLocation
        },
        _subTypeMap: [Object: null prototype] {},
        _implementationsMap: [Object: null prototype] {},
        _extensionsEnabled: true
    },
    fragments: [Object: null prototype] {},
    rootValue: undefined,
    operation: {
        kind: 'OperationDefinition',
        operation: 'mutation',
        name: undefined,
        variableDefinitions: [],
        directives: [],
        selectionSet: { kind: 'SelectionSet', selections: [Array], loc: [Object] },
        loc: { start: 0, end: 65 }
    },
    variableValues: {},
    cacheControl: { setCacheHint: [Function: setCacheHint], cacheHint: { maxAge: 0 } }
}
*/