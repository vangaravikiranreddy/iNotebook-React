const express = require('express');
const User = require('../models/User');
const router = express.Router(); 
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchUser = require("../middleware/fetchUser");

const JWT_SECRET = "Ravi";

//Route1: Create a User using: POST "/api/auth/createUser". No login required
router.post('/createUser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be atleast 5 characters').isLength({ min: 5 })
], async (req, res)=>{ 
    // If there are errors , return bad request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    // Check whether the user exist
    try{
        let user = await User.findOne({email: req.body.email});
        if(user) {
           return res.status(400).json({error: "Sorry a user with this email already exist"})    
        }
         const salt = await  bcrypt.genSalt(10);
         const secPass = await bcrypt.hash(req.body.password, salt);
         // create a new user
         user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass
        })
        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        
        res.json({authtoken})
        // res.json(user);
    }catch(error) {
        console.error(error.message);
        res.status(500).send("Internal Server occured");
    }
} )

//Route2: Authenticate the user

router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must not be blank').exists()
], async (req, res)=>{ 
        // If there are errors , return bad request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {email, password} = req.body;
        try{
            let user = await User.findOne({email});
            if(!user){
                return res.status(400).json({error: "Please try to login with correct credentials"});
            }

            const passwordCompare = await bcrypt.compare(password, user.password);
            if(!passwordCompare) {
                return res.status(400).json({error: "Please try to login with correct credentials"});
            }

            const data = {
                user: {
                    id: user.id
                }
            }
            const authtoken = jwt.sign(data, JWT_SECRET);
            res.json({authtoken})
        } catch(error) {
            console.error(error.message);
            res.status(500).send("Internal Server occured");
        }
})

//Route3: Get loggedin User Details
router.post('/getUser',fetchUser ,async (req, res)=>{ 
try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password")
    res.send(user)
} catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server occured");
}
})
module.exports = router