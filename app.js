const express = require('express');
const mongoose  = require('mongoose');
const {userModel,postsModel} = require('./src/models/user');
const userRouter = require('./src/routes/user');
const postRouter = require('./src/routes/posts');
const jwtAuth = require('./src/middleware/jwt-auth');

const app = express();
const port = process.env.PORT || 8080 ;
mongoose.connect('mongodb://127.0.0.1:27017/user-db', //Task 1: mongoose and node app connectivity
{
    useNewUrlParser: true
})
console.log(mongoose.connection.readyState);





app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/user',userRouter);
app.use('/posts',postRouter);



    











app.listen(port,()=>
{
    console.log(`listening on port ${port}`);
})