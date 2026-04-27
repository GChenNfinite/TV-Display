# How it works
The essential mechanic of this program is a webpage that runs on the TV.

## Opening the webpage
On the TV

## JSX
The webpage uses javascript mainly to run. Open weather app is used to get the temp & humidity while papaparse is used to sync the google sheets to the app. The tank values are fetched every minute while the weather is fetched every 10 minutes. For any modifications, refer to App.jsx. If you need to modify webpage layout, check out App.css as well.

## Vercel
The github page is linked with Vercel to deploy the webpage to the internet. The free version is used and has most of the features needed. The log in for Vercel is the engineering google account. The domain for this webpage is tv-display-three.vercel.app.


# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
