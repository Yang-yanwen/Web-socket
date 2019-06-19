// 创建express服务
const express=require('express')
const app=express()
const server=require('http').createServer(app)
const io=require('socket.io')(server)

//记录已经登录过的用户
const users=[]

//处理静态目录
app.use(express.static('public'))

//访问页面
app.get('/',(req,res)=>{
    res.redirect('/login.html')
})

//通讯服务
io.on('connection',(socket)=>{
    console.log('新用户连接')

    //注册事件 接受用户信息
    socket.on('login',(data)=>{
        //console.log(data)
        //判断用户在users中是否存在,如果存在说明已经登录，不允许再次登录
        //反之
        let isUser=users.find((item,index)=>item.userName===data.userName) 
        //find()类似于foreach()，返回true或false 【users.find((item,index)=>{item.userName===data.userName}) 】出错
        if(isUser){ 
           //存在 登录失败 响应
           socket.emit('loginError',{msg:'登录失败，用户已登录'})
           //console.log('登录失败')
        }else{
            //不存在
            users.push(data)
            //响应登录成功 将信息扔回去 
            socket.emit('loginSuccess',data)
            //console.log(users,'登录成功')
            
            //告诉所有在线用户有人登录ok
            //socket.emit():告诉当前用户
            //io.emit():广播所有用户
            io.emit('addUser',data)

            //告诉所有用户聊天室多少人
            io.emit('userList',users)

            //将登陆成功的用户的信息单独记录下来，【用来删除】
            socket.userName=data.userName
            socket.portraitSrc=data.portraitSrc
        }
    })

    //用户断开连接 【disconnect】事件固定 和connection一样事件固定 无需监听
    socket.on('disconnect',()=>{
        //将用户信息在users中删除
            //在users里找到离开用户的下标 
        let idx= users.findIndex((item,index)=>item.userName===socket.userName) //最终返回查找对象的下标
        users.splice(idx,1) //切割删除（下标，个数）
        //1.广播所有用户
        io.emit('delUser',{
            userName:socket.userName,
            portraitSrc:socket.portraitSrc
        })
        //2.更新userList 重新发送
        io.emit('userList',users)
    })

    //监听用户聊天消息
    socket.on('sendMessage',(data)=>{
        //console.log(data)
        //广播为所有用户
        io.emit('receiveMessage',data)
    })
})

//端口监听
server.listen(4003,()=>{
    console.log('服务器启动ok')
})