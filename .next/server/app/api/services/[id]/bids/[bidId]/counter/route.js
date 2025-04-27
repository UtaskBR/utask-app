(()=>{var e={};e.id=2651,e.ids=[2651],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},11723:e=>{"use strict";e.exports=require("querystring")},12269:(e,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0})},12412:e=>{"use strict";e.exports=require("assert")},13700:(e,r,t)=>{"use strict";t.d(r,{A:()=>o});var s=t(96330);let o=global.prisma||new s.PrismaClient},19854:(e,r,t)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var s={};Object.defineProperty(r,"default",{enumerable:!0,get:function(){return a.default}});var o=t(12269);Object.keys(o).forEach(function(e){!("default"===e||"__esModule"===e||Object.prototype.hasOwnProperty.call(s,e))&&(e in r&&r[e]===o[e]||Object.defineProperty(r,e,{enumerable:!0,get:function(){return o[e]}}))});var a=function(e,r){if(e&&e.__esModule)return e;if(null===e||"object"!=typeof e&&"function"!=typeof e)return{default:e};var t=i(r);if(t&&t.has(e))return t.get(e);var s={__proto__:null},o=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var a in e)if("default"!==a&&({}).hasOwnProperty.call(e,a)){var n=o?Object.getOwnPropertyDescriptor(e,a):null;n&&(n.get||n.set)?Object.defineProperty(s,a,n):s[a]=e[a]}return s.default=e,t&&t.set(e,s),s}(t(35426));function i(e){if("function"!=typeof WeakMap)return null;var r=new WeakMap,t=new WeakMap;return(i=function(e){return e?t:r})(e)}Object.keys(a).forEach(function(e){!("default"===e||"__esModule"===e||Object.prototype.hasOwnProperty.call(s,e))&&(e in r&&r[e]===a[e]||Object.defineProperty(r,e,{enumerable:!0,get:function(){return a[e]}}))})},28354:e=>{"use strict";e.exports=require("util")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},50834:(e,r,t)=>{"use strict";t.r(r),t.d(r,{patchFetch:()=>g,routeModule:()=>l,serverHooks:()=>b,workAsyncStorage:()=>v,workUnitAsyncStorage:()=>f});var s={};t.r(s),t.d(s,{POST:()=>p});var o=t(96559),a=t(48088),i=t(37719),n=t(32190),u=t(13700),c=t(19854),d=t(99982);async function p(e,{params:r}){try{console.log("API counter: Iniciando processamento de contraproposta");let t=await (0,c.getServerSession)(d.N);if(!t||!t.user)return console.log("API counter: Usu\xe1rio n\xe3o autenticado"),n.NextResponse.json({error:"N\xe3o autorizado"},{status:401});let{id:s,bidId:o}=await r;console.log(`API counter: Processando contraproposta para proposta ${o} do servi\xe7o ${s}`);let{value:a,proposedDate:i,message:p}=await e.json();console.log("API counter: Dados recebidos:",{value:a,proposedDate:i,message:p});let l=await u.A.$queryRaw`
      SELECT 
        sb.id, 
        sb."serviceId", 
        sb."providerId", 
        sb.status,
        s.id as service_id,
        s."creatorId" as service_creator_id,
        s.status as service_status
      FROM "ServiceBid" sb
      JOIN "Service" s ON sb."serviceId" = s.id
      WHERE sb.id = ${o}
    `;if(!l||0===l.length||l[0].serviceId!==s)return console.log("API counter: Proposta n\xe3o encontrada"),n.NextResponse.json({error:"Proposta n\xe3o encontrada"},{status:404});let v=l[0];if(v.service_creator_id!==t.user.id)return console.log("API counter: Usu\xe1rio n\xe3o \xe9 o criador do servi\xe7o"),n.NextResponse.json({error:"Apenas o criador do servi\xe7o pode fazer contrapropostas"},{status:403});console.log("API counter: Atualizando proposta com contraproposta");let f=new Date,b=void 0!==a?parseFloat(a):null,g=i?new Date(i):null;await u.A.$executeRaw`
      UPDATE "ServiceBid"
      SET 
        status = 'COUNTER_OFFER', 
        value = COALESCE(${b}, value),
        "proposedDate" = COALESCE(${g}, "proposedDate"),
        message = COALESCE(${p||null}, message),
        "updatedAt" = ${f}
      WHERE id = ${o}
    `;let w=await u.A.$queryRaw`
      SELECT * FROM "ServiceBid" WHERE id = ${o}
    `;console.log("API counter: Criando notifica\xe7\xe3o");let y=crypto.randomUUID();return await u.A.$executeRaw`
      INSERT INTO "Notification" (
        id, 
        type, 
        message, 
        "receiverId", 
        "senderId", 
        "createdAt", 
        "updatedAt",
        read
      )
      VALUES (
        ${y}, 
        'COUNTER_OFFER', 
        'Você recebeu uma contraproposta.', 
        ${v.providerId}, 
        ${t.user.id}, 
        ${f}, 
        ${f},
        false
      )
    `,console.log("API counter: Contraproposta enviada com sucesso"),n.NextResponse.json(w[0])}catch(e){return console.error("API counter: Erro ao processar contraproposta:",e),n.NextResponse.json({error:"Erro ao processar a solicita\xe7\xe3o: "+(e instanceof Error?e.message:String(e))},{status:500})}}let l=new o.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/services/[id]/bids/[bidId]/counter/route",pathname:"/api/services/[id]/bids/[bidId]/counter",filename:"route",bundlePath:"app/api/services/[id]/bids/[bidId]/counter/route"},resolvedPagePath:"C:\\Users\\Ol\xe1\\Documents\\UTASK\\app\\api\\services\\[id]\\bids\\[bidId]\\counter\\route.ts",nextConfigOutput:"",userland:s}),{workAsyncStorage:v,workUnitAsyncStorage:f,serverHooks:b}=l;function g(){return(0,i.patchFetch)({workAsyncStorage:v,workUnitAsyncStorage:f})}},55511:e=>{"use strict";e.exports=require("crypto")},55591:e=>{"use strict";e.exports=require("https")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},74075:e=>{"use strict";e.exports=require("zlib")},78335:()=>{},79428:e=>{"use strict";e.exports=require("buffer")},79551:e=>{"use strict";e.exports=require("url")},81630:e=>{"use strict";e.exports=require("http")},94735:e=>{"use strict";e.exports=require("events")},96330:e=>{"use strict";e.exports=require("@prisma/client")},96487:()=>{},99982:(e,r,t)=>{"use strict";t.d(r,{N:()=>i});var s=t(13581),o=t(85663),a=t(13700);let i={providers:[(0,s.A)({name:"credentials",credentials:{email:{label:"Email",type:"email"},password:{label:"Senha",type:"password"}},async authorize(e){if(!e?.email||!e?.password)throw Error("Credenciais inv\xe1lidas");let r=await a.A.user.findUnique({where:{email:e.email}});if(!r||!r.password||!await (0,o.UD)(e.password,r.password))throw Error("Usu\xe1rio ou senha inv\xe1lidos");return{id:r.id,email:r.email,name:r.name}}})],pages:{signIn:"/auth/login",signOut:"/auth/logout",error:"/auth/error"},debug:!1,session:{strategy:"jwt"},secret:process.env.NEXTAUTH_SECRET,callbacks:{jwt:async({token:e,user:r})=>(r&&(e.id=r.id,e.sub=r.id),e),session:async({session:e,token:r})=>(e.user&&(e.user.id=r.id),e)}}}};var r=require("../../../../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[4243,4613,3112,2190],()=>t(50834));module.exports=s})();