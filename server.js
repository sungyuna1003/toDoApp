const express = require('express');
const app = express();

const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http);


const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

const MongoClient = require('mongodb').MongoClient;

const methodOverride = require('method-override')
app.use(methodOverride('_method'))

app.set('view engine', 'ejs');


app.use('/public', express.static('public'));

require('dotenv').config()


    //변수가 필요
    var db;

MongoClient.connect('mongodb+srv://sungyuna1003:test1234!@cluster0.muyy0.mongodb.net/todoapp?retryWrites=true&w=majority',
    function (에러, client) {
        if (에러) return console.log(에러);

    //todoapp 이라는 database(폴더)에 연결
        db = client.db('todoapp')
    //post라는 파일에 insertOne {자료}
        // db.collection('post'). insertOne({이름:'john', _id: 110, 나이:'22'}, function (에러,결과) {
        //     console.log('저장완료');
        // });

        http.listen('8080', function () {
        console.log('listening on 8080~~')
    });
})




// 1. 누군가가 / pet 으로  방문하면,
// 2. pet 관련된 안내문을 띄워주자

app.get('/pet', function (요청, 응답) {
    응답.send('펫 용품 쇼핑할 수 있는 사이트입니다');
})


app.get('/', function (req, res) {
    // res.sendFile(__dirname + '/index.html');
    res.render('index.ejs')

})

app.get('/write', function (req, res) {
    // res.sendFile(__dirname + '/write.html');
    res.render('write.ejs')
})

app.get('/edit/:id', function (req, res) {

     db.collection('post').findOne({ _id: parseInt(req.params.id)}, function (error, result) {
        // console.log(result)
        res.render('edit.ejs', { post : result})
    })
})
// app.put('/edit', function (req, res) {
//     db.collection('post').updateOne({ _id: parseInt(req.body.id) }, { $set: { 제목: req.body.title, 날짜: req.body.date } },
//         function (error, result) {
//             console.log('수정완료');
//             res.redirect('/list')
//     })
    
// })


app.put('/edit', function (req, res) {
    db.collection('post').updateOne({ _id: parseInt(req.body.id) }, { $set: { 제목: req.body.title, 날짜: req.body.date } },
        function () {

            console.log('수정완료')
            res.redirect('/list')
        });
});




    // /list로 get 요청하면 
    // 실제 DB에 저장된 데이터들로 예쁘게 꾸며진 html 보여줌

    app.get('/list', function (req, res) {
   // DB에 저장된 post 라는 컬렉션 안의 모든 데이터 꺼내주세요. 
        db.collection('post').find().toArray(function (error, result) {
            console.log(result);
            // 꾸며진 html 보여줌(밑에부분 다시보기)
            res.render('list.ejs', { posts: result });
        }); 
    })
    app.get('/search', function (req, res) {
        console.log(req.query)
        db.collection('post').find({ 제목: req.query.value }).toArray(function (error, result) {
            console.log(result)
        })
    })




//  /detail 로 접속하면 detail.ejs 보여줌

app.get('/detail/:id', function (req,res) {
    db.collection('post').findOne({_id : parseInt(req.params.id)}, function(error, result){
        console.log(result);
        res.render('detail.ejs', { data: result })
    })
    
})



const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({ secret: '비밀코드', resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', function (req, res) {
    res.render('login.ejs')
})
app.post('/login', passport.authenticate('local', {
    failureRedirect: '/fail'
}), function (req, res) {
    res.redirect('/')
}) 





passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
}, function (입력한아이디, 입력한비번, done) {
    //console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
        if (에러) return done(에러)

        if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
        if (입력한비번 == 결과.pw) {
            return done(null, 결과)
        } else {
            return done(null, false, { message: '비번틀렸어요' })
        }
    })
}));


passport.serializeUser(function (user, done) {
    done(null, user.id)
});

passport.deserializeUser(function (아이디, done) {
    db.collection('login').findOne({ id: 아이디 }, function (error, result) {
        done(null, result)
    })
});



