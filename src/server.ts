import app from './app';
import config from './config/config';


export const url = `http://${config.hostname}:${config.port}`

app.listen(config.port, config.hostname, () => {
    console.log(`Server running on ${url}`);
});
