import React from 'react';
import ReactDOM from 'react-dom/client';
import Routing from './Route';
import "./index.css";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import store from './redux/store';
import { Provider } from 'react-redux';
import { Font } from '@react-pdf/renderer'
import timesRomanFontUrl from "../fonts/times new roman.ttf";
import timesBoldFontUrl from "../fonts/times new roman bold.ttf";

Font.register({
  family: 'Times-Roman',
  src: timesRomanFontUrl,
 
  
})
Font.register({
  family: 'Times-Bold',
  src: timesBoldFontUrl,
})

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  React.createElement(
    React.Fragment,
    null,
    React.createElement(
      Provider,
      { store },
      React.createElement(Routing),
    ),
    React.createElement(ToastContainer),
  )
);
