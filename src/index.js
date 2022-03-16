
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
        title: "Was ist HTML?",
        content: "Die Hypertext Markup Language (HTML, englisch für Hypertext-Auszeichnungssprache) ist eine textbasierte Auszeichnungssprache zur Strukturierung elektronischer Dokumente wie Texte mit Hyperlinks, Bildern und anderen Inhalten. HTML-Dokumente sind die Grundlage des World Wide Web und werden von Webbrowsern dargestellt. Neben den vom Browser angezeigten Inhalten können HTML-Dateien zusätzliche Angaben in Form von Metainformationen enthalten, z. B. über die im Text verwendeten Sprachen, den Autor oder den zusammengefassten Inhalt des Textes. HTML wird vom World Wide Web Consortium (W3C) und der Web Hypertext Application Technology Working Group (WHATWG) weiterentwickelt. Die aktuelle Version ist seit dem 14. Dezember 2017 HTML 5.2, die bereits von vielen aktuellen Webbrowsern und anderen Layout-Engines unterstützt wird. Auch die Extensible Hypertext Markup Language (XHTML) wird durch HTML5 ersetzt. HTML dient als Auszeichnungssprache dazu, einen Text semantisch zu strukturieren, nicht aber zu formatieren. Die visuelle Darstellung ist nicht Teil der HTML-Spezifikationen und wird durch den Webbrowser und Gestaltungsvorlagen wie CSS bestimmt. Ausnahme sind die als veraltet (englisch deprecated) markierten präsentationsbezogenen Elemente. (Quelle: https://de.wikipedia.org/wiki/Hypertext_Markup_Language)"
    },
    tile2: {
        title: "Was ist CSS?",
        content: "Cascading Style Sheets (englische Aussprache für 'gestufte Gestaltungsbögen'; kurz: CSS) ist eine Stylesheet-Sprache für elektronische Dokumente und zusammen mit HTML und JavaScript eine der Kernsprachen des World Wide Webs. Sie ist ein sogenannter living standard 'lebendiger Standard' und wird vom World Wide Web Consortium (W3C) beständig weiterentwickelt. Mit CSS werden Gestaltungsanweisungen erstellt, die vor allem zusammen mit den Auszeichnungssprachen HTML und XML (zum Beispiel bei SVG) eingesetzt werden. (Quelle: https://de.wikipedia.org/wiki/Cascading_Style_Sheets)"
    },
    tile3: {
        title: "Was ist JavaScript (JS)?",
        content: "JavaScript (kurz JS) ist eine Skriptsprache, die ursprünglich 1995 von Netscape für dynamisches HTML in Webbrowsern entwickelt wurde, um Benutzerinteraktionen auszuwerten, Inhalte zu verändern, nachzuladen oder zu generieren und so die Möglichkeiten von HTML zu erweitern. Heute wird JavaScript auch außerhalb von Browsern angewendet, etwa auf Servern und in Microcontrollern. Der heutige Name der ursprünglich LiveScript genannten Sprache entstand 1996 aus einer Kooperation von Netscape mit Sun Microsystems. Deren Java-Applets, erstellt mit der gleichfalls 1995 veröffentlichten Programmiersprache Java, wurden mithilfe von LiveScript in den Netscape Navigator integriert. Um die Popularität von Java zu nutzen, wurde LiveScript in JavaScript umbenannt, obwohl die beiden Sprachen voneinander unabhängig entwickelt wurden und völlig unterschiedliche Grundkonzepte aufweisen. Der als ECMAScript (ECMA 262) standardisierte Sprachkern von JavaScript beschreibt eine dynamisch typisierte, objektorientierte, aber klassenlose Skriptsprache. Sie wird allen objektorientierten Programmierparadigmen unter anderem auf der Basis von Prototypen gerecht, deren Deklaration ab ECMAScript 6 mit einer Syntax ermöglicht wird, wie sie ähnlich auch bei klassenbasierten Programmiersprachen üblich ist. In JavaScript lässt sich je nach Bedarf objektorientiert, prozedural oder funktional programmieren.(Quelle: https://de.wikipedia.org/wiki/JavaScript)"
    },
    tile4: {
        title: "Was ist Svelte?",
        content: "Svelte ist ein Open-Source-Webframework, das es erlaubt, mithilfe deklarativer Komponenten reaktive Single-Page-Webanwendungen zu erstellen. Anders als andere clientseitige Webframeworks fungiert Svelte als Compiler, der den Quellcode in imperativen Java Script Code umwandelt. Somit verzichtet das Framework auf das Konzept des Virtual DOM und weist eine hohe Effizienz zur Laufzeit auf. (Quelle: https://de.wikipedia.org/wiki/Svelte_%28Framework%29)"
    },
    tile5: {
        title: "Wie übergibt man Svelte-Komponenten Argumente mit?",
        content: "Erstelle zuerst eine <COMPONENT_NAME>.svelte-Datei. Erzeuge ein <script>-Tag. Mit 'export let VARIABLE_NAME;' erstellt man ein Argument. Beim Aufrufen der Komponente in einer anderen Svelte-Datei, muss nun die Variable VARIABLE_NAME angegeben werden. Mit 'export let VARIABLE_NAME = DEFAULT_WERT;' kann man ein Argument optional machen."
    },
}

const userList = {};

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