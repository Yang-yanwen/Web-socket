// 聊天室主要功能

//1 初始化连接服务器
const socket=io('http://localhost:4003')

//全局变量 储存登录用户信息
var username,portraitsrc

//点击登录 拿到用户名和头像地址 
$('#enterBtn').on('click',()=>{
    //01拿到username
    var userName=$('#username').val().trim()            //trim() 去掉空格
    //console.log(userName)
    if(!userName){              //不存在时
        alert('请输入用户名')
        return              //跳出状态
    }

    //02获取头像  【$('#protraits_ul li.active img')】 找不到
    var portraitSrc=$('.li.active img').attr('src') //选择li class有active 下的img
    //console.log(portraitSrc)

    //通过socket.io 提交数据
    socket.emit('login',{
        userName:userName,
        portraitSrc:portraitSrc
    })
})

//监听登陆失败的请求
socket.on('loginError',(data)=>{        //data为{msg:'登录失败，用户已登录'}
    alert('登录失败：用户名已存在')
})

//监听登陆成功的请求
socket.on('loginSuccess',(data)=>{      //data为提交的用户信息 被返回，去渲染聊天界面
    //alert('登录成功')
    //隐藏登录窗口 显示聊天窗口
    $('#login_box').css('display', 'none')      //元素直接消失于dom节点
    $('#chat_face').fadeIn()        //令聊天界面 缓缓出现

    //渲染聊天界面的个人信息
    $('.master_protrait').attr('src',data.portraitSrc)
    $('.master_name').text(data.userName)

    //赋值全局变量
    username=data.userName
    portraitsrc=data.portraitSrc
})

//监听广播事件【添加了新的用户】
socket.on('addUser',(data)=>{
    console.log(data)
    //添加系统消息
    
    $('.show_message').append(`
        <div class="broadcase_new_user" >
            "${data.userName}" 加入聊天室
        </div>
    `)
})

//监听广播事件【用户列表消息】
socket.on('userList',(data)=>{
    //渲染用户列表
    console.log(data)
    $('.contact_ul').html('')
    data.forEach(item => {
        $('.contact_ul').append(`
            <li class="contact_li">
                <div style="float:left">
                        <img class="contact_protrait" src="${item.portraitSrc}" alt="">
                </div>
                <div class="contact_name">${item.userName}</div>
            </li
        `)  
    })
    $('#counts').text(data.length)
})

//监听广播事件【用户离开】
socket.on('delUser',(data)=>{
    console.log(data)
    //添加系统消息
    //$('.show_message').html('')
    $('.show_message').append(`
        <div class="broadcase_new_user" >
            "${data.userName}" 离开聊天室
        </div>
    `)
})

//监听聊天按钮【将消息发送给服务器】
$('#send_btn').on('click',()=>{
    //拿到输入内容
    var content= $('#text').val().trim()
    $('#text').val('')//点击发送后清空输入
    if(!content) return alert('请输入内容')

    //发送为服务器【发送消息，包括用户名和头像】【定义全局变量记录用户名和头像】
    socket.emit('sendMessage',{ 
        msg:content,
        username:username,
        portraitsrc:portraitsrc
    })
})

//监听来自服务器的聊天消息
socket.on('receiveMessage',(data)=>{
    //console.log(data)
    if(data.username==username){
        //自己的消息
        $('.show_message').append(`
            <div class="own_message">
                <div class="show_own_protrait">
                    <img style="width:50px;height:50px;margin-left:275px;" src="${data.portraitsrc}" alt="">
                </div>
                <div class="show_own_text">
                    ${data.msg}
                </div>
            </div>
        `)
    }else{
        //别人的消息
        $('.show_message').append(`
            <div class="other_message">
                <div class="show_other_protrait">
                    <img style="width:50px;height:50px" src="${data.portraitsrc}" alt="">
                </div>
                <div class="show_other_text">
                    ${data.msg}
                </div>
            </div>
        `)
    }

    //保持最新消息在可视区
    //console.log($('.show_massage').children(':last'))
    //$('.show_massage').children(':last').scrollIntoView(false)
    //$('.show_message div : last-child').get(0).scrollIntoView(true)
})

