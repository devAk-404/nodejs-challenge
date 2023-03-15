const express = require('express');
const postRouter = express.Router();
const { userModel, postsModel } = require('../models/user')
const auth = require('../middleware/jwt-auth')

//Task 3: Crud of posts for authorized users only
postRouter.post('/', auth, async (req, res, next) => {
    // const username = req.params.userName;

    const user = await userModel.findOne({ _id: req.userData.userId });

    console.log(req.userData)


    try {
        if (!user)
            return res.status(400).json({ message: 'No user found or not a valid user!' })
        user.posts.push(req.body);
        await user.save();
        res.status(201).json({ message: "post created sucessfully" });

    } catch (error) {
        res.status(401).json({ message: error })
    }





})


postRouter.patch('/:postId', auth, async(req, res, next) => {
    const id = req.params.postId;
    const user = await userModel.findOne({ _id: req.userData.userId });
    console.log(user.posts[0]._id.valueOf());
    console.log(id);
    const post = user.posts.filter(post=>post._id==id);
    console.log(post);
    console.log(post.length);
    if(!post.length)
    {
     res.status(401).json({message:'Cannot act on post'});
    }
    else
    {
        userModel.updateOne({ 'posts._id': req.params.postId }, {
            '$set': {
                'posts': req.body
            }
        }).then(result => {
            res.status(200)
                .json(
                    {
                        message: "posts updated sucessfully!",
                        result: result
                    })
        })
            .catch(err => {
                res.status(204).json(
                    {
                        message: "post not found",
                        error: err
                    })
            })
    }
    
    
})

postRouter.delete('/:postId',auth,async(req,res,next)=>
{
    const id = req.params.postId;
    const user = await userModel.findById(req.userData.userId);
    // console.log(user);
    const post = user.posts.filter(post=>post._id==id)
    console.log(user.posts);
    if(!post.length)
    {
        return res.status(401).json({message:"Cannot act on post"});
    }
    else
    {
        user.posts = user.posts.filter(post=>post._id!=id)
        console.log(user.posts);
        user.save()
        .then(result=>
            {
                console.log(result)
                res.status(200).json({message:"post deleted sucessfully"});
            })
        .catch(err=>
            {
                console.log(err);
                res.status(500).json({message:"post not deleted"})
            })
        
        

    }

})


postRouter.get('/',auth,(req,res,next)=>
{
    
    userModel.find().select('posts').exec()
    .then(result=>
        {
            // console.log(result);
            res.status(200).json({posts:result})
        })
    .catch(err=>
        {
            console.log(err);
            res.status(500).json(
                {
                    message:'cannot fetch posts',
                    error:err
                }
                )
        })
})

//task 4: api to fetch posts using latitude and longitude
postRouter.get('/:long/:lat',auth,async(req,res,next)=>
{
    const long = req.params.long;
    console.log(long);
    const lat = req.params.lat;
    console.log(lat);
    
    userModel.aggregate([
        {
          $unwind: "$posts"
        },
        {
          $match: {
            $expr: {
              $and: [
                {
                  $in: [
                    "$posts.latitude",
                    [
                      parseInt(lat)
                    ]
                  ]
                },
                {
                    $in: [
                      "$posts.longitude",
                      [
                        parseInt(long)
                      ]
                    ]
                  }
                
              ]
            }
          }
        },
        {
          $group: {
            "_id": "$_id",
            "posts": {
              $push: "$posts"
            }
          }
        }
      ])
      .exec()
      .then(results=>
        {
            if(results.length>0)
            return res.status(200).json(results);
            res.status(400).json({message:"No posts available for search Geo location"})
            
        })
       .catch(err=>
        {
            res.status(500).json(
                {
                    message:"cannot fetch posts",
                    error:err
                })
        })

})

//dashboard (active and inactive posts)
postRouter.get('/activePosts',auth,(req,res,next)=>
{
    userModel.aggregate([
  
        {
          "$unwind": "$posts"
        },
        {
          "$match": {"posts.isActive": true}
        },
        {
          "$group": {
            "_id": "$_id",
            "total": {"$sum": 1}
          }
        }
      ]).exec()
      .then(result=>
        {
            let total = 0
            result.map(r=>
                {
                    total = total + r.total
                })
            res.status(200).json({activePosts:total})
        })
       .catch(err=>
        {
            console.log(err);
        })


})

postRouter.get('/inactivePosts',auth,(req,res,next)=>
{
    userModel.aggregate([
  
        {
          "$unwind": "$posts"
        },
        {
          "$match": {"posts.isActive": false}
        },
        {
          "$group": {
            "_id": "$_id",
            "total": {"$sum": 1}
          }
        }
      ]).exec()
      .then(result=>
        {
            let total = 0
            result.map(r=>
                {
                    total = total + r.total
                })
            res.status(200).json({inactivePosts:total})
        })
       .catch(err=>
        {
            console.log(err);
        })


})

module.exports = postRouter;

