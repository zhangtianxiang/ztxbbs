用户前缀 users/
社区前缀 community/
管理前缀 manage/

增加点赞功能
增加收藏功能

所有需要参数的地方是因为可能访问非当前用户的对应页面

注册
    注册页 get /users/signup
    注册确认动作 post /users/signup

登录
    登录页 get /users/signin
    登陆确认动作 post /users/signin

登出
    登出确认动作 get /users/signout

导航栏
    论坛 url /community/forums
    动态 url /community/dynamic
    消息 url /community/message
    ———
    搜索 url /search
    头像（个人资料） url /users/:uid
        好友 url /users/friends
            // 好友信息不公开
        设置 url /users/:uid/edit
            // 这里的uid是必要的，因为管理员可以修改其他人信息

主页
    重定向 get /  ==> /community/forums
    重定向 community/ ==> /community/forums

论坛
    板块总页 get /community/forums 包含所有无父节点的板块

动态
    动态页 get /community/dynamic 动态
    关注好友的发帖
    关注好友关注了谁
    关注帖子的动态
    谁关注了我

消息
    消息页 get /users/message/
    子页
        无法回复的信息
            回复我的
            @我的
            系统消息
        可以回复的信息
            聊天信息列表
    消息详情页 get /users/message/:mid
    消息已阅动作 get /users/message/:mid/read
    消息未读动作 get /users/message/:mid/unread
    消息删除动作 get /users/message/:mid/remove
    消息回复页 get /users/message/create?reply_message_id=XXX
        // 当reply的message的to是自己且from非空时，以reply信息填写页面模板
        // 否则message to由用户填写
    消息发送动作 post /users/message/create
        // 一条消息传入时包括 to,content
        // 服务器加上from为自己。

板块
    板块发表页 get /community/forums/create?forum_id=XX 可指定父节点
        // 直接将forum_id=XX存放到forum的action中
    板块发表动作 post /community/forums/create?forum_id=XX 可指定父节点
        // 需要对父节点是否存在环判断是否可取，否则应当报错。需要判断权限。
    板块页（三种显示级别） get /community/forums/:fid
                // 带:fid的应当放在后面，不然路由会被捕获
    板块修改页 get /community/forums/:fid/edit
    板块修改动作 post /community/forums/:fid/edit
    板块删除动作 get /community/forums/:fid/remove

主题
    主题页 get /community/forums/topics/:tid
    主题发表页 get /community/forums/topics/create?forum_id=XX
        // 将forum_id插入到forum的action中
    主题发表动作 get /community/forums/topics/create?form_id=XX  必须指定板块
    主题修改页  get /community/forums/topics/:tid/edit
    主题修改动作 post /community/forums/topics/:tid/edit
    主题删除动作 get /community/forums/topics/:tid/remove
    主题关注动作 get /community/forums/topics/:tid/watch // 直接back
    主题取消关注动作 get /community/forums/topics/:tid/unwatch // 直接back
    // 还有点赞与收藏操作。

评论
    评论发表动作 post /community/forums/topics/comments/create?topic_id=XX
    评论修改页   直接建在页面上
    评论修改动作 post /community/forums/topics/comments/:cid/edit
    评论删除动作 post /community/forums/topics/comments/:cid/remove

资料
    资料页      get /users/:uid
    资料修改页   get /users/:uid/edit
    资料修改动作 post /users/:uid/edit
    管理员修改用户页 get /users/:uid/adminedit
                 post /users/:uid/adminedit
            修改用户的权限以及badge

好友
    好友页 get /users/friends
    *在线好友页 
    我关注的页
    关注我的页
    黑名单页     get /users/friends/backlist
    关注动作     get /users/:uid/follow
    取消关注动作  get /users/:uid/unfollow
    拉黑动作     get /users/:uid/ban
    取消拉黑动作  get /users/:uid/unban

管理
    论坛状态页      get /manage/status
    论坛配置页      get /manage/settings
    修改论坛配置页   get /manage/settings/modify
    修改论坛配置动作 post /manage/settings/modify
    系统通知页   get /manage/notices
    新建通知页   get /manage/notices/create
    新建通知动作 post /manage/notice/create
    通知详情页   get /manage/notices/:nid
    广播        get /manage/notice/:nid/broadcast
    修改用户的权限与badge配置 用户管理员可以操作
    修改版块页配置           版块管理员可以操作的事情
    修改帖子页配置           帖子管理员可以操作的事情

