import app from './app';
import config, {url} from './config/config';


app.listen(config.port, config.hostname, () => {
    console.log(`Server running on ${url}`);
});
