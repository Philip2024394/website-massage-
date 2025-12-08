import{a as g}from"./chunk-6XCHOEK6.js";import"./chunk-FAHWMXD2.js";import{d as m}from"./chunk-E6PAVYKE.js";var d=class{constructor(){m(this,"apiEndpoint");m(this,"apiKey");this.apiEndpoint=process.env.NEXT_PUBLIC_WHATSAPP_API_ENDPOINT||"https://api.whatsapp.business/v1/messages",this.apiKey=process.env.NEXT_PUBLIC_WHATSAPP_API_KEY||"demo-key"}formatPhoneNumber(t){let s=t.replace(/\D/g,"");return s.startsWith("0")?s="62"+s.substring(1):s.startsWith("62")||(s="62"+s),"+"+s}async generateBookingMessage(t,s,a){let e={en:`\u{1F389} NEW BOOKING REQUEST!

\u{1F464} Customer: {customerName}
\u{1F486} Service: {service}
\u{1F4C5} Date & Time: {datetime}
\u23F1\uFE0F Duration: {duration}
\u{1F4CD} Location: {location}

\u{1F4AC} A chat window has been opened for direct communication with your customer.

\u26A0\uFE0F **IMPORTANT - RESPONSE REQUIRED WITHIN 10 MINUTES**
\u2022 \u23F0 You have 10 minutes to respond to this booking
\u2022 \u{1F6A8} No response = Automatic penalties:
  - \u2B50 1-star review added to your profile
  - \u{1FA99} 200 coins deducted from account
  - \u{1F4E2} Warning issued for terms violation
\u2022 \u{1F504} Booking will be sent to nearby therapists
\u2022 \u{1F4BC} Repeated violations = Account deactivation WITHOUT notice

\u2705 Please respond immediately to avoid penalties.
\u{1F4F1} Open IndaStreet app now to accept this booking.

\u{1F468}\u200D\u{1F4BC} - Admin Team IndaStreet`,id:`\u{1F389} PERMINTAAN BOOKING BARU!

\u{1F464} Pelanggan: {customerName}
\u{1F486} Layanan: {service}
\u{1F4C5} Tanggal & Waktu: {datetime}
\u23F1\uFE0F Durasi: {duration}
\u{1F4CD} Lokasi: {location}

\u{1F4AC} Jendela chat telah dibuka untuk komunikasi langsung dengan pelanggan Anda.

\u26A0\uFE0F **PENTING - RESPON DIPERLUKAN DALAM 10 MENIT**
\u2022 \u23F0 Anda punya 10 menit untuk merespon booking ini
\u2022 \u{1F6A8} Tidak ada respon = Penalti otomatis:
  - \u2B50 Review 1 bintang ditambahkan ke profil Anda
  - \u{1FA99} 200 koin dikurangi dari akun
  - \u{1F4E2} Peringatan diberikan untuk pelanggaran syarat
\u2022 \u{1F504} Booking akan dikirim ke terapis terdekat
\u2022 \u{1F4BC} Pelanggaran berulang = Akun dinonaktifkan TANPA pemberitahuan

\u2705 Harap respon segera untuk menghindari penalti.
\u{1F4F1} Buka aplikasi IndaStreet sekarang untuk menerima booking ini.

\u{1F468}\u200D\u{1F4BC} - Tim Admin IndaStreet`}[s];if(t&&(e=e.replace("{customerName}",t.customerName).replace("{service}",t.service).replace("{datetime}",t.datetime).replace("{duration}",t.duration).replace("{location}",t.location||"Customer Location")),a!==s)try{let r=await g(t?.service||"",a,s);e=e.replace(t?.service||"",`${t?.service} (${r})`)}catch(r){console.warn("Translation failed, using original text:",r)}return e}async sendBookingNotification(t,s,a,o){try{let e=this.formatPhoneNumber(t),r=await this.generateBookingMessage(o,s,a);if(console.log("\u{1F4F1} Sending WhatsApp message to:",e),console.log("\u{1F4DD} Message:",r),this.apiKey==="demo-key")return console.log("\u{1F527} DEMO MODE: WhatsApp message simulated"),console.log("\u{1F4F1} To:",e),console.log("\u{1F4DD} Message:",r),await new Promise(c=>setTimeout(c,500)),{success:!0,messageId:`demo_${Date.now()}`};let p=await fetch(this.apiEndpoint,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.apiKey}`},body:JSON.stringify({to:e,type:"text",text:{body:r}})}),i=await p.json();return p.ok?(console.log("\u2705 WhatsApp message sent successfully:",i),{success:!0,messageId:i.messages?.[0]?.id}):(console.error("\u274C WhatsApp API error:",i),{success:!1,error:i.error?.message||"Failed to send message"})}catch(e){return console.error("\u274C WhatsApp service error:",e),{success:!1,error:e instanceof Error?e.message:"Unknown error"}}}async sendBookingReminder(t,s,a,o){try{let e=this.formatPhoneNumber(t),p={en:`\u23F0 URGENT BOOKING REMINDER!

\u{1F464} Customer ${a} is still waiting for your response.

\u23F1\uFE0F Only ${o} minutes left to confirm!

Please check your IndaStreet chat window immediately.

\u{1F4BC} Don't miss this opportunity!`,id:`\u23F0 PENGINGAT BOOKING MENDESAK!

\u{1F464} Pelanggan ${a} masih menunggu respon Anda.

\u23F1\uFE0F Hanya tersisa ${o} menit untuk konfirmasi!

Silakan cek jendela chat IndaStreet Anda segera.

\u{1F4BC} Jangan lewatkan kesempatan ini!`}[s];if(console.log("\u{1F4F1} Sending WhatsApp reminder to:",e),this.apiKey==="demo-key")return console.log("\u{1F527} DEMO MODE: WhatsApp reminder simulated"),console.log("\u{1F4DD} Message:",p),{success:!0,messageId:`demo_reminder_${Date.now()}`};let i=await fetch(this.apiEndpoint,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.apiKey}`},body:JSON.stringify({to:e,type:"text",text:{body:p}})}),c=await i.json();return i.ok?{success:!0,messageId:c.messages?.[0]?.id}:{success:!1,error:c.error?.message||"Failed to send reminder"}}catch(e){return console.error("\u274C WhatsApp reminder error:",e),{success:!1,error:e instanceof Error?e.message:"Unknown error"}}}openWhatsAppChat(t,s){let a=this.formatPhoneNumber(t),o=encodeURIComponent(s),e=`https://wa.me/${a.replace("+","")}?text=${o}`;console.log("\u{1F517} Opening WhatsApp URL:",e),window.open(e,"_blank")}},l=new d;function h(n,t){return t==="therapist"?n.whatsappNumber||n.whatsapp||n.phone||"":n.whatsappNumber||n.whatsapp||n.contactNumber||n.phone||""}function k(n){return n.language||n.preferredLanguage||"id"}export{d as WhatsAppService,k as getProviderLanguage,h as getProviderWhatsApp,l as whatsappService};
