const mongoose = require('mongoose');
const dotenv = require('dotenv');


process.on('uncaughtException',err=>{
    console.log(err.name,err.message);
        process.exit(1);
    console.log('Unhandled exception');
});


dotenv.config({path: './config.env'});
const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);



mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true, // Add this option for unified topology
}).then(() => console.log("DB connection successful")).catch(err=>console.log('Error'));


const port = process.env.port || 3000;
const server  = app.listen(port, ()=>{
    console.log(`Server running on ${port}`);
});

process.on('unhandledRejection',err=>{
    console.log(err.name,err.message);

    server.close(()=>{
        process.exit(1);
    })
    console.log('Unhandled rejection');
});
