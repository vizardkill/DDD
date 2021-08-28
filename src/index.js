const app = require("./modules/main/app");

const Main = () => {
    app.listen(app.get("port"));
};

Main();
