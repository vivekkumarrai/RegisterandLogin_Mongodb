module.exports = (app) =>{

    const signup =  require('../controller/signup.controller');
    const signin =  require('../controller/login.controller');
    const validator = require ('../middleware/user.validation')
   


app.post('/register',validator.validateregister,signup.register)

app.post ('/login',validator.validaterlogin,signin.login)

app.post('/verify',signup.verifyPhoneOtp);

// app.post('/notifi' , signup.notification);

app.put('/resend', signup.resendOtp);

app.put('/forgotpassword',signup.forgotpassword)

app.put('/updatenewpassword/:userId',signup.updatenewpassword)

app.put('/changepassword',validator.validaterchangepassword, signup.changepassword)


}