
const express = require('express');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const { v4: uuid4 } = require('uuid');

const app = express();
const port = 8080;

app.use(cookieParser());

app.get("/", function (req, res) {

    if (req.cookies.personal_cookie && getUser(req.cookies.personal_cookie)) {
        res.sendFile(__dirname.substring(0, __dirname.length - 4) + '/public/content.html');
    } else {
        res.sendFile(__dirname.substring(0, __dirname.length - 4) + '/public/index.html');
    }

});

app.get("/login", function (req, res) {

    if (req.query.name) {

        const name = req.query.name;
        const id = uuid4();
        userList[id] = { name, content_priority: {}, comments: {}, favorites: [] };
        res.status(200).cookie("personal_cookie", id).json({ name, cookie: id });

    } else {
        res.status(400).json({ error: 'Invalid name!' });
    }

});

function handleSecurity(req, res, next) {
    if (!req.cookies.personal_cookie) {
        res.status(401).sendFile(__dirname.substring(0, __dirname.length - 4) + '/public/index.html');
    } else {
        next();
    }
}

app.use(handleSecurity, express.static("./public"));
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

const tiles = {
    tile1: {
        title: "Tile #1",
        content: "Das ist ein Test. Das ist ein Test. Das ist ein Test. Das ist ein Test. Das ist ein Test. Das ist ein Test. Das ist ein Test. Das ist ein Test. Das ist ein Test. Das ist ein Test. Das ist ein Test. Das ist ein Test. Das ist ein Test. ",
        comments: []
    },
    tile2: {
        title: "Tile #2",
        content: "Test",
        comments: []
    },
    tile3: {
        title: "Tile #3",
        content: "Test",
        comments: []
    },
    tile4: {
        title: "Tile #4",
        content: "Test",
        comments: []
    },
    tile5: {
        title: "Tile #5",
        content: "Test",
        comments: []
    },
}

const userList = {
    "123": {
        user: "Test",
        content_priority: {
            "tile1": 2,
            "tile3": 2
        },
        favorites: ["tile1"]
    }
};

app.get('/content', (req, res) => {

    const response = {};
    let error = false;

    for (const tileId of Object.keys(tiles)) {
        const tileObject = { ...tiles[tileId] };

        tileObject.id = tileId;

        if (req.cookies.personal_cookie) {

            const user = getUser(req.cookies.personal_cookie);

            if (user) {

                if (!user.content_priority)
                    user.content_priority = {};

                if (!user.content_priority[tileId])
                    user.content_priority[tileId] = 0;

                if (!user.comments)
                    user.comments = {};

                if (!user.favorites)
                    user.favorites = [];

                tileObject.priority = user.content_priority[tileId];
                tileObject.comments = getTile(tileId).comments;
                tileObject.favoured = (user.favorites.indexOf(tileId) !== -1);

            } else {
                res.status(400).json({ error: 'Broken user!' });
                error = true;
                break;
            }

        } else {

            tileObject.priority = 0;
            tileObject.comments = [];
            tileObject.favoured = false;

        }

        response[tileId] = tileObject;

    }

    if (!error) res.status(200).json(response);

});

app.get('/favorite', (req, res) => {

    if (req.cookies.personal_cookie) {

        const cookie = req.cookies.personal_cookie;
        const tileId = req.query.tileId;

        if (tileId && tiles[tileId]) {

            const favoured = (req.query.favoured === 'true' ? true : false);

            if (favoured) {
                getUser(cookie).favorites.push(tileId);
            } else {
                getUser(cookie).favorites.splice(getUser(cookie).favorites.indexOf(tileId), 1);
            }

            res.status(200).json({ success: true });

        } else {
            res.status(400).json({ error: 'Invalid tileId!' });
        }

    } else {
        res.status(400).json({ error: 'No cookie set!' });
    }

});

app.get('/visited', (req, res) => {

    if (req.cookies.personal_cookie) {

        const cookie = req.cookies.personal_cookie;
        const tileId = req.query.tileId;
        const user = getUser(cookie);

        if (tileId && tiles[tileId]) {
            if (!user.content_priority[tileId])
                user.content_priority[tileId] = 0;

            user.content_priority[tileId]++;
            res.status(200).json({ success: true });
        } else {
            res.status(400).json({ error: 'Invalid tileId!' });
        }

    } else {
        res.status(400).json({ error: 'No cookie set!' });
    }

});

app.post('/comments', (req, res) => {

    if (req.cookies.personal_cookie) {

        if (req.body.commentContent) {

            const cookie = req.cookies.personal_cookie;
            const tileId = req.body.tileId;
            const commentContent = req.body.commentContent;

            const user = getUser(cookie);
            const tile = getTile(tileId);

            if (!tile.comments)
                tile.comments = [];

            const comment = { creator: user.name, content: commentContent, timestamp: Date.now() }
            tile.comments.push(comment);
            res.status(200).json({ success: true, comment });

        } else {
            res.status(400).json({ error: 'Invalid request body!' });
        }

    } else {
        res.status(400).json({ error: 'No cookie set!' });
    }


});

function getUser(personalCookie) {
    return userList[personalCookie];
}

function getTile(tileId) {
    return tiles[tileId];
}

app.listen(port, () => {
    console.log(`Server listening on port ${port}!`);
})