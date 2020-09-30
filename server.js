const express = require('express');
const app = require('./app');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`server start on port ${PORT}`)
})