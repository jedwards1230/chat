if(!self.define){let e,s={};const n=(n,t)=>(n=new URL(n+".js",t).href,s[n]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=s,document.head.appendChild(e)}else e=n,importScripts(n),s()})).then((()=>{let e=s[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(t,a)=>{const i=e||("document"in self?document.currentScript.src:"")||location.href;if(s[i])return;let c={};const o=e=>n(e,i),r={module:{uri:i},exports:c,require:o};s[i]=Promise.all(t.map((e=>r[e]||o(e)))).then((e=>(a(...e),c)))}}define(["./workbox-8637ed29"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/static/chunks/119-7137039b0d42877e.js",revision:"h6HX1ZY2WPtdyY7oJzceK"},{url:"/_next/static/chunks/254-4815653d2bf67d1d.js",revision:"h6HX1ZY2WPtdyY7oJzceK"},{url:"/_next/static/chunks/263-bb6ff6fc3fb099c4.js",revision:"h6HX1ZY2WPtdyY7oJzceK"},{url:"/_next/static/chunks/41-eafd7176cddea2ba.js",revision:"h6HX1ZY2WPtdyY7oJzceK"},{url:"/_next/static/chunks/462-ac1e4d8f89d95432.js",revision:"h6HX1ZY2WPtdyY7oJzceK"},{url:"/_next/static/chunks/541-c4af3dc4bc392f05.js",revision:"h6HX1ZY2WPtdyY7oJzceK"},{url:"/_next/static/chunks/86e1a07b-7f72c098e6e03a39.js",revision:"h6HX1ZY2WPtdyY7oJzceK"},{url:"/_next/static/chunks/905-2261588a184986a1.js",revision:"h6HX1ZY2WPtdyY7oJzceK"},{url:"/_next/static/chunks/app/layout-b08cc154fdd02ce8.js",revision:"h6HX1ZY2WPtdyY7oJzceK"},{url:"/_next/static/chunks/app/not-found-3692418744c0d1d5.js",revision:"h6HX1ZY2WPtdyY7oJzceK"},{url:"/_next/static/chunks/app/page-d6d5a681ac3b7db3.js",revision:"h6HX1ZY2WPtdyY7oJzceK"},{url:"/_next/static/chunks/app/share/%5Bslug%5D/page-de8f0f27c078bbd4.js",revision:"h6HX1ZY2WPtdyY7oJzceK"},{url:"/_next/static/chunks/app/sign-in/%5B%5B...sign-in%5D%5D/page-26041f17d5f9985b.js",revision:"h6HX1ZY2WPtdyY7oJzceK"},{url:"/_next/static/chunks/app/sign-up/%5B%5B...sign-up%5D%5D/page-eb30d0808f853edc.js",revision:"h6HX1ZY2WPtdyY7oJzceK"},{url:"/_next/static/chunks/framework-f780fd9bae3b8c58.js",revision:"h6HX1ZY2WPtdyY7oJzceK"},{url:"/_next/static/chunks/main-81be7c2bf95d14d0.js",revision:"h6HX1ZY2WPtdyY7oJzceK"},{url:"/_next/static/chunks/main-app-4e892a381f1d2350.js",revision:"h6HX1ZY2WPtdyY7oJzceK"},{url:"/_next/static/chunks/pages/_app-8769c17a84a46fbd.js",revision:"h6HX1ZY2WPtdyY7oJzceK"},{url:"/_next/static/chunks/pages/_error-9f74c4cf107131df.js",revision:"h6HX1ZY2WPtdyY7oJzceK"},{url:"/_next/static/chunks/polyfills-78c92fac7aa8fdd8.js",revision:"79330112775102f91e1010318bae2bd3"},{url:"/_next/static/chunks/webpack-47aba537f117a3d1.js",revision:"h6HX1ZY2WPtdyY7oJzceK"},{url:"/_next/static/css/627b86ffd590b9e0.css",revision:"627b86ffd590b9e0"},{url:"/_next/static/h6HX1ZY2WPtdyY7oJzceK/_buildManifest.js",revision:"1129f880a5ff50c5b128ef6344a2db53"},{url:"/_next/static/h6HX1ZY2WPtdyY7oJzceK/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({response:e})=>e&&"opaqueredirect"===e.type?new Response(e.body,{status:200,statusText:"OK",headers:e.headers}):e}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:2592e3})]}),"GET"),e.registerRoute(/\/_next\/static.+\.js$/i,new e.CacheFirst({cacheName:"next-static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:48,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({sameOrigin:e,url:{pathname:s}})=>!(!e||s.startsWith("/api/auth/")||!s.startsWith("/api/"))),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({request:e,url:{pathname:s},sameOrigin:n})=>"1"===e.headers.get("RSC")&&"1"===e.headers.get("Next-Router-Prefetch")&&n&&!s.startsWith("/api/")),new e.NetworkFirst({cacheName:"pages-rsc-prefetch",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({request:e,url:{pathname:s},sameOrigin:n})=>"1"===e.headers.get("RSC")&&n&&!s.startsWith("/api/")),new e.NetworkFirst({cacheName:"pages-rsc",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:{pathname:e},sameOrigin:s})=>s&&!e.startsWith("/api/")),new e.NetworkFirst({cacheName:"pages",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({sameOrigin:e})=>!e),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
