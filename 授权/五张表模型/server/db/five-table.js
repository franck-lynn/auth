// 用户表
const users = [
    { _id: 'b19d3324-2347-46a5-8e38-c1de31321052', name: '任盈盈', email: 'ryy@163.com', password: '123' },
    { _id: '41bbb40e-cf1c-4b1d-8062-5318b5db3651', name: '周芷若', email: 'zzr@163.com', password: '456' },
    { _id: 'd8e19a2e-1bc9-47c3-bd79-e5f6a70d2ff4', name: '杨钰莹', email: 'yyy@163.com', password: '789' },
    { _id: 'a9760481-1a9e-4d7c-b946-7107530cb971', name: '赵敏', email: 'zm@163.com', password: '123' },
    { _id: '20f7a912-8ad1-454c-8920-4e5f617cbd07', name: '高圆圆', email: 'gyy@163.com', password: '456' },
    { _id: '7c83b470-eafc-47b9-8b35-2364e530ff4c', name: '袁紫衣', email: 'yzy@126.com', password: '126' },
    { _id: '796d26c9-0264-4f8a-a12c-716c2c577eb8', name: '程灵素', email: 'cls@163.com', password: '234' },
    { _id: '16ee804a-0741-4db2-ab44-45dc0f1819af', name: '郭襄', email: 'gx@163.com', password: '345' },
    { _id: '01cf688a-4cc5-438a-b77c-c115e6bfe0dd', name: '王语嫣', email: 'wyy@163.com', password: '789' },
]
// 角色表
const roles = [
    { _id: '71eb2a64-4411-41d2-afa6-69a8e1a388ff', name: 'role_sa' },
    { _id: 'ab5ec886-3d70-400a-acc8-62b1beeea641', name: 'role_admin' },
    { _id: '721b516f-4a61-4d7c-abc2-0e115256dc98', name: 'role_saler' },
    { _id: 'bc91263b-3e42-45d0-991e-927a57f9e088', name: 'role_secretary' },
    { _id: 'a0ca1748-5eb1-4621-ba97-0da97b03db6a', name: 'role_manager' },
    { _id: 'e32bb1aa-f440-4c96-9e68-f095604f66f3', name: 'role_gm' },
]
const user_role = [
    // 任盈盈 -- 超级管理员 superAdmin
    { _id: 'a1573113-daff-46dd-b8f0-08e93ad9459c', user_id: 'b19d3324-2347-46a5-8e38-c1de31321052', role_id: '71eb2a64-4411-41d2-afa6-69a8e1a388ff' },
    // 周芷若 -- 销售 saler
    { _id: 'fe4d6398-e671-4b53-822c-b1ee72be3b72', user_id: '1bbb40e-cf1c-4b1d-8062-5318b5db3651', role_id: '721b516f-4a61-4d7c-abc2-0e115256dc98' },
    // 杨钰莹 -- 销售 saler
    { _id: '1744f51b-1e61-44ab-bc2e-d975fb8f0a36', user_id: 'd8e19a2e-1bc9-47c3-bd79-e5f6a70d2ff4', role_id: '721b516f-4a61-4d7c-abc2-0e115256dc98' },
    // 赵敏 -- 秘书 secretary
    { _id: 'd2b12a83-42ec-4412-aced-841b6c0f45f7', user_id: 'a9760481-1a9e-4d7c-b946-7107530cb971', role_id: 'bc91263b-3e42-45d0-991e-927a57f9e088' },
    // 高圆圆 -- 总经理 generalManager
    { _id: '93079bf2-f859-416f-84d8-e8ce6453ed50', user_id: '20f7a912-8ad1-454c-8920-4e5f617cbd07', role_id: 'e32bb1aa-f440-4c96-9e68-f095604f66f3' },
    // 袁紫衣 -- 管理员 admin
    { _id: '84f4c69f-1238-45f6-8207-b69781edbf2b', user_id: '7c83b470-eafc-47b9-8b35-2364e530ff4c', role_id: 'ab5ec886-3d70-400a-acc8-62b1beeea641' },
    // 程灵素
    { _id: '27e4f0be-296a-4057-ba2c-ae4f764053dc', user_id: '796d26c9-0264-4f8a-a12c-716c2c577eb8', role_id: '721b516f-4a61-4d7c-abc2-0e115256dc98' },
]
// 权限表
const permissions = [
    { _id: '44276c63-697a-42ef-9c87-e9800f0a9822', permission_identifier: 'query' },
    { _id: '16abb779-6abc-4fdd-aaa1-f444f81777dc', permission_identifier: 'mutation' },
    // { _id: 'f5439681-2d7f-4230-96d4-a68f77ce990e', permission_identifier: '' },
    // { _id: 'b9e2f8b1-d822-439e-98c4-142e5fdbe2a7', permission_identifier: '' },
    // { _id: '170a7b3f-0de3-48c3-9892-0ae8af484ca1', permission_identifier: '' },
    // { _id: '1215a812-d98c-41cb-9e03-ad03ff8fed3d', permission_identifier: '' },
    // { _id: '97c592af-b97a-4dce-8057-e1d65700a335', permission_identifier: '' },
    // { _id: '1c293a32-1600-42b7-9260-bd9d4abb1efa', permission_identifier: '' },
]
// 角色权限表
const role_promission = [
    // 超级管理员 query, mutaion
    // { _id: '33e549a9-d4ec-46ce-94fe-4584459eb98d', role_id: '71eb2a64-4411-41d2-afa6-69a8e1a388ff', permission_id: '44276c63-697a-42ef-9c87-e9800f0a9822', },
    // { _id: '176c9a33-64ac-4b68-b818-2081050763f6', role_id: '71eb2a64-4411-41d2-afa6-69a8e1a388ff', permission_id: '16abb779-6abc-4fdd-aaa1-f444f81777dc', },
    // { _id: '8c575c5b-8ae2-41b4-9a87-53175c844db5', role_id: '71eb2a64-4411-41d2-afa6-69a8e1a388ff', permission_id: '', },
    // { _id: '070c1711-aa0d-4707-855a-4f73676bcf93', role_id: '71eb2a64-4411-41d2-afa6-69a8e1a388ff', permission_id: '', },
    // 管理员 query, mutaion
    { _id: 'f400617b-e6aa-4f5e-a305-cdcd6819cfd9', role_id: 'ab5ec886-3d70-400a-acc8-62b1beeea641', permission_id: '44276c63-697a-42ef-9c87-e9800f0a9822', },
    { _id: '84399038-bc55-462d-9600-783d73ff6ccf', role_id: 'ab5ec886-3d70-400a-acc8-62b1beeea641', permission_id: '16abb779-6abc-4fdd-aaa1-f444f81777dc', },
    // { _id: '54fd4fc6-3f72-4983-8e5b-e33eb0c5d053', role_id: 'ab5ec886-3d70-400a-acc8-62b1beeea641', permission_id: '', },
    // 秘书 
    // { _id: 'b70c28d5-84a8-46ee-8a43-89fcb6e94be3', role_id: 'bc91263b-3e42-45d0-991e-927a57f9e088', permission_id: '', },
    // { _id: '82e9b19a-bc25-4995-b02f-28192d37a0dd', role_id: 'bc91263b-3e42-45d0-991e-927a57f9e088', permission_id: '', },
    // { _id: '888232d2-ba15-46d1-8b97-e084c91e9fbd', role_id: 'bc91263b-3e42-45d0-991e-927a57f9e088', permission_id: '', },
    // 销售 query, mutaion
    { _id: 'a4abeb67-b9e9-46a5-b975-a0edf0883927', role_id: '721b516f-4a61-4d7c-abc2-0e115256dc98', permission_id: '44276c63-697a-42ef-9c87-e9800f0a9822', },
    { _id: '216927e0-2b46-4920-aea5-007266a53dd3', role_id: '721b516f-4a61-4d7c-abc2-0e115256dc98', permission_id: '16abb779-6abc-4fdd-aaa1-f444f81777dc', },
    // // 经理
    // { _id: '3864be81-cdbe-48a2-9503-0c94de6d79b4', role_id: 'a0ca1748-5eb1-4621-ba97-0da97b03db6a', permission_id: '', },
    // { _id: '3c2a6941-a0d3-4e69-845c-6cacc02e47dd', role_id: 'a0ca1748-5eb1-4621-ba97-0da97b03db6a', permission_id: '', },
    // { _id: '7aa63c7c-53fd-4ebd-a383-21fbca8af873', role_id: 'a0ca1748-5eb1-4621-ba97-0da97b03db6a', permission_id: '', },
    // { _id: 'bc6538b9-9ba9-42d4-a4f1-fa599eddbd5e', role_id: 'a0ca1748-5eb1-4621-ba97-0da97b03db6a', permission_id: '', },
    // // 总经理
    // { _id: '68145e91-e6e6-40bc-a53c-868e922c68b3', role_id: 'e32bb1aa-f440-4c96-9e68-f095604f66f3', permission_id: '', },
    // { _id: 'd3b7ca47-e5ef-4090-8559-c3211a17ccbd', role_id: 'e32bb1aa-f440-4c96-9e68-f095604f66f3', permission_id: '', },
    // { _id: '0f99898c-3f4c-4722-92fe-28ee966a228d', role_id: 'e32bb1aa-f440-4c96-9e68-f095604f66f3', permission_id: '', },
    // { _id: 'a466f3ef-5b24-484f-b81b-8b7970bd73f9', role_id: 'e32bb1aa-f440-4c96-9e68-f095604f66f3', permission_id: '', },
]
export { users, roles, user_role, role_promission, permissions }