var express = require('express');
var router = express.Router();
var request = require('request');
var objectHeaders = require('../helpers/headers');
var localSession = require('../middlewares/localSession');
var async = require('async');
var cookieParser = require('cookie-parser');
var i18n = require('i18n');
var index = express();
index.use(cookieParser());
index.use(i18n.init);
index.set('view engine', 'ejs');

router.get('/', localSession, function (req, res, next) {
    var url = req.configs.api_base_url + 'home/';
    var officeId;
    var page = req.query.page ? req.query.page : 1;
    var langCategory = req.cookies.lang;

    if (typeof(req.session.office_id) !== 'undefined' && req.session.office_id != null) {
        url = req.configs.api_base_url + 'home?office_id=' + req.session.office_id;
        officeId = req.session.office_id;
    }

    if (typeof(req.query.officeId) !== 'undefined') {
        url = req.configs.api_base_url + 'home?office_id=' + req.query.officeId;
        officeId = req.query.officeId;
    }

    if(typeof(req.session.access_token) == 'undefined'){
        request({
            url: url,
            headers: objectHeaders.headers
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                try {
                    var data = JSON.parse(body);

                    res.render('index', {
                        langCategory: langCategory,
                        data: data,
                        officeId: officeId,
                        pageTitle: res.__('Home'),
                        isHomePage: true,
                        info: req.flash('info'),
                        error: req.flash('error'),
                        lang : req.session.lang
                    });
                } catch (errorJSONParse) {
                    res.redirect('home');
                }
            } else {
                res.redirect('home');
            }
        });
    } else {
        async.parallel({
            data: function (callback) {
                request({
                    url: url,
                    headers: objectHeaders.headers
                }, function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        try {
                            var data = JSON.parse(body);
                            callback(null, data);
                        } catch (errorJSONParse) {
                            callback(null, null);
                        }
                    } else {
                        callback(null, null);
                    }
                });
            },
            dataNoti: function (callback) {
                request({
                    url: req.configs.api_base_url + 'notifications' + '/?page=' + page,
                    headers: objectHeaders.headers({'Authorization': req.session.access_token})
                }, function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        try {
                            var dataNoti = JSON.parse(body);
                            callback(null, dataNoti);
                        } catch (errorJSONParse) {
                            callback(null, null);
                        }
                    } else {
                        callback(null, null);
                    }
                });
            }
        }, function (err, results) {
            if (err) {
                res.redirect('back');
            } else {
                res.render('index', {
                    langCategory: langCategory,
                    data: results.data,
                    dataNoti: results.dataNoti,
                    officeId: officeId,
                    pageTitle: res.__('Home'),
                    isHomePage: true,
                    info: req.flash('info'),
                    error: req.flash('error'),
                    lang : req.session.lang
                });
            }
        });
    }
});

router.get('/all_office', localSession, function (req, res, next) {
    var url = req.configs.api_base_url + 'home/';
    var officeId;
    var langCategory = req.cookies.lang;
    var page = req.query.page ? req.query.page : 1;

    if(typeof(req.session.access_token) == 'undefined'){
        request({
            url: url,
            headers: objectHeaders.headers
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                try {
                    var data = JSON.parse(body);
    
                    res.render('index', {
                        langCategory: langCategory,
                        data: data,
                        officeId: officeId,
                        pageTitle: res.__('Home'),
                        isHomePage: true,
                        info: req.flash('info'),
                        error: req.flash('error'),
                    });
                } catch (errorJSONParse) {
                    res.redirect('home');
                }
            } else {
                res.redirect('home');
            }
        });
    } else {
        async.parallel({
            data: function (callback) {
                request({
                    url: url,
                    headers: objectHeaders.headers
                }, function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        try {
                            var data = JSON.parse(body);
                            callback(null, data);
                        } catch (errorJSONParse) {
                            callback(null, null);
                        }
                    } else {
                        callback(null, null);
                    }
                });
            },
            dataNoti: function (callback) {
                request({
                    url: req.configs.api_base_url + 'notifications' + '/?page=' + page,
                    headers: objectHeaders.headers({'Authorization': req.session.access_token})
                }, function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        try {
                            var dataNoti = JSON.parse(body);
                            callback(null, dataNoti);
                        } catch (errorJSONParse) {
                            callback(null, null);
                        }
                    } else {
                        callback(null, null);
                    }
                });
            }
        }, function (err, results) {
            if (err) {
                res.redirect('back');
            } else {
                res.render('index', {
                    langCategory: langCategory,
                    data: results.data,
                    dataNoti: results.dataNoti,
                    officeId: officeId,
                    pageTitle: res.__('Home'),
                    isHomePage: true,
                    info: req.flash('info'),
                    error: req.flash('error')
                });
            }
        });
    }
});

router.get('/change-lang/:lang', function(req, res) {
    res.cookie('lang', req.params.lang, { maxAge: 900000});
    req.session.lang = req.params.lang;
    res.redirect('back');
});

module.exports = router;
