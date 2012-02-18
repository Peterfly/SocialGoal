
/*
 * GET home page.
 */

exports.index = function(req, res){
  console.log(req);
  res.render('index', { title: 'My Goals' });
};