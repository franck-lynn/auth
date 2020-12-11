
/** 
 * Created by franck.lynn on 2020-12-10.
 * lry_demry@163.com 
 * filename:  resource.resolvers 
 * 递归读取 typeDefs 中的 schema 定义的数据类型名称以及下面的字段(函数或者字段)
 * 代表者资源, 如果字段上有指令, 也带上这个指令, 作为资源的字符串, 返回的数据如下:
 * 'Policy.role_id',
 * 'Policy.resource_id',
 * 'Policy.act_id',
 * 'Resource.name',
 * 'Role.name',
 * 'Query.queryRoles',
 * 'Query.queryUsers',
 * 'Mutation.addRole',
 * 原始的数据形状另附文件说明
 * picks 是过滤的字段, 只选取指定的 Query, Mutation 字段, 其他的都不处理
 * (data, list = [], prev, picks = ['Query', 'Mutation'], deep = 0)
 */
const getResource = (data, picks, list = [], prev, deep = 0) => {
    // let value, fields, directives
    for (let i = 0; i < data.length; i++) { // 先循环最外层的数组
        let value, fields, directives
        if (data[i].name) { // 假设第1条数据 name 属性存在 
            if (data[i].name.value !== '_id') { // 排除 _id 的字段
                //! 0-1-1. 取出定义的类型值 IsRole
                //! 0-2-1. 取出定义的类型值 User
                //? 递归的下一级 第0个字段是 _id, 跳过
                //?  递归的下一级 第1个字段是 name
                //?  递归的下一级 第2个字段是 email, 其他同理可得
                value = data[i].name.value
                // console.log(`第 ${deep} 级的value= ${value} ---- ${data[i].kind}`)
            }
            //! 因为 导入的 gql 会生成一个操作符的字段, 像 Query 和 Mutation 是计划单列的
            //! 还要排除掉这个字段, 由于 计划单列 单列字段没有name属性, 在 data[i].name 判断中已经排除了.
            //! 那么 数组中最后一个怎么会循环2次呢, 原因是排除掉了字段, 但是 数组的长度还是没有变,
            //! 递归的次数还是按照数组的长度, 导致最后一个循环2次
            //! 解决办法: let value, fields, directives 放在循环体内部就可以了 😄
            // if(!deep && data[i]){
            //     console.log(deep, data[i].kind)
            //     if (data[i].operationTypes) {
            //         // console.log("计划单列项--> ", data[i].operationTypes[0].kind, data[i].operationTypes[0].kind)
            //          console.log(data[i].operationTypes)
            //         value = null
            //     }
            // }
        }

        if (data[i].fields) { // 类型下面有一些字段
            //! 0-2-2. User 下有子字段 _id, name, email, password, 取出子字段
            //? name 字段没有 子fields, 跳过
            //? email 字段没有 子fields, 跳过
            fields = data[i].fields
        }
        /* 
            if (!deep && picks && !picks.includes(value)) {
                // !deep 指的是最外层, 是 第 0 层
                // 如果过滤值存在, 并且不是指定的字段, value 值设置为 null 
                value = null
            }
         */
        if (data[i].directives && data[i].directives.length > 0) {
            //! 0-2-3. directives 不为空, 取出 指令 数组并组装成字符串 directives
            //? name 字段没有 directives , 跳过
            //? email 字段有 directives , 组装成字符串: 'isRole'
            // 把 directives 指令 数组转成字符串
            directives = data[i].directives.reduce((pre, curr) => pre + curr.name.value, '')
            // console.log(`第 ${deep} 级的 directives = ${directives}`)
        }
        //! 0-2-4. fields 是数组且不为空, value=User, 进入
        //? name 没有 fields, 跳过
        //? email 字段没有 fields, 跳过
        if (Array.isArray(fields) && fields.length > 0 && value) { // 如果字段下面还有字段, 递归读取
            // console.log(`第 ${prev} 层: `, value)
            //! 0-2-5. 赋值后 prev=User
            prev = value // 把上一层的字段保存到下一层
            // console.log(`第 ${deep} -- ${prev} 层: `, value)
            //! 0-2-6. 进入递归, 数组 data 变成 fields 字段, deep + 1, 进入下一级
            getResource(fields, picks, list, prev, deep + 1)

        } else {
            //! 0-1-2. prev 刚开始为空, isRole 字段被抛弃, 因为是指令, 符合预期
            //? prev=User, value=name, 注入数组, user.name
            //? prev=User, value=email 
            if (value && prev) { // 排除掉空的字段, 即使是 空数组也会当成一个对象判断为真
                if (directives) {
                    //? directives=isRole, 注入数组: User.email.isRole
                    list.push(prev + "." + value + "." + directives)
                    //! 查到原因了, 这里的 directive 要置空, 这样才不会出现 
                    //! 在 email 字段设置的指令会传递到 password 字段
                    directives = null
                } else {
                    list.push(prev + "." + value)
                    value = null
                }
            }
        }
    }
    //? 返回数组 ['user.name']
    //? 返回数组: ['user.name', 'User.email.isRole]
    return list
}
export { getResource }