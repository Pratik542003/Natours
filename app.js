const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');

const globalErrorHandler = require('./controller/errorController')
const rateLimit =require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');


const reviewRouter = require('./routes/reviewRoutes');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//security http headers
app.use(helmet());


const limiter = rateLimit({
    max:100,
    windowMs:60*60*1000,
    message:"Too many request from this IP, please try again after an hour",
});
//limitrequest
app.use('/api',limiter);

//Middleware for all routes
//development logging
if(process.env.NODE_ENV ==='development')
app.use(morgan('dev' ));

//body parser ,reading data from body into req.body
app.use(express.json({limit:'10kb'})); 

//data sanitaization against nosql query injection
//looks at request body, params, strings, $ signs etc
app.use(mongoSanitize());

//data sanitization against xss
//prevents injection of html code with js code 
app.use(xss());

//prevent parameter pollution
app.use(hpp({
    whitelist:[
    'duration',
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price'
]
})); 

//serving static files
app.use(express.static(`${__dirname}/public`))

//testing
app.use((req,res,next)=>{
    req.requestTime = new Date().toISOString();
    //console.log(req.headers);

    next();
})


app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/reviews',reviewRouter);

app.all('*', (req,res,next)=>{
    next(new AppError(`Can't find ${req.originalUrl} on this server`,404));
});//operational error

app.use(globalErrorHandler);

module.exports = app;

