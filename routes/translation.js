'use strict';


const sUtil = require('../lib/util');
const tUtil = require('../lib/translation');


/**
 * The main router object
 */
const router = sUtil.router();

/**
 * The main application object reported when this module is require()d
 */
let app;

/**
 * Regular expression used for validating the source parameter
 * @type {RegExp}
 */
const sourceValidator = /^[a-zA-Z]+(-[a-zA-Z]+)*$/;

function recommend(req, res, source, target, projectDomain, seed) {
    if (!sourceValidator.test(source)) {
        throw new sUtil.HTTPError({
            status: 400,
            type: 'bad_request',
            title: 'Bad request',
            detail: 'source parameter was invalid'
        });
    }

    let count = 24;
    if (req.query && req.query.count) {
        count = parseInt(req.query.count, 10);
        if (isNaN(count) || count < 1 || count > 500) {
            throw new sUtil.HTTPError({
                status: 400,
                type: 'bad_request',
                title: 'Bad request',
                detail: 'count parameter was invalid'
            });
        }
    }

    return tUtil.recommend(app, source, target, projectDomain, seed)
    .then((result) => {
        result = result.slice(0, count);
        res.json({
            count: result.length,
            items: result
        });
    });
}

/**
 * GET /articles/{source}/{seed}
 * Gets the articles existing in source but missing in domain based on seed.
 */
router.get('/articles/:source/:seed?', (req, res) => {
    const domainParts = req.params.domain.split('.');
    const target = domainParts[0];
    const projectDomain = domainParts.splice(1).join('.');
    return recommend(req, res, req.params.source, target, projectDomain, req.params.seed);
});


module.exports = function(appObj) {

    app = appObj;

    return {
        path: '/translation',
        api_version: 1,
        router
    };

};