===============================================================================

路由汇总

users的目的是它可以单独拿出去给oj使用
因此可以拿出论坛去用的尽量给users，例如signin，friends，message
可选参数用问号？XXX=XXX，指定参数用路径

主页
    重定向 get /  ==> /community/forums

// 所有加uid是为了区别不同人，只有当前用户时，不用uid

users:
    signup:
        注册页 get /users/signup ok
        注册确认动作 post /users/signup ok
    signin:
        登录页 get /users/signin ok
        登陆确认动作 post /users/signin ok
    signout:
        登出 get /users/signout ok
    message:
        消息页 get /users/message/
        消息详情页 get /users/message/:mid
        消息已阅动作 get /users/message/:mid/read
        消息未读动作 get /users/message/:mid/unread
        消息删除动作 get /users/message/:mid/remove
        回复消息 get /users/message/:mid/reply
        发起消息页 get /users/send_message?reply_message_id=XX
        发起消息 post /users/send_message?reply_message_id=XX
        <!-- 消息回复页 get /users/message/:mid/reply?reply_message_id=XXX
        // 当reply的message的to是自己且from非空时，以reply信息填写页面模板
        // 否则message to由用户填写 -->
        <!-- 消息发送动作 post /users/message/create
        // 一条消息传入时包括 to,content
        // 服务器加上from为自己。 -->
    friends
        好友页 get /users/friends
        黑名单页     get /users/friends/backlist
    *用户列表？ get /users/
    资料页      get /users/:uid ok 最近发帖
    资料修改页   get /users/:uid/edit ok
    资料修改动作 post /users/:uid/edit ok
    // 管理员修改用户页 get /users/:uid/admin_edit
    //             post /users/:uid/admin_edit
    关注动作     post /users/follow?user_id=XXX  ok
    取消关注动作  post /users/unfollow?user_id=XXX  ok
    拉黑动作     post /users/ban?user_id=XXX  ok
    取消拉黑动作  post /users/unban?user_id=XXX  ok

community:
    重定向 community/ ==> /community/forums ok
    forums:
        topics:
            comments:
                评论发表动作 post /community/forums/topics/comments/create_comment?tid=XXX&&reply_id=XXX
                评论修改动作 post /community/forums/topics/comments/:cid/edit
                评论删除动作 post /community/forums/topics/comments/:cid/remove
            主题发表页 get /community/forums/topics/create_topic?forum_id=XXX
            主题发表动作 post /community/forums/topics/create_topic?forum_id=XXX
            主题页 get /community/forums/topics/:tid
            评论修改页   直接建在页面上用ajax
            主题修改页  get /community/forums/topics/:tid/edit
            主题修改动作 post /community/forums/topics/:tid/edit
            主题删除动作 get /community/forums/topics/:tid/remove
            主题关注动作 get /community/forums/topics/:tid/watch// back
            主题取消关注动作 get /community/forums/topics/:tid/unwatch// back
            *// 还有点赞与收藏操作。
        板块总页 get /community/forums 包含所有无父节点的板块 ok
        板块发表页 get /community/forums/create_forum?forum_id=XXX ok
        板块发表动作 post /community/forums/create_forum?forum_id=XXX ok
        板块页（三种显示级别） get /community/forums/:fid ok
        // 带:fid的应当放在后面，不然路由会被捕获
        // 需要对父节点是否存在环判断是否可取，否则应当报错。需要判断权限。
        // 上一条作废，不提供修改父节点的机会
        板块修改页 get /community/forums/:fid/edit   ok
        板块修改动作 post /community/forums/:fid/edit  ok
        板块删除动作 post /community/forums/:fid/remove  ok
    dynamic:
        动态页 get /community/dynamic


