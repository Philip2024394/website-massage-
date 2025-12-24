import{t as l}from"./services-core.CpexPjvD.js";import"./vendor-appwrite.0FnTvHN4.js";import"./page-job-posting.5U_wzELA.js";const u={bookingCreated:"data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAJAA8AAABkYWN0YQ==",bookingAccepted:"data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAJAA8AAABkYWN0YQ==",bookingDeclined:"data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAJAA8AAABkYWN0YQ==",bookingBroadcast:"data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAJAA8AAABkYWN0YQ==",reminderPing:"data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAJAA8AAABkYWN0YQ=="},s={};function p(A,t=.6){try{let a=s[A];a?a.currentTime=0:(a=new Audio(u[A]),a.volume=t,s[A]=a),a.play().catch(()=>{})}catch{}}async function b(A,t=250){for(const a of A)p(a),await new Promise(o=>setTimeout(o,t))}function B(A,t,a){return`🛎️ NEW MASSAGE REQUEST
👤 Client: ${A.customerName}
📱 WhatsApp: ${A.customerWhatsApp}
⏱️ Duration: ${A.durationMinutes} min
💰 Price: IDR ${A.price}
`+(A.notes?`📝 Notes: ${A.notes}
`:"")+`
✅ Accept: ${t}
❌ Decline: ${a}

Respond within 15 minutes to secure booking.`}async function h(A,t){try{const o=(await l.getAll()).filter(e=>e.status?.toLowerCase?.()==="available"&&String(e.$id||e.id)!==String(t));if(o.length===0)return{broadcastCount:0,message:"No other therapists available."};let i=0;return o.slice(0,5).forEach(e=>{const n=`${window.location.origin}/accept-booking/${A.bookingId}?therapist=${e.$id||e.id}`,c=`${window.location.origin}/decline-booking/${A.bookingId}?therapist=${e.$id||e.id}`,r=B(A,n,c),d=`https://wa.me/${(e.whatsappNumber||"").replace(/[^\d]/g,"")}?text=${encodeURIComponent(r)}`;window.open(d,"_blank"),i++}),{broadcastCount:i,message:`Broadcasted to ${i} therapists.`}}catch(a){return{broadcastCount:0,message:"Broadcast failed: "+(a?.message||"Unknown error")}}}export{b as a,h as b,p};
