const porukeRouter = require('express').Router()
const Poruka = require('../models/poruka')
const Korisnik = require('../models/korisnik')
const jwt=require('jsonwebtoken')

const dohvatiToken=(req)=>{
  //token u zaglavlju
  const auth=req.get('authorization')
  if(auth && auth.toLowerCase().startsWith('bearer')){
    return auth.substring(7) //token (BEARER+razmak=6 znakova, od 7. token)
  }
}

porukeRouter.get('/', async (req, res) => {
  const poruke = await Poruka.find({})
    .populate('korisnik', { username: 1, ime: 1 })
  res.json(poruke)
})

porukeRouter.get('/:id', (req, res, next) => {
  Poruka.findById(req.params.id)
    .then(poruka => {
      if (poruka) {
        res.json(poruka)
      } else {
        res.status(404).end()
      }

    })
    .catch(err => next(err))
})

porukeRouter.delete('/:id', (req, res) => {
  Poruka.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(err => next(err))
})

porukeRouter.put('/:id', (req, res) => {
  const podatak = req.body
  const id = req.params.id

  const poruka = {
    sadrzaj: podatak.sadrzaj,
    vazno: podatak.vazno
  }

  Poruka.findByIdAndUpdate(id,poruka, {new: true})
  .then( novaPoruka => {
    res.json(novaPoruka)
  })
  .catch(err => next(err))

})

porukeRouter.post('/', async (req, res, next) => {
  const podatak = req.body
  const token=dohvatiToken(req)
  const dekodiraniToken=jwt.verify(token,process.env.SECRET)
  if(!token || !dekodiraniToken){
    return res.status(401).json({error:'Neispravan token'})
  }//ako nisi autentificiran nemas prava

  //sve OK
  const korisnik = await Korisnik.findById(dekodiraniToken.id)

  const poruka = new Poruka({
    sadrzaj: podatak.sadrzaj,
    vazno: podatak.vazno || false,
    datum: new Date(),
    korisnik: korisnik._id
  })

  const spremljenaPoruka = await poruka.save()
  korisnik.poruke = korisnik.poruke.concat(spremljenaPoruka._id)
  await korisnik.save()

  res.json(spremljenaPoruka)

})

module.exports = porukeRouter