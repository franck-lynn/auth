* 参照如下示例:
* https://hasura.io/docs/1.0/graphql/core/auth/authorization/common-roles-auth-examples.html#auth-examples

users 表
_id|name|profile|createAt
:---:|:---:|:---:|:---:
ID|String|String|timestamp

articles 表
_id|title|author_id|is_reviewed| review_comment |is_published |editor_rating 
:---:|:---:|:---:|:---:|:---:|:---:|:---:
ID|String|ID(关联users id)|Boolean(默认 false)是否可评论|String|Boolean(默认false)|Int

reviewers 表
users 表
_id|article_id|reviewer_id
:---:|:---:|:---:
ID|ID(关联articles id)|String(关联users id)

editors 表
_id|editor_id
:---:|:---:
ID|ID(editor_id)

分析这个表格  

    文章与评论者中间表是一对多的关系, reviewers 表持有一个文章id和reviewer的id
    这是一张中间表.
```mermaid 
graph LR
article文章--1:1 or 1:m-->reviewers评论者中间表;
```
    同样的, reviewers 中间表与 users 表之间也是多对一的关系
article --> reviewers  

    权限
    以下是基于上述架构的表的访问控制要求的示例摘要：articles


    表的列article	    作者	        评论家	       编辑者
                    插入	选择	更新	选择	更新	选择
    Id	            ✔    	✔	   ✖	  ✔	      ✖	     ✔
    标题	        ✔	    ✔	   ✔	   ✔	   ✔	 ✔
    author_id	    ✔*	    ✔	   ✖	   ✔	   ✖	 ✔
    is_reviewed	    ✖	    ✔	   ✔	   ✔	   ✔	 ✔
    review_comment	✖	    ✔	   ✔	   ✔	   ✖	 ✔
    is_published	✖	    ✔	   ✖	   ✔	   ✔	 ✔
    editor_rating	✖	    ✖	   ✖	   ✖	   ✔	 ✔
* * 需要的其他限制，以确保具有该角色的用户只能提交自己的文章，即应与用户的  ID 相同。authorauthor_id
 
角色权限 author  
    对于 author, 仅限制对某些列的访问, 可以隐式自动获取 author id 插入数据库
    不需要显式的行级权限, 因为该角色经过验证后就能执行插入等操作
    仅限制对某些列的访问: 










































