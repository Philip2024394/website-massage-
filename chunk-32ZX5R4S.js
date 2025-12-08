import{k as u}from"./chunk-YYM6AGDJ.js";import{a as g}from"./chunk-QU5UWLTU.js";import{a as c}from"./chunk-T4WGOU5E.js";import{c as l}from"./chunk-E6PAVYKE.js";var t=l(c());var d=t.createContext({outlet:null,matches:[],isDataRoute:!1});function y(){let{matches:e}=t.useContext(d),r=e[e.length-1];return r?r.params:{}}var N="startTransition",P=t[N];var U=new Promise(()=>{});var a=l(c()),b=l(g());var S="6";try{window.__reactRouterVersion=S}catch{}var w="startTransition",xe=a[w],_="flushSync",Fe=b[_],C="useId",De=a[C];var Pe=typeof window<"u"&&typeof window.document<"u"&&typeof window.document.createElement<"u";var f;(function(e){e.UseScrollRestoration="useScrollRestoration",e.UseSubmit="useSubmit",e.UseSubmitFetcher="useSubmitFetcher",e.UseFetcher="useFetcher",e.useViewTransitionState="useViewTransitionState"})(f||(f={}));var p;(function(e){e.UseFetcher="useFetcher",e.UseFetchers="useFetchers",e.UseScrollRestoration="useScrollRestoration"})(p||(p={}));var x={bookingCreated:"data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAJAA8AAABkYWN0YQ==",bookingAccepted:"data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAJAA8AAABkYWN0YQ==",bookingDeclined:"data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAJAA8AAABkYWN0YQ==",bookingBroadcast:"data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAJAA8AAABkYWN0YQ==",reminderPing:"data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAJAA8AAABkYWN0YQ=="},h={};function F(e,r=.6){try{let n=h[e];n?n.currentTime=0:(n=new Audio(x[e]),n.volume=r,h[e]=n),n.play().catch(()=>{})}catch(n){console.warn("Sound play failed",e,n)}}async function ke(e,r=250){for(let n of e)F(n),await new Promise(i=>setTimeout(i,r))}function D(e,r,n){return`\u{1F6CE}\uFE0F NEW MASSAGE REQUEST
\u{1F464} Client: ${e.customerName}
\u{1F4F1} WhatsApp: ${e.customerWhatsApp}
\u23F1\uFE0F Duration: ${e.durationMinutes} min
\u{1F4B0} Price: IDR ${e.price}
`+(e.notes?`\u{1F4DD} Notes: ${e.notes}
`:"")+`
\u2705 Accept: ${r}
\u274C Decline: ${n}

Respond within 15 minutes to secure booking.`}async function Ve(e,r){try{let i=(await u.getAll()).filter(o=>o.status?.toLowerCase?.()==="available"&&String(o.$id||o.id)!==String(r));if(i.length===0)return{broadcastCount:0,message:"No other therapists available."};let s=0;return i.slice(0,5).forEach(o=>{let m=`${window.location.origin}/accept-booking/${e.bookingId}?therapist=${o.$id||o.id}`,v=`${window.location.origin}/decline-booking/${e.bookingId}?therapist=${o.$id||o.id}`,R=D(e,m,v),E=`https://wa.me/${(o.whatsappNumber||"").replace(/[^\d]/g,"")}?text=${encodeURIComponent(R)}`;window.open(E,"_blank"),s++}),{broadcastCount:s,message:`Broadcasted to ${s} therapists.`}}catch(n){return{broadcastCount:0,message:"Broadcast failed: "+(n?.message||"Unknown error")}}}export{y as a,F as b,ke as c,Ve as d};
/*! Bundled license information:

react-router/dist/index.js:
  (**
   * React Router v6.30.1
   *
   * Copyright (c) Remix Software Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)

react-router-dom/dist/index.js:
  (**
   * React Router DOM v6.30.1
   *
   * Copyright (c) Remix Software Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)
*/
