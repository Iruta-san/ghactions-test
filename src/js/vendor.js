import '@babel/polyfill';
import svg4everybody from 'svg4everybody';
import $ from 'jquery';
import objectFitImages from 'object-fit-images';
import SecureLS from 'secure-ls';
import barba from '@barba/core';
import barbaCss from '@barba/css';
import barbaRouter from '@barba/router';
import Scrollbar from 'smooth-scrollbar';
import 'slick-carousel';

svg4everybody();

window.$ = $;
window.jQuery = $;
window.barba = barba;
window.SecureLS = SecureLS;
window.barbaCss = barbaCss;
window.barbaRouter = barbaRouter;
window.objectFitImages = objectFitImages;
window.Scrollbar = Scrollbar;

require('ninelines-ua-parser');