manage
管理
    论坛状态页      get /manage/status
    论坛配置页      get /manage/settings
    修改论坛配置页   get /manage/settings/modify
    修改论坛配置动作 post /manage/settings/modify
    系统通知页   get /manage/notices
    新建通知页   get /manage/notices/create
    新建通知动作 post /manage/notice/create
    通知详情页   get /manage/notices/:nid
    广播        get /manage/notice/:nid/broadcast
    修改用户的权限与badge配置 用户管理员可以操作
    修改版块页配置           版块管理员可以操作的事情
    修改帖子页配置           帖子管理员可以操作的事情

==============================================================================
视图设计：

导航栏
    未登录
    - home
    
    - signin
    - signup

    已登录
    - home
    - dynamic
    - message

    - search
    - head
        - profile
        - settings
        - friends
        - signout

    root
    - home
    - dynamic
    - message
    - manage

    - search
    - head
        - profile
        - settings
        - friends
        - signout

notification
主内容
pagefooter


数据库模型设计 \[\]表示外键

约定：
User_0不允许删除
Forum_0不允许删除

表
User:
    _id                 // 主键
    // 用户编写
    name                // 用户名用于登录，不可修改，不可重复
    nickname            // 用于显示，初始赋值为name
    password            // 登录密码
    email               // 邮箱 也可用于登录
    sex                 // 性别
    birthday            // 生日
    website             // 个人主页
    country             // 国家
    city                // 城市
    description         // 一句话描述
    raw_introduction    // 个人介绍 markdown
    raw_signature       // 签名档 默认为空 markdown
    avatar              // 头像
    cover               // 个人主页封面
    // 用户管理员可修改
    authority_user      // 普通权限
        1<<0  ban       // 禁止一切操作。
        1<<1  not_confirmed
        // 未确认邮箱，禁止一切除登录外的操作。邮箱必须唯一且不能修改。
    authority_admin     // 管理权限
        1<<0  manage_all    // root 的任意权限，可以管理其他人的权限
        1<<1  manage_admin  // 管理管理员的权限
        1<<2  manage_sys    // 管理系统配置
        1<<3  manage_notice // 发送系统通知
        1<<4  manage_user   // 管理用户的普通权限
        1<<5  manage_forum  // 管理板块
        1<<6  manage_topics // 管理帖子与评论
        // 没有将role独立出来
    // 系统生成
    introduction        // 个人介绍
    signature           // 签名档 默认为空
    register_time       // 注册时间
    last_login_time     // 上次登陆时间
    count_topics        // 发表帖子数量
    count_followers     // 多少人关注着ta
    count_followings    // ta关注着多少人
    // 一对多关系，在对应模型表示为外键
    Relationships:
        topics          // ta发表的帖子们
        forums          // ta创建的板块们
        comments        // ta发表的评论们
        messages        // ta发送的与接收到的消息们
        notices         // ta接受到的系统信息们

Forum:
    _id                 // 主键
    // 板块管理员编写
    title               // 板块名
    description         // 一句话描述
    authority_topic     // 发帖权限 0 无限制 1 onlyadmin管理员发帖 2 lock:禁止发帖
    cover               // 板块封面图
    sticky              // 本板块是否在父板块中置顶
    // 系统生成
    user_id             // 板块创建者  板块不因创建者被删而删
    [forum_id]          // 板块父节点  板块会因为父板块被删而删
    last_reply_time     // 最后回复时间
    last_reply_nickname // 最后回复的人
    last_reply_uid      // 最后回复的人的id
    last_reply_topic
    last_reply_tid
    // 直接存nickname，因为查询会影响效率。
    count_topics      + //
    Relationships:
        topics          // 板块下的帖子们
        forums          // 板块下的子板块们

Topic:
    _id                 // 主键
    // 发帖者编写
    title               // 主题名
    raw_content         // markdown
    // 帖子管理员编写
    authority_comment   // 0 无限制 1 管理员回复 2 禁止回复
    cover               // 封面
    sticky              // 置顶
    // 系统生成
    create_time         // 创建时间
    content             // 内容
    [user_id]           // 主题发布者id 主题不会因发布者被删而删
    nickname            // 主题发布者当时的名字
    [forum_id]          // 主题归属板块 板块删除则主题也删除
    last_reply_time     // 最后回复时间
    last_reply_nickname // 最后回复的人
    last_reply_uid      // 最后回复的人的id
    last_edit_time      // 最后编辑时间
    count_edit          // 编辑次数
    count_view          // 阅读数量
    count_reply         // 回复数量
    count_watch         // 被关注数量
    count_collect       // 被收藏的数量
    count_vote          // 被评价: 负到一定程度就会被50%透明，再一定程度就折叠
    Relationships:
        comments        // 主题下的评论

