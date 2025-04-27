(()=>{var e={};e.id=5661,e.ids=[5661],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},13700:(e,r,t)=>{"use strict";t.d(r,{A:()=>a});var s=t(96330);let a=global.prisma||new s.PrismaClient},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},45527:(e,r,t)=>{"use strict";t.r(r),t.d(r,{patchFetch:()=>w,routeModule:()=>c,serverHooks:()=>m,workAsyncStorage:()=>l,workUnitAsyncStorage:()=>x});var s={};t.r(s),t.d(s,{POST:()=>d});var a=t(96559),o=t(48088),i=t(37719),n=t(32190),u=t(13700),p=t(85663);async function d(e){try{let{name:r,email:t,password:s,about:a,city:o,state:i}=await e.json();if(!r||!t||!s)return n.NextResponse.json({error:"Dados obrigat\xf3rios n\xe3o fornecidos"},{status:400});let d=await u.A.$queryRaw`
      SELECT id FROM "User" WHERE email = ${t}
    `;if(d&&d.length>0)return n.NextResponse.json({error:"Email j\xe1 cadastrado"},{status:400});let c=await (0,p.tW)(s,10),l=crypto.randomUUID(),x=crypto.randomUUID(),m=new Date;await u.A.$executeRaw`
      INSERT INTO "User" (
        id, 
        name, 
        email, 
        password, 
        about, 
        city, 
        state, 
        "createdAt", 
        "updatedAt"
      )
      VALUES (
        ${l}, 
        ${r}, 
        ${t}, 
        ${c}, 
        ${a||null}, 
        ${o||null}, 
        ${i||null}, 
        ${m}, 
        ${m}
      )
    `,await u.A.$executeRaw`
      INSERT INTO "Wallet" (
        id,
        balance,
        "userId",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${x},
        0,
        ${l},
        ${m},
        ${m}
      )
    `;let w=await u.A.$queryRaw`
      SELECT 
        id, 
        name, 
        email, 
        about, 
        city, 
        state, 
        image, 
        "createdAt", 
        "updatedAt"
      FROM "User" 
      WHERE id = ${l}
    `;if(!w||0===w.length)throw Error("Erro ao criar usu\xe1rio");let g=w[0];return n.NextResponse.json(g,{status:201})}catch(e){return console.error("Erro ao registrar usu\xe1rio:",e),n.NextResponse.json({error:"Erro ao processar a solicita\xe7\xe3o"},{status:500})}}let c=new a.AppRouteRouteModule({definition:{kind:o.RouteKind.APP_ROUTE,page:"/api/register/route",pathname:"/api/register",filename:"route",bundlePath:"app/api/register/route"},resolvedPagePath:"C:\\Users\\Ol\xe1\\Documents\\UTASK\\app\\api\\register\\route.ts",nextConfigOutput:"",userland:s}),{workAsyncStorage:l,workUnitAsyncStorage:x,serverHooks:m}=c;function w(){return(0,i.patchFetch)({workAsyncStorage:l,workUnitAsyncStorage:x})}},55511:e=>{"use strict";e.exports=require("crypto")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},78335:()=>{},96330:e=>{"use strict";e.exports=require("@prisma/client")},96487:()=>{}};var r=require("../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[4243,4613,2190],()=>t(45527));module.exports=s})();