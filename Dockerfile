
# Obtener imagen de node
FROM node


# Establecemos el espacio de trabajo
WORKDIR /app


# Asignamos valor a variable de entorno $PATH con "/app/node_modules/.bin"
ENV PATH /app/node_modules/.bin:$PATH


# Instalamos las dependencias
COPY package.json ./

ENV NODE_ENV = 'development'


RUN npm install --silent
#RUN npm install react-scripts@3.4.1 -g --silent


# add app
COPY . ./


# start app
CMD npm run dev
