
# Online-Shop Demo MVP

Simple frontend application for demonstration basic functionality Platform V DataSpace service

### Quick Start
Start by installing the basic deps:

    npm install

Define your DataSpace service GraphQL JWT endpoint here in .env file

    DS_ENDPOINT=ENTER_YOUR_GRAPHQL_JWT_ENDPOINT_HERE

Generate TypeScript construction:

    npm run codegen

Load [permissions.json](permissions.json) into DataSpace UI. [Security Layer Documentation](/documentation/permissions/permissions.md)

Starting developer server

    npm start

Go to http://localhost:3000 in your browser.
Input endpoint, application key, application secret of your DataSpace service.
Enjoy your service!