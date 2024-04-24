
const mongoose  = require('mongoose');
const slugify = require ('slugify');
const validator = require('validator');
const User = require('./userModel');

const tourSchema = new mongoose.Schema({
    name : {
        type:String,
        required: [true,'A tour must have a name'],//built in data validator
        unique: true,
        trim:true,
        maxlength: [40, 'A tour name must have less than or equal to 40 chars'],
        minlength: [10, 'A tour name must have less than or equal to 10 chars'],
        //validate: validator.isAlpha
    },

    slug:String,
    duration:{
        type:Number,
        required : [true,'A tour must have a duration']
    },
    maxGroupSize:{
        type:Number,
        required:[true,'A tour must have a group size']
    },
    difficulty:{
        type:String,
        required:[true,'A tour must have difficulty']
    },
    ratingsAverage : {
        type:Number,
        default:4.5
    },
    ratingsQuantity:{
        type:Number,
        default:0
    },
    price: {
        type: Number,
        required: [true,'A tour must have a price']
    },
    priceDiscount:{
        type:Number,
        validate: {
            validator:function(val) {
            return val<this.price;
        },
        message: ' Discount should be below the regular price'
    }
    },
    summary: {
        type:String,
        trim:true,
        required:[true,'A tour must have summary']
    },
    description:{
        type:String,
        trim:true
    },
    imageCover:{
        type:String,
        required:[true,'A tour must have a cover image']
    }, 
    image:[String],
    createdAt:{
        type:Date,
        default:Date.now()
    },
    startDates:[Date],
    secretTour:{
        type:Boolean,
        default:false
    },
    startLocation: {
        //GeoJSON
        type: {
            type:String,
            default:'Point',
            enum:['Point']
        },
        //expect an array of numbers long/lat
        coordinates: [Number],
        address:String,
        description:String

    },
    locations:[
        {
            type:{
                type:String,
                default:'Point',
                enum:['Point'],
            },
            coordinates:[Number],
            address:String,
            description:String,
            day:Number
        
    }],
    //example of embedding and referencing
    guides:[
        {
        type:mongoose.Schema.ObjectId,
        ref:'User'
    }
]

},
{
    toJSON:{ virtuals:true},
    toObject:{ virtuals:true}
});

tourSchema.virtual('durationWeeks').get(function(){
    return this.duration/7;
}); 

//virtual populate
tourSchema.virtual('reviews',{
    ref:'Review', 
    foreignField: 'tour',
    localField:'_id'
});

//Document middleware
    tourSchema.pre('save',function(next){
        this.slug  = slugify(this.name,{ lower:true});
        next();
    })

    // tourSchema.pre('save',function(next){
    //     xonsole.log('will save document');
    //     next();
    // })
    // tourSchema.post('save',function(doc,next){
    //     console.log(doc),
    //     next();
    // })

//QUERY MIDDLEWARE

// tourSchema.pre('find',function(next){
    tourSchema.pre(/^find/,function(next){
    this.find({secretTour : {$ne:true} } );
    
    this.start = Date.now();
    next();
    }); 

    tourSchema.pre(/^find/,function(next){
        this.populate({
            path:'guides',
            select:'-__v -passwordChangedAt'
        });
        next();
    })
    
tourSchema.post(/^find/,function(docs,next){
    console.log(`Query took ${Date.now() -this.start} milliseconds`);
    next();
});



//Aggregation middleware

tourSchema.pre('aggregate',function(next){
    this.pipeline().unshift( { $match: { secretTour: { $ne:true } } } );
    console.log(this);
    next();
});

const Tour = mongoose.model('Tour',tourSchema);

module.exports = Tour;