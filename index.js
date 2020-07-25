const path = require('path');
const express = require('express');
const app = express();
const { check, validationResult } = require('express-validator');
const { Pool } = require('pg');

app.use(express.urlencoded( {extended: true } ));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


//initialising the connection pool
const user = 'surayyafenton';
const host = 'localhost';
const database = 'dog-list';
const port = 5432;

const pool = new Pool({
    user,
    host,
    database,
    port
});

//rendering the homepage from pug
app.get('/', function (req, res) {
    pool.query('SELECT name FROM dogs', (err, items) => {
        if (err) {
            console.log(err)
            return
        }
        const result = items.rows
        const rowList = []
        for (const row of result) {
            const name = row.name
            rowList.push(name)
        }
        res.render('index', ({ rowList }) )  

    })
}
);

//posting the submit request (sending input to /submit)
app.post('/submit', [
    check('dogName').isLength({ min: 1 }).trim().escape()
], function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const dogName = req.body.dogName;

//inserting a name into the DB
const query = {
    text: 'INSERT INTO dogs(id, name) VALUES (DEFAULT, $1)',
    values : [dogName]
};

pool
    .query(query)
    .catch(e => console.error(e.stack))


//send a response to the view
res.redirect('back')
});



app.listen(3000, () => console.log('Server ready'));

