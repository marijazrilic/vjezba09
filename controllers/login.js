const Korisnik=require('../models/korisnik')
const loginRouter = require('express').Router()
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')

loginRouter.post('/',async(req,res)=>{

    const podaci=req.body //username i pass
    const korisnik=await Korisnik.findOne({username: podaci.username})

    const passDobar=korisnik===null ? false : await bcrypt.compare(podaci.pass,korisnik.passHash)
    
    if(!(korisnik && passDobar)){
        res.status(401).json({error: 'Neispravna lozinka i/ili username'})
    } //korisnik se neije uspio prijaviti

    //sve OK
    const userToken={
        username: korisnik.username, //iz baze korisnik.username
        id: korisnik._id
    }
    const token=jwt.sign(userToken, process.env.SECRET)

    res.status(200).send({token, username:korisnik.username, ime: korisnik.ime})

})

module.exports = loginRouter