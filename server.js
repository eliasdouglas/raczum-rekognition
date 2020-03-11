// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();

const bodyParser = require('body-parser');
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({
  
 extended:true
}));

const aws = require('aws-sdk');

const multer = require('multer');
const upload = multer();


// our default array of dreams
const dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

app.post("/detectarLabels", upload.single('myfile'), function(request, response){
  
  var arquivo = request.file.buffer;
  
  aws.config.update({region:'us-east-1'});
  
  var rekognition = new aws.Rekognition();
  
  var params = {
    Image: { /* required */
      Bytes: arquivo
    },
    MaxLabels: 50,
    MinConfidence: 70
  };
  
  rekognition.detectLabels(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else   {
      console.log(data);           // successful response
      
      var table = "<table border=1>";

      for (var i = 0 ; i < data.Labels.length; i++){
        table += "<tr>";
        table += "<td>"+data.Labels[i].Name+"</td>";
        table += "<td>"+data.Labels[i].Confidence+"</td>";
        table += "</tr>";
      }

      table += "</table>";
      
      response.send(table);
    }  
  });
  
  
});


app.post("/detectarModeracao", upload.single('myfile_moderar'), function(request, response){
  
  var arquivo = request.file.buffer;
  
  aws.config.update({region:'us-east-1'});
  
  var rekognition = new aws.Rekognition();
  
  var params = {
    Image: { /* required */
      Bytes: arquivo
    },
    MinConfidence: 30
  };
  
  rekognition.detectModerationLabels(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else    {
      console.log(data);           // successful response
      //response.json(data);
      
      var table = "<table border=1>";

      for (var i = 0 ; i < data.ModerationLabels.length; i++){
        table += "<tr>";
        table += "<td>"+data.ModerationLabels[i].Name+"</td>";
        table += "<td>"+data.ModerationLabels[i].Confidence+"</td>";
        table += "</tr>";
      }

      table += "</table>";
      
      response.send(table);
      
    } 
  });
  
  
});

app.post("/analiseFacial", upload.single('myfile_facial'), function(request, response){
  
  var arquivo = request.file.buffer;
  
  aws.config.update({region:'us-east-1'});
  
  var rekognition = new aws.Rekognition();
  
  var params = {
  Image: { /* required */
    Bytes: arquivo
  },
  Attributes: ['ALL'
    //DEFAULT | ALL,
    /* more items */
  ]
};
  
  rekognition.detectFaces(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else    {
      console.log(data);           // successful response
      //response.json(data);
      var table = "<table border=1>";

      for (var i = 0 ; i < data.FaceDetails.length; i++){
        table += "<tr>";
        table += "<td>"+data.FaceDetails[i].AgeRange.Low+"</td>";
        table += "<td>"+data.FaceDetails[i].AgeRange.High+"</td>";
        table += "<td>"+data.FaceDetails[i].Gender.Value+"</td>";
        table += "<td>"+data.FaceDetails[i].Emotions[0].Type+"</td>";
        table += "<td>"+data.FaceDetails[i].Emotions[0].Confidence+"</td>";
        table += "</tr>";
      }

      table += "</table>";
      
      response.send(table);
      
    } 
  });
  
});

// send the default array of dreams to the webpage
app.get("/dreams", (request, response) => {
  // express helps us take JS objects and send them as JSON
  response.json(dreams);
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

/*
  aws.config.update({region:'us-east-1'});
  
  var rekognition = new aws.Rekognition();
  
  var params = {};
  
  rekognition.compareFaces(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });
*/