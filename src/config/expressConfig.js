const ddos = require('ddos')
const bodyParser =         require('body-parser');

var anti_ddos = new ddos({burst:10, limit:15})

function config(express, cors){
    const app = express()

    //App configuration
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.use(bodyParser.json({ limit: '30mb', extended: true }))
    app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }))
    app.use(anti_ddos.express)
    return app;
}
module.exports = {config};