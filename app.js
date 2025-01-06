// const express = require('express');
import express from 'express';
const app = express();
const port = 3000;
// const routes = require('./route/routes');
import router from './route/routes.js';

app.use('/', router);

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});