var express = require("express")
var bodyParser = require("body-parser")
//Because HTML doesn't suppor the RESTful PUT or DEL methods
var methodOverride = require("method-override")
//Removes all scripts and just leave pure HTML
let expressSanitizer = require("express-sanitizer")
var app = express()
//APP CONFIG
app.set("view engine","ejs")
app.use(bodyParser.urlencoded({extended:true}))
//sanitizer goes after bodyParser
app.use(expressSanitizer())
app.use(express.static("public"))
app.use(methodOverride("_method"))
// mongoose
var mongoose = require("mongoose")
//mongoose.connect("mongodb://localhost/restful-blog")

//TESTING MLAB CONNECTION AND CREATION
mongoose.connect("mongodb://tester:tester@ds113702.mlab.com:13702/nodetester")

var blogSchema = new mongoose.Schema({
	title: String,
	author: String,
	image: {type: String, default:"/images/placeholderimage.jpg"},
	body: String,
	created: {type: Date, default: Date.now}
})
var Blog = mongoose.model("Blog",blogSchema)

//RESTFUL ROUTES
app.get("/",function(req,res){
	res.redirect("/blogs")
})
//INDEX ROUTE
app.get("/blogs",function(req,res){
	Blog.find({},function(err,blogs){
		if (err) {
			console.log("ERROR!", err)
		} else {
			res.render("index",{blogs})
		}
	})
})
//NEW ROUTE
app.get("/blogs/new",(req,res) => {
	res.render("new")
})
//CREATE ROUTE
app.post("/blogs",(req,res) => {
	//sanitizer in action, with a log to show before/after
	console.log(req.body)
	req.body.blog.body = req.sanitize(req.body.blog.body)
	console.log("-------------")
	console.log(req.body)
	//takes the data (req.body.blog) and creates a new blog
	//.blog contains 3 groupedd items
	//after creation, it executes the callback, which is go back to blogs list
	//note: originally was (err, newBlog) but ESLint complained that newBlog was defined but not used, so:
	Blog.create(req.body.blog, (err) => {
		//if error, just show the form again
		if(err){
			res.render("new")
		} else{
			res.redirect("/blogs")
		}
	})
})
//SHOW ROUTE
app.get("/blogs/:id",(req,res) => {
	Blog.findById(req.params.id,(err,foundBlog) => {
		if(err){
			res.redirect("/blogs")
			console.log("error in id single post")
		} else{
			res.render("show",{blog:foundBlog})
		}
	})
})
//EDIT ROUTE
app.get("/blogs/:id/edit",(req,res) => {
	req.body.blog.body = req.sanitize(req.body.blog.body)
	Blog.findById(req.params.id,(err,foundBlog) => {
		if(err){
			res.redirect("/blogs")
		} else{
			res.render("edit",{blog:foundBlog})
		}
	})
})
//UPDATE ROUTE
app.put("/blogs/:id",(req,res) => {
	//(id, newData, callback)
	Blog.findByIdAndUpdate(req.params.id,req.body.blog,(err,updatedBlog) => {
		if(err){
			res.redirect("/blogs")
		} else{
			res.redirect("/blogs/" + req.params.id)
		}
	})
})
//DELETE ROUTE
app.delete("/blogs/:id",(req,res) => {
	//res.send("YOU HAVE DESTROYED YOUR CREATURE...")
	Blog.findByIdAndRemove(req.params.id,(err) => {
		if(err){
			res.redirect("/blogs")
		} else{
			res.redirect("/blogs")
		}
	})
})

// set the port of our application
// process.env.PORT lets the port be set by Heroku, on localhost or codeanywhere is 3000
var port = process.env.PORT || 3000

//check connection through express
app.listen(port, function() {
	console.log("Our app is running on http://localhost:" + port)
})

//check connection
var db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", function() {
// we're connected!
	console.log("MongoDB (mlab) is engaged!")
})

//Asterisk for a 404 route
app.get("*", function(req, res){
	res.send("404 NOTHING TO SEE HERE...")
})