Comment:
    _id                 // 主键
    // 评论者编写
    raw_content         // markdown
    // 系统生成
    content             // 内容
    abstract            // 摘要
    create_time         // 创建时间
    nickname            // 发布者的__当时__的昵称
    [user_id]           // 归属人  发布者被删不会删comment
    [topic_id]          // 归属主题 主题被删则comment被删
    reply_uid           // 回复的人的id 只存储 不修改
    reply_nickname      // 回复的人__当时__的昵称
    reply_abstract      // 回复的摘要
    last_edit_time      // 最后编辑时间
    count_edit          // 编辑次数
    count_vote          // 被评价

Message:
    _id                 // 主键
    // 用户编写
    raw_content         // markdown
    [user_id]           // 属于人
    // 系统生成
    content             // 渲染后内容
    abstract            // 摘要
    create_time         // 创建时间
    type                // type=0 发送出去 type=1 接收到
    other_id            // 对方id
    other_nickname      // 对方昵称
    other_avatar        // 对方头像
    read                // 是否已读 type=1时有效
    // 一对一消息，应当从复制成两份，这样互不干扰

Notification:
    _id                 // 主键
    // 管理员编写
    raw_content         // markdown
    // 系统生成
    content             // 内容
    abstract            // 摘要
    time                // 时间

Dynamic:
    _id                 // 主键
    // 系统生成，包括watch内容，follow内容，reply内容放在
    content             //内容，代码生成
    [user_id]           //发送给user
    read                //是否已读
    create_time         //时间
    link                //整个消息的跳转链接
    watch:  topic_link topic_title comment_abstract user_link user_nickname
            user 在你关注的 topic 中回复：xxxx   跳转comment
    follow: topic_link topic_title topic_abstract user_link user_nickname
            你关注的 user 发表了新主题 topic ：xxxx  跳转topic
            user2_link  user2_nickname followed user_link user_nickname
            你关注的 user 关注了 user2    跳转 user2
            user_link  user_nickname followed you
            user 关注了你  跳转 user
    reply:  topic_link topic_title comment_abstract user_link user_nickname
            user 在 topic 下回复了你：xxxx   跳转comment

关系表

table_follow_or_black: A following B
    <!-- _id                 // 主键 -->
    [user_id_A]         // A
    [user_id_B]         // B 两个合起来是主键
    type                // type=0是follow，type=1是blacklist

table_blacklist: A banned B // 不用了
    <!-- _id                 // 主键 -->
    [user_id_A]         // A
    [user_id_B]         // B 两个合起来是主键 blacklist

table_watching: user watching topic
    <!-- _id                 // 主键 -->
    [user_id]           // user
    [topic_id]          // topic 两个合起来是主键

table_collection: user collect a topic
    <!-- _id                 // 主键 -->
    [user_id]           // user
    [topic_id]          // topic 两个合起来是主键？！
    // 收藏 与 关注是不一样的，收藏不会有消息提示，而关注则会有提示，但是不会出现在收藏列表中

table_notice: notification notice user
    <!-- _id                 // 主键 -->
    [user_id]           // user
    [notification_id]   // notification 两个合起来是主键
    read                // 是否已读

table_vote_topic: A vote topic of B // 未实现
    <!-- _id                 // 主键 -->
    [user_id_A]         // userA
    [topic_id]          // topic    前两个是主键
    num                 // +1 or -1, cannot change
    
    [user_id_B]         // userB
    read                // B 是否已读 是否已读应当放在dynamic中！

table_vote_comment: A vote comment of B //未实现
    <!-- _id                 // 主键 -->
    [user_id_A]         // userA
    [comment_id]        // comment  前两个主键
    [user_id_B]         // userB
    num                 // +1 0 -1, when 0 delete

个人动态：
    回复我的  table_reply_me // 放在dynamic中
    <!-- 有人@我    table_at_me ~~不会~~ -->