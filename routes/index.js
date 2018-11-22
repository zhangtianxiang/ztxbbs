module.exports = function (app) {
    app.get('/', function (req, res) {
        res.redirect('/community/forums')
    })
    // app.use('/api', require('./api/index'))
    app.use('/users', require('./users/index'))
    app.use('/community', require('./community/index'))
    app.use('/manage', require('./manage/index'))
    app.use('/search',require('./search'))
    // 处理 not found 404
    app.use(function(req, res, next) {
      // let err = new Error('Not Found')
      // err.status = 404
      // next(err) // org express
      if (!res.headersSent) {
        res.status(404).render('404')
      }
    })
}