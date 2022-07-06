# nRF Robot War Web Application

[![GitHub Actions](https://github.com/NordicPlayground/robot-war-app/workflows/Test%20and%20Release/badge.svg)](https://github.com/NordicPlayground/robot-war-app/actions)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)
[![Mergify Status](https://img.shields.io/endpoint.svg?url=https://api.mergify.com/v1/badges/NordicPlayground/robot-war-app)](https://mergify.io)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier/)
[![ESLint: TypeScript](https://img.shields.io/badge/ESLint-TypeScript-blue.svg)](https://github.com/typescript-eslint/typescript-eslint)
[![React](https://github.com/aleen42/badges/raw/master/src/react.svg)](https://reactjs.org/)
[![Bootstrap 5](https://img.shields.io/badge/Bootstrap-5-ffffff?labelColor=7952b3)](https://getbootstrap.com/docs/5.0/)
[![CSS modules](https://img.shields.io/badge/CSS-modules-yellow)](https://github.com/css-modules/css-modules)
[![Vite](https://github.com/aleen42/badges/raw/master/src/vitejs.svg)](https://vitejs.dev/)

The nRF Robot War Web Application is a single-page application (SPA) developed
with [React](https://reactjs.org/) in
[TypeScript](https://www.typescriptlang.org/).

The UI components are themed using
[Bootstrap 5](https://getbootstrap.com/docs/5.0/) and
[CSS modules](https://github.com/css-modules/css-modules). All complex UI logic
is extracted using [React hooks](https://reactjs.org/docs/hooks-custom.html) to
allow re-use when changing the UI framework.

[Vite](https://vitejs.dev/) is used as the frontend toolchain.

## Set up

    npm ci

## Running

    npm start

### Running the tests

You can then run the tests using

    npm test

# Configurations to run the application

The application relies on cloud communication and updates from actual robots to
work correctly.

1. First of all you need an AWS account, and you need to create a user to get an
   AWS Access Key ID, AWS Secret Access Key and region.

2. Then you need to clone and deploy the backend,
   https://github.com/NordicPlayground/robot-war-cloud

3. Then you can go to the Settings page on this application, and enter your AWS
   Access Key ID and AWS Secret Access Key.

4. To display the robots on the app, you need actual robots communicating with
   the cloud. To get around this, you can simulate robots by following the next
   steps

#### To be able to run the application without robots:

1. Go to the Game Controller page on the application, and send the first
   reported message. This will simulate the existence of robots in the cloud,
   which will display robots on the Admin page and Game page.

2. If you want to continue the simulation and get feedback from the simulated
   robots, press "SEND REPORTED" on the settings page. This will just update the
   reported state of the robots with the desired robot commands that are set in
   the game page after pressing the "Fight!" button.
