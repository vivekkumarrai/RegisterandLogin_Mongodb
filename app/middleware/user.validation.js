const { check, validationResult} = require("express-validator");

module.exports.validateregister = [

  //********* User Name Validation **********//

  check("username")
  .isLength({min:3,max:10})
  .withMessage('First Name should be minimum 3 character and maximum 10 character')
  .matches('[a-zA-Z]*')
  .withMessage('First Name should be only Alphabet'),


 //********* Email Validation **********//

  check("email")
    .isLength({ min: 1 })
    .withMessage('Email required')
    .isEmail()
    .matches(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
    .withMessage('INVALID_EMAIL'),


     //********* Phone number Validation **********//

     check("phone")
     .isLength({min:10,max:16})
     .withMessage('PHONE_NUMBER MUST BE 10 DIGIT')
     .notEmpty().withMessage('PHONE_NUMBER CONTAIN ONLY NUMERIC'),


     //********* Password  Validation **********//

    check("password")
    .isLength({ min: 8 })
    .withMessage('PASSWORD_LENGTH_MIN_IS_6_MAX_15')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage('Atleast one lowercase letters, uppercase letters, numbers and symbols to make the password really strong!'),

]



module.exports.validaterlogin =[

    

      check("email")
      .isLength({ min: 1 })
      .withMessage('Email required')
      .isEmail()
      .matches(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
      .withMessage('INVALID_EMAIL'),


        
      check("password")
    .isLength({ min: 6, max: 15 })
    .withMessage('PASSWORD_LENGTH_MIN_IS_6_MAX_15')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage('Atleast one lowercase letters, uppercase letters, numbers and symbols to make the password really strong! '),


  ];


  module.exports.validaterchangepassword =[
    check("userId")
    .isLength({min :1})
    .withMessage("User Id is required"), 
    check("oldPassword")
  .isLength({ min: 8})
  .withMessage('PASSWORD_LENGTH_MIN_IS_8_MAX_15')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
  .withMessage('Atleast one lowercase letters, uppercase letters, numbers and symbols to make the password really strong! '),
  check("newPassword")
  .isLength({ min: 8 })
  .withMessage('PASSWORD_LENGTH_MIN_IS_8_MAX_15')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
  .withMessage('Atleast one lowercase letters, uppercase letters, numbers and symbols to make the password really strong! '),

];