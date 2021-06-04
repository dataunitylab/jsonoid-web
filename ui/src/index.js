import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import { ClientContextProvider } from 'react-fetching-library';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import store from './store';
import client from './client';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ClientContextProvider client={client}>
        <App />
      </ClientContextProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
