function config(express, cors){
    const app = express()

    //App configuration
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    return app;
}
module.exports = {config};