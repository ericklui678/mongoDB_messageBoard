var express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    moment = require('moment'),
    port = 3000;
var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
mongoose.connect('mongodb://localhost/message_board');

var Schema = mongoose.Schema;

var MessageSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'name required'], minlength: 4 },
    message: { type: String, required: [true, 'message required'], minlength: 5 },
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
}, { timestamps: true });

var CommentSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'name required'], minlength: 4 },
    comment: { type: String, required: [true, 'comment required'], minlength: 5 },
    _message: {type: Schema.Types.ObjectId, ref: 'Message'},
}, { timestamps: true });

var Message = mongoose.model('Message', MessageSchema);
var Comment = mongoose.model('Comment', CommentSchema);

app.get('/', function(req, res){
    Message.find().sort({'createdAt': -1}).populate('comments').exec(function(err, data){
        if(err){console.log(data);}
        res.render('index', {messages: data, moment: moment})
    })
})
app.post('/message', function(req, res){
    Message.create(req.body, function(err, data){
        if(err) {console.log(err);};
        res.redirect('/');
    })
})
app.post('/comment/:mID', function(req, res){
    Message.findOne({_id: req.params.mID}, function(err, message){
        // save post data into comment object
        var comment = new Comment(req.body);
        // set comment's message id to the id passed from HTML
        comment._message = req.params.mID;
        // push comment object into messages array in Messages collection
        Message.update({_id: req.params.mID}, {$push: {'comments': comment}}, function(err){});
        // save comment data to Comments collection
        comment.save(function(err){
            if(err) {console.log(err);}
            res.redirect('/');
        })
    })
})
app.listen(port, function(){
    console.log('running on', port);
})
