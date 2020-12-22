'use strict';
const express = require('express');
const path = require('path');
const apiRoutes = require('../app/index.js');

module.exports.setRoutes = (app) => {

    // root
    app.get('/', (req, res) => {
        res.send('Success connect to backend');
    });

    // api route, all the api will start with /api/xx
    app.use('/api', apiRoutes);

    // send 404 error if other path
    app.use('/*', (req, res) => {
        res.status(404).send({ result: false, message: 'Requested path does not exist' });
    });
};
