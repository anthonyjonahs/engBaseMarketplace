var express = require('express');
var router = express.Router();
var db = require('../data/db/database')
var _ = require('lodash');

module.exports = router;

db.connect()

router.get('/', function(req, res, next) {
  res.render('HomepageView');
});

router.get('/all-categories',(req,res) => {
	res.render('AllCategoriesView');
})

router.get('/about',(req,res) => {
	res.render('AboutView');
})

router.get('/contact',(req,res) => {
	res.render('ContactView');
})

router.get('/vendors',(req,res) => {
	res.render('VendorView');
})

router.get('/terms-and-conditions',(req,res) => {
	res.render('TermsAndConditionsView');
})

router.get('/privacy-policy',(req,res) => {
	res.render('PrivacyPolicyView');
})

router.get('/testing',(req,res) => {
	db.db().collection('marketplace').findOne({"software.app_name":"S-CONCRETE"},function(err,doc){
		if(err){
			console.log("there is some kind of error.")
		};
		res.render('testing',{"data":doc});
	});
})

//Blog routes
router.get('/blog',(req,res) => {
	db.db().collection('blog').aggregate([{$match:{}}],(err,doc)=>{
		if(err){
			console.log('Error fetching from database.');
			return;
		}
		res.render('BlogView',{postArray:doc})

	})

})

router.get('/blog/:blogPath',(req,res) => {

	db.db().collection('blog').findOne({"path":req.params.blogPath},(err,doc)=>{
		if(err){
			console.log('Error fetching from database.');
			return;
		}

		res.render('BlogPostView',{blogBody:doc})

	})
})

//Profiles and hollywood categories
router.get('/:softwareCategory', (req,res,next) =>{

	let hollyVar;
	switch(req.params.softwareCategory){
		case "3d-design-and-analysis-software":
			hollyVar = "3d"
			break;
		case "bridge-design-software":
			hollyVar = "bridge"
			break;
		case "foundation-pile-and-retaining-wall-design-software":
			hollyVar = "fpr"
			break;
		case "section-and-slab-design-software":
			hollyVar = "secslab"
			break;
		case "steel-detailing-and-connections-design-software":
			hollyVar = "detconn"
			break;
		case "cloud-design-software":
			hollyVar = "cloud"
			break;
		case "bim-design-software":
			hollyVar = "bimmer"
			break;
		default:
			let softwareName = req.params.softwareCategory;
			db.db().collection('marketplace').aggregate([

			    {$match:{"software.app_path":softwareName}},
			    {$unwind:"$software"},
			    {$match:{"software.app_path":softwareName}}

			],function(err,doc){
				if(err){
					console.log("there is some kind of error.")
					return;
				};

				if(!doc){
					res.render('error', {

						'error':{
							'status': 404,
							'stack':'It would seem that you\'ve wandered to the wrong place. We suggest you go back!'
						},
						'message': 'Well this isn\'t good ...'

					})

					return;
				}

				//Outputs an array ... not sure why...
				res.render('ProfileView',{"data":doc[0]});

			});

	}


	if(hollyVar){
		db.db().collection('marketplace').aggregate(

			[
				{$unwind:"$software"},
				{$match:{"software.hollywood":hollyVar}},
				{$sort:{"software.rating":-1}}
			]).toArray(function(err,doc){

				if(err){console.log("there is some kind of error.")};

				res.render('HollywoodListView',{'vendorsWithTag':doc, 'softwareCategory':req.params.softwareCategory});
		    }
	 	)
 	}
})


// Dynamic route for getting categories
router.get('/all-categories/:tagToQuery', function(req, res, next) {

	//FUTURE: switch statement to point any relevant tags to featured lists (e.g. "bim", "brige", etc.)

	var tag = req.params.tagToQuery;

	//converting acronyms to upper case so they can be used in db query.
	var tagToQuery = tag=="bim" || tag=="fea" ? _.upperCase(tag) : tag ;
  console.log(tagToQuery);


	db.db().collection('marketplace').aggregate(

		[
			{$unwind:"$software"},
			{$match:
				{$or:[
					{"software.materials":tagToQuery},
					{"software.building_codes":tagToQuery},
					{"software.capabilities":tagToQuery}]
				}
			},
			{$sort:{"software.rating":-1}}
		]).toArray(function(err,doc){

			if(err){console.log("there is some kind of error.")};

			res.render('ListView',{'vendorsWithTag':doc, 'tag':tagToQuery });
	    }
 	)

});



module.exports = router;