app.get('/mypage', 로그인했니, function (req, res) {
    console.log(req.user);
    res.render('mypage.ejs', { 사용자: req.user })
})

function 로그인했니(req, res, next) {
    if (req.user) {
        next()
    }
    else {
        res.send('로그인안하셨는데요?')
    }
}
app.post('/chatroom', 로그인했니, function (요청, 응답) {
    console.log(요청.body);
    console.log(요청.user);
    var 저장할거 = {
        title: '뿅뿅뿅채팅방',
        member: [요청.body.당한사람id, 요청.user._id],
        date: new Date()
    }

    db.collection('chatroom').insertOne(저장할거).then((결과) => {
        응답.send('채팅성공');
    })
    

});

app.get('/chat', 로그인했니, function (req, res) {

    db.collection('chatroom').find({ member: req.user._id }).toArray().then((result) => {
        res.render('chat.ejs', { data: result})
    })
});

app.post('/message', 로그인했니, function (req, res) {
    var 저장할거 = {
        parent: req.body.parent,
        content: req.body.content,
        userid: req.user._id,
        date : new Date(),
    }
    db.collection('message').insertOne(저장할거).then(() => {
        console.log('DB 저장성공');
        res.send('DB 저장성공')
    }).catch(() => {
        console.log('DB 실패');
    })
});


app.get('/message/:id', 로그인했니, function (요청, 응답) {

    응답.writeHead(200, {
        "Connection": "keep-alive",
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
    });
    db.collection('message').find({ parent: '요청.params.id' }).toArray()
        .then((결과) => {
        응답.write('event: test\n');
        응답.write('data: ' + JSON.stringify(결과) +'\n\n');
    })
});



// 어떤 사람이 / add 경로로 post 요청을하면
// 데이터 2개(날짜,제목)을 보내주는데,
// 이때 'POST'라는 이름을 가진 collection 에 데이터 2개저장하기
// {제목:'aaa', 날짜:'eeeee'}

app.post('/add', function (req, res) {
    console.log(req.body.title);
    console.log(req.body.date);
    // console.log(req.date);

    db.collection('counter').findOne({ name: '게시물갯수' }, function (error, result) {
        console.log(result.totalPost);
        var 총게시물갯수 = result.totalPost;

        var info = { _id: 총게시물갯수 + 1, 제목: req.body.title, 날짜: req.body.date, 작성자: req.user.id }

        db.collection('post').insertOne(info, function () {
            console.log('저장완료~!~!~!~!~!');
            // counter 라는 콜렉션에 있는 totalPost 라는 항목도 1 증가 시켜야함
            db.collection('counter').updateOne({ name: '게시물갯수' }, { $inc: { totalPost: 1 } }, function (error, result) {
                if (error) return console.log(error);
                res.send('전송완료');
            })
        });
    })
})



app.delete('/delete', function (req, res) {
    console.log(req.body);
    req.body._id = parseInt(req.body._id);

    var 삭제할데이터 = { _id: req.body._id, 작성자: req.user._id }


    // req.body에 담겨온 게시물번호를 가진 글을 db 에서 찾아서 삭제해주세요
    db.collection('post').deleteOne(삭제할데이터, function (error, result) {
        console.log('삭제완료');
        if (error) { console.log(error)}
        res.status(200).send({ message: '성공했습니다.' });
    })
})




app.post('/register', function (req, res) {
    db.collection('login').insertOne({ id: req.body.id, pw: req.body.pw }, function (error, result) {
        res.redirect('/')
    })
})


app.use('/shop', require('./routes/shop'));

app.use('/board/sub', require('./routes/board'));


let multer = require('multer');
var storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, './public/image')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    },
    filefilter: function (req, file, cb) {
        
    }
});

var upload = multer({ storage: storage });

app.get('/upload', function (req, res) {
    res.render('upload.ejs');
})

app.post('/upload', upload.single('프로필'), function (요청, 응답) {
    응답.send('업로드완료')
});

app.get('./image/:imageName', function (req, res) {
    res.sendFile(__dirname + '/public/image' + req.params.imageName)
})

