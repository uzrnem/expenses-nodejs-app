## expense-monitoring-app
In this repo I have created the restful api using nodejs, express and mysql

### Author : Bhagyesh Patel

### `MySQL configuration`
Please create database using `schema/expense.sql` file.
 and execute `setup.sh` file.

In the project directory, you can run:

### `npm install`

This will install the dependencies inside `node_modules`

### `node server.js` OR `nodemon start` OR `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:9000](http://localhost:9000) to view it in the browser.

### Install using Docker

### Create Image
`docker build -f docker/Dockerfile -t expense:1.0.0 .`

### Create Container
If Mysql is locally Installed
`docker-compose -f docker/docker-compose.yml up -d`

If not, then
`docker-compose -f docker/docker-compose-full.yml up -d`

### If facing Issues with Mysql
Try following commands
`ALTER USER 'root' IDENTIFIED WITH mysql_native_password BY 'password';`
`flush privileges;`