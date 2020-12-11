import path from 'path'
import dotenv from 'dotenv'
// F:\working\study\ecmascript\auth\.env
// F:\working\study\ecmascript\auth\授权\五张表模型\server\app.js
// auth 是根目录, server是 app所在目录, 从app.js所在目录向上数 到 auth是3个, 就有 3个 /
const SECRET = dotenv.config({ path: path.resolve('../../../', '.env') }).parsed.SECRET
export {SECRET}

