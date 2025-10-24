import app from './app';
import config from './config/config';

app.listen(config.port, config.hostname, () => {
    console.log(`Server running on http://${config.hostname}:${config.port}`);
});
