/*
 *FILE USED TO CONFIGURE EXPRESS APP
 */

const cookieParser =    require('cookie-parser');
const bodyParser =      require('body-parser');

const { dirname } =     require('path');
const appDir =          dirname(require.main.filename);

const ddos =            require('ddos')
var anti_ddos =         new ddos({burst:10, limit:15})

function config(express, cors){
    console.log(appDir)

    const app = express()

    app.set('view engine', 'ejs');
    app.use(cookieParser());
    app.use(express.static('public'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.use(bodyParser.json({ limit: '30mb', extended: true }))
    app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }))
    //app.use(anti_ddos.express)

    return app;
}

module.exports = {config};