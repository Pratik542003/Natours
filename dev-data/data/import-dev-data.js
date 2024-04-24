const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../model/tourModel');

console.log(process.env.DATABASE_PASSWORD);
dotenv.config({path: './../../config.env'});
const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);

mongoose
    .connect(DB, { 
    useNewUrlParser: true,
    useUnifiedTopology: true, // Add this option for unified topology
    })
    .then(() => console.log("DB connection successful"));

//Read json file

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'));

//Import data into database
const importData = async()=>{
    try{
        await Tour.create(tours);
        console.log('Data successfully loaded');
    }catch(err){
        console.log(err);
    }
};

//delete all data from collection
const deleteData = async()=>{
    try{
        await Tour.deleteMany();
        console.log('Data successfully deleted');
    }catch(err){
        console.log(err);
    }
}

if(process.argv[2]=='--import'){
    importData()
}else if(process.argv[2]=='--delete'){
    deleteData();
}
//console.log(process.argv);