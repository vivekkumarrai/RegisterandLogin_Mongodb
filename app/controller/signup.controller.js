const express = require("express");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult} = require("express-validator");
const User = require("../model/user.model");
const OTP = require("../model/otp.model");
const { generateOTP, fast2sms } = require("../middleware/otp.util");
const nodemailer = require("nodemailer")
const Vonage = require('@vonage/server-sdk')



//******* Session time out function *********//

function AddMinutesToDate(date,minutes){
    return new Date(date.getTime()+minutes*60000)
}




//***************************** Register Start Here ******************************// 

exports.register = async (req, res, next) =>{
    
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }


    const {
        username,
        email,
        phone,
        password
    } = req.body;
    try {
        let user = await User.findOne({
            email
        });
        if (user) {
            return res.status(400).json({
                msg: "User Already Exists"
            });
        }

        user = new User({
            username,
            email,
            phone,
            password
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        phoneId = phone._id
        const payload = {
            data: {
                id: user.id,
                
            }
        };
        
        jwt.sign(
            payload,
            "randomString", {
                expiresIn: 10000
            },
            (err, token) => {
                if (err) throw err;
                res.status(200).json({
                    data : { 
                       message: "Successfully Register & OTP send your mobile number and email ",
                       user,
                       token
                    }
                });
            }
            
        );



 // ******************************* Generate otp Start Here ***************************//

        const otpgen = generateOTP(6);
        const now = new Date();
        const expiration_time = AddMinutesToDate(now,2);
        const otp = new OTP ({
            phone:phone,
            email:email,
            phoneotp:otpgen,
            expiration_time:expiration_time
        })


        //**********  Send otp on email **************//


        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            service : 'Gmail',
            auth: {
            user: 'vivekrai@apptunix.com',
            pass: 'Tunix@5494',
            }
        });
        var mailOptions={
            to: req.body.email,
           subject: "Otp for registration is: ",
           html: "<h3>OTP for account verification is </h3>"  + "<h1 style='font-weight:bold;'>" + otpgen +"</h1>" // html body
         };
         transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
           
        });
       

        //********** Send otp on Phone****************//

        await otp.save();
        console.log(otpgen)



          const vonage = new Vonage({
             apiKey: "1fb9f459",
             apiSecret: "ttm9rLYBLQk1BRkk"
})
               const from = "Vonage APIs"
                 const to = "917355665080"
                const text = ` OTP verfication ${otpgen}`

               vonage.message.sendSms(from, to, text, (err, responseData) => {
    if (err) {
        console.log(err);
    } else {
        if(responseData.messages[0]['status'] === "0") {
            console.log("Message sent successfully.");
        } else {
            console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
        }
    }
})

    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
    }
}

 // ******************************* Generate otp End Here ***************************//



  //************************************* Register End Here *******************************//




  


//***************************** Verfiy Phone Otp start here ****************************//

exports.verifyPhoneOtp = async (req, res, next) => {

   

      const { otps, phoneId } = req.body;
      const now = new Date();
       OTP.findById(phoneId)
       .then(async otp => {

 
     //********* Otp expire *********//

 if(otp.expiration_time < now){
             otp.phoneotp = "";
             await otp.save();
          res.status(408).send({
              message:"Session Time out"
          })
      }
     
  //******** Not Enter Data **********//

  else {

      if (!otp) {
            res.status(400).send({ 
            message: "User not found" 
        }); 
      }
  
// ********* Invalid OTP *************//

      if (otp.phoneotp !== otps) {
         res.status(401).send({
         message: "Invalid OTP" 
        });
        
      }
      else {


      //********** Clear otp (null)  *********//

               otp.phoneotp = "";
               await otp.save();

    

      //  Successfully Verify Data *****//

               res.status(201).json({
               type: "success",
               message: "OTP verified successfully",
               data: otp

                  });
         } 
   }
})
.catch(err =>{
  return res.status(400).json({
    message : "ID not Found"
  })
})

}


  //***************************** Verfiy Phone Otp end here ****************************//






 //************************ Resend otp on Gmail and Phone Start Here *******************************//


  exports.resendOtp = async (req, res) =>{
    const otpgen = generateOTP(6);
    const now = new Date();
    const expiration_time = AddMinutesToDate(now,2);
    const { phoneId } = req.body;
    const otp = await OTP.findById(phoneId);


    

    //**************  Resend otp on email *************//

    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        service : 'Gmail',
        auth: {
        user: 'vivekrai@apptunix.com',
        pass: 'Tunix@5494',
        }
    });
    var mailOptions={
        to: otp.email,
       subject: " Resend Otp for verification is: ",
       html: "<h3> Resend OTP for account verification is </h3>"  + "<h1 style='font-weight:bold;'>" + otpgen +"</h1>" // html body
     };
     transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
      
    });


   //**************  Resend otp on Phone *************//

    const vonage = new Vonage({
        apiKey: "1fb9f459",
        apiSecret: "ttm9rLYBLQk1BRkk"
})
          const from = "Vonage APIs"
            const to = "917355665080"
           const text = ` Resend OTP verfication ${otpgen}`

          vonage.message.sendSms(from, to, text, (err, responseData) => {
if (err) {
   console.log(err);
} else {
   if(responseData.messages[0]['status'] === "0") {
       console.log("Resend Message sent successfully.");
   } else {
       console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
   }
}
})



