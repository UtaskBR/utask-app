(()=>{var e={};e.id=8945,e.ids=[8945],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},11723:e=>{"use strict";e.exports=require("querystring")},12269:(e,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0})},12412:e=>{"use strict";e.exports=require("assert")},13700:(e,r,t)=>{"use strict";t.d(r,{A:()=>i});var s=t(96330);let i=global.prisma||new s.PrismaClient},19854:(e,r,t)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var s={};Object.defineProperty(r,"default",{enumerable:!0,get:function(){return a.default}});var i=t(12269);Object.keys(i).forEach(function(e){!("default"===e||"__esModule"===e||Object.prototype.hasOwnProperty.call(s,e))&&(e in r&&r[e]===i[e]||Object.defineProperty(r,e,{enumerable:!0,get:function(){return i[e]}}))});var a=function(e,r){if(e&&e.__esModule)return e;if(null===e||"object"!=typeof e&&"function"!=typeof e)return{default:e};var t=o(r);if(t&&t.has(e))return t.get(e);var s={__proto__:null},i=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var a in e)if("default"!==a&&({}).hasOwnProperty.call(e,a)){var n=i?Object.getOwnPropertyDescriptor(e,a):null;n&&(n.get||n.set)?Object.defineProperty(s,a,n):s[a]=e[a]}return s.default=e,t&&t.set(e,s),s}(t(35426));function o(e){if("function"!=typeof WeakMap)return null;var r=new WeakMap,t=new WeakMap;return(o=function(e){return e?t:r})(e)}Object.keys(a).forEach(function(e){!("default"===e||"__esModule"===e||Object.prototype.hasOwnProperty.call(s,e))&&(e in r&&r[e]===a[e]||Object.defineProperty(r,e,{enumerable:!0,get:function(){return a[e]}}))})},28354:e=>{"use strict";e.exports=require("util")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:e=>{"use strict";e.exports=require("crypto")},55591:e=>{"use strict";e.exports=require("https")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},68232:(e,r,t)=>{"use strict";t.r(r),t.d(r,{patchFetch:()=>E,routeModule:()=>f,serverHooks:()=>m,workAsyncStorage:()=>_,workUnitAsyncStorage:()=>w});var s={};t.r(s),t.d(s,{GET:()=>l,POST:()=>v});var i=t(96559),a=t(48088),o=t(37719),n=t(32190),u=t(13700),d=t(19854),c=t(99982),p=t(96330);async function l(e){try{let e=await (0,d.getServerSession)(c.N);if(!e||!e.user)return n.NextResponse.json({error:"N\xe3o autorizado"},{status:401});let r=e.user.id,t=await u.A.$queryRaw`
      SELECT 
        f.id as favorite_id,
        f."createdAt" as favorite_created_at,
        s.id as service_id,
        s.title as service_title,
        s.description as service_description,
        s.date as service_date,
        s."timeWindow" as service_time_window,
        s.value as service_value,
        s.status as service_status,
        s.latitude as service_latitude,
        s.longitude as service_longitude,
        s.address as service_address,
        s."createdAt" as service_created_at,
        s."updatedAt" as service_updated_at,
        u.id as creator_id,
        u.name as creator_name,
        u.image as creator_image,
        p.id as profession_id,
        p.name as profession_name,
        p.icon as profession_icon
      FROM "Favorite" f
      JOIN "Service" s ON f."serviceId" = s.id
      JOIN "User" u ON s."creatorId" = u.id
      LEFT JOIN "Profession" p ON s."professionId" = p.id
      WHERE f."userId" = ${r}
      ORDER BY f."createdAt" DESC
    `,s=t.map(e=>e.service_id),i=await u.A.$queryRaw`
      SELECT id, url, "serviceId"
      FROM "Photo"
      WHERE "serviceId" IN (${p.Prisma.join(s)})
    `,a=t.map(e=>e.creator_id),o=await u.A.$queryRaw`
      SELECT "receiverId", rating
      FROM "Review"
      WHERE "receiverId" IN (${p.Prisma.join(a)})
    `,l={};a.forEach(e=>{let r=o.filter(r=>r.receiverId===e);if(r.length>0){let t=r.reduce((e,r)=>e+r.rating,0);l[e]=t/r.length}else l[e]=0});let v=t.map(e=>{let t=i.filter(r=>r.serviceId===e.service_id);return{id:e.favorite_id,createdAt:e.favorite_created_at,userId:r,serviceId:e.service_id,service:{id:e.service_id,title:e.service_title,description:e.service_description,date:e.service_date,timeWindow:e.service_time_window,value:e.service_value,status:e.service_status,latitude:e.service_latitude,longitude:e.service_longitude,address:e.service_address,createdAt:e.service_created_at,updatedAt:e.service_updated_at,creatorId:e.creator_id,creator:{id:e.creator_id,name:e.creator_name,image:e.creator_image,rating:l[e.creator_id]||null},professionId:e.profession_id,profession:e.profession_id?{id:e.profession_id,name:e.profession_name,icon:e.profession_icon}:null,photos:t.map(e=>({id:e.id,url:e.url}))}}});return n.NextResponse.json(v)}catch(e){return console.error("Erro ao buscar favoritos:",e),n.NextResponse.json({error:"Erro ao processar a solicita\xe7\xe3o"},{status:500})}}async function v(e){try{let r=await (0,d.getServerSession)(c.N);if(!r||!r.user)return n.NextResponse.json({error:"N\xe3o autorizado"},{status:401});let t=r.user.id,{serviceId:s}=await e.json();if(!s)return n.NextResponse.json({error:"ID do servi\xe7o n\xe3o fornecido"},{status:400});let i=await u.A.$queryRaw`
      SELECT id FROM "Service" WHERE id = ${s}
    `;if(!i||0===i.length)return n.NextResponse.json({error:"Servi\xe7o n\xe3o encontrado"},{status:404});let a=await u.A.$queryRaw`
      SELECT id FROM "Favorite" WHERE "userId" = ${t} AND "serviceId" = ${s}
    `;if(a&&a.length>0)return n.NextResponse.json({error:"Servi\xe7o j\xe1 est\xe1 nos favoritos"},{status:400});await u.A.$executeRaw`
      INSERT INTO "Favorite" ("id", "userId", "serviceId", "createdAt")
      VALUES (${p.Prisma.raw("gen_random_uuid()")}, ${t}, ${s}, ${new Date})
    `;let o=await u.A.$queryRaw`
      SELECT * FROM "Favorite" 
      WHERE "userId" = ${t} AND "serviceId" = ${s}
    `;return n.NextResponse.json(o[0],{status:201})}catch(e){return console.error("Erro ao adicionar favorito:",e),n.NextResponse.json({error:"Erro ao processar a solicita\xe7\xe3o"},{status:500})}}let f=new i.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/favorites/route",pathname:"/api/favorites",filename:"route",bundlePath:"app/api/favorites/route"},resolvedPagePath:"C:\\Users\\Ol\xe1\\Documents\\UTASK\\app\\api\\favorites\\route.ts",nextConfigOutput:"",userland:s}),{workAsyncStorage:_,workUnitAsyncStorage:w,serverHooks:m}=f;function E(){return(0,o.patchFetch)({workAsyncStorage:_,workUnitAsyncStorage:w})}},74075:e=>{"use strict";e.exports=require("zlib")},78335:()=>{},79428:e=>{"use strict";e.exports=require("buffer")},79551:e=>{"use strict";e.exports=require("url")},81630:e=>{"use strict";e.exports=require("http")},94735:e=>{"use strict";e.exports=require("events")},96330:e=>{"use strict";e.exports=require("@prisma/client")},96487:()=>{},99982:(e,r,t)=>{"use strict";t.d(r,{N:()=>o});var s=t(13581),i=t(85663),a=t(13700);let o={providers:[(0,s.A)({name:"credentials",credentials:{email:{label:"Email",type:"email"},password:{label:"Senha",type:"password"}},async authorize(e){if(!e?.email||!e?.password)throw Error("Credenciais inv\xe1lidas");let r=await a.A.user.findUnique({where:{email:e.email}});if(!r||!r.password||!await (0,i.UD)(e.password,r.password))throw Error("Usu\xe1rio ou senha inv\xe1lidos");return{id:r.id,email:r.email,name:r.name}}})],pages:{signIn:"/auth/login",signOut:"/auth/logout",error:"/auth/error"},debug:!1,session:{strategy:"jwt"},secret:process.env.NEXTAUTH_SECRET,callbacks:{jwt:async({token:e,user:r})=>(r&&(e.id=r.id,e.sub=r.id),e),session:async({session:e,token:r})=>(e.user&&(e.user.id=r.id),e)}}}};var r=require("../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[4243,4613,3112,2190],()=>t(68232));module.exports=s})();