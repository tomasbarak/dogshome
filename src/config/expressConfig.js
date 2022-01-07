const ddos = require('ddos')
const bodyParser =         require('body-parser');
const { dirname } =     require('path');
const appDir =          dirname(require.main.filename);
const ejs = require('ejs');
//Require cookie parser
const cookieParser = require('cookie-parser');
var anti_ddos = new ddos({burst:10, limit:15})

function config(express, cors){
    const app = express()
    //process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    //App configuration
    app.set('view engine', 'ejs');
    console.log(appDir)
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