OTP.findByIdAndUpdate(req.body.phoneId, {
    phoneotp: otpgen || "Untitled Note",
    expiration_time: expiration_time
}, {new: true})
.then(data =>{
    if(!data){
        return res.status(404).send({
            message: "Otp not find with id " +req.params.phoneId
        });
    }
    res.send({
        type:"Success",
        message:"Please check mail OTP resend",
        data:data
    })
}).catch(err =>{
    return res.status(500).send({
        message: "Error updating note with id " + req.params.phoneId
    })
})
}


 //************************ Resend otp on Gmail and Phone End Here *******************************//



//**************  Not Working  Notification *********//


//  exports.notification = (req,res) => { 
//     //get push subscription object from the request
//     const subscription = req.body;
  
//     //send status 201 for the request
//     res.status(201).json({  })
  
//     //create paylod: specified the detals of the push notification
//     const payload = JSON.stringify(
//         {
//             title: 'Section.io Push Notification' 
//         }
//     );
  
//     //pass the object into sendNotification fucntion and catch any error
//     webpush.sendNotification(subscription, payload).catch(err=> console.error(err));
//   }




//************* Change Password **************//


exports.changepassword = async (req,res) => {

  const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }


    const {
         oldPassword,
         newPassword,
         confrimPassword,
         userId, } = req.body;
        
         
         try {
       
         if(!req.body.oldPassword){
           return res.status(400).json ({
             message:"Please Enter old password !" 
           })
         }
         if(newPassword == oldPassword){
          return res.status(400).json ({
            message:"Old Password and new password are not same"
          });
        }
         if(!req.body.newPassword){
          return res.status(400).json ({
            message:"Please Enter new password !"
          })
        }
        
         User.findById(userId)
         .then(async user => { 
           const isMatch = await bcrypt.compare(oldPassword,user.password);
           if(!isMatch){
             return res.status(400).json ({
               message: "Old pasword Wrong!"
             })
           }
           
           if(newPassword != confrimPassword){
             return res.status(400).json ({
               message:"Confrim password Does not Match"
             });
           }
           else {
            
            //***  Bcrypt your password start here****//
            const salt = await bcrypt.genSalt(10);
             const newpass = await bcrypt.hash(newPassword,salt);
             //***  Bcrypt your password end here ****//

             User.findByIdAndUpdate(req.body.userId, {
               password : newpass || "Untitled Note",
             }, {new: true })
             .then(user => {
               if(!user){
                 return res.status(404).send({
                   message : "User not change password"
                 });
               }
               res.send({
                 type :"Success",
                 message: "Password successfully Changed",
                 data:user
               })
             })
           }
          })
          .catch(err => {
            return res.status(400).json({
              message : " ID not Found "
            })
          })
          
} catch(e){
    res.setHeader('Content-Type','text/plain');
    return res.status(500).json({
      message:e.message
    })
}


};



//*************** Forgot Password Start here ***************//

exports.forgotpassword = (req,res) => {
  
  const { email } = req.body;

  User.findOne({email}, (err, user) => {
    if(!user) {
      return res.status(400).json({
        error : "This email does not exits"
      });
    }
     else {

      const otpgen = generateOTP(6);
      const now = new Date();
      const expiration_time = AddMinutesToDate(now,2);
      const otp = new OTP ({
          phone:user.phone,
          email:email,
          phoneotp:otpgen,
          expiration_time:expiration_time
      })

     
      // OTP Send on your email //

    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      service : 'Gmail',
      auth: {
      user: 'vivekrai@apptunix.com',
      pass: 'Tunix@5494',
      }
  });
  var mailOptions={
      to: req.body.email,
     subject: "Otp for forgot password is : ",
     html: "<h3>OTP for forgot password is  </h3>"  + "<h1 style='font-weight:bold;'>" + otpgen +"</h1>" // html body
   };
   transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
     
  });
  otp.save()
  return res.status(400).json({
    message : " Please check mail OTP send",
    data : user
    
  });
}



  })
  


}


//*************** Forgot Password end here ***************//


//**************************** Update New Password *****************// 


exports.updatenewpassword = async (req,res) =>{

  const {
       newPassword,
       confrimPassword } = req.body;
       
       if(!req.body.newPassword &&  !req.body.confrimPassword){
         return res.status(400).json({
           message : " Column can't be empty"
         })
       }

       if(newPassword != confrimPassword) {
         return res.status(400).json ({
           message: "Password and confrim password not match"
         })
       }
        const salt = await bcrypt.genSalt(10);
        const newpass = await bcrypt.hash(newPassword,salt);
        
       User.findByIdAndUpdate(req.params.userId, {
         password:newpass
       }, {new : true})
       
       .then(user => { 
        console.log(user)
           if(!user){
             return res.status(400).json({
               message : "Ids not find with id "+req.params.userId
             });
           }
           res.send(user);

       }).catch(err => {
         if(err.kind === 'ObjectId'){
           return res.status(400).send ({
             message : " Id not found with id "+ req.params.userId
           })
         }
       })
}