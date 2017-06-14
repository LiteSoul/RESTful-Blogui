var express = require("express")
var bodyParser = require("body-parser")

var app = express()
app.set("view engine","ejs")
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))

// mongoose
var mongoose = require("mongoose")
//mongoose.connect("mongodb://localhost/restful-blog")

//TESTING MLAB CONNECTION AND CREATION
mongoose.connect("mongodb://tester:tester@ds113702.mlab.com:13702/nodetester")

var blogSchema = new mongoose.Schema({
	title: String,
	author: String,
	image: {type: String, default:"placeholderimage.jpg"},
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
	//takes the data (req.body.blog) and creates a new blog
	//.blog contains 3 groupedd items
	//after creation, it executes the callback, which is go back to blogs list
	Blog.create(req.body.blog, (err, newBlog) => {
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



//check connection
var db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", function() {
  // we're connected!
	console.log("WE ARE CONNECTED REALLY")
})

//check connection through express
//with codeanywhere port 3000 works, on heroku it's process.env.PORT
app.listen(3000, function () {
  console.log('YelpCamp app listening on port 3000!')
})

//Asterisk for a 404 route
app.get("*", function(req, res){
    res.send("404 NOTHING TO SEE HERE...")
})

