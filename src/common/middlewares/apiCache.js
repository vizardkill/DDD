const apicache = require("apicache-plus");

const cache = () => {
    return async (req, res, next) => {
        let key = req.originalUrl || req.url;

        let hasResult = await apicache.has(key);

        if (hasResult) {
            let result = await apicache.get(key);

            return res.json(JSON.parse(result));
        } else {
            res.sendResponse = res.send;

            res.send = async (body) => {
                await apicache.set(key, body, process.env.CACHE_DURATION);
                res.sendResponse(body);
            };

            next();
        }
    };
};

module.exports = cache;
