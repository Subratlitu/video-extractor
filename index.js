const express = require('express');
const app = express();
const port = 2000;
const videoController  = require('./videoController')

app.get('/extract-frames',videoController.extractFrames)
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
