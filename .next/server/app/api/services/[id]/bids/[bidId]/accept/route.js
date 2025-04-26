/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/services/[id]/bids/[bidId]/accept/route";
exports.ids = ["app/api/services/[id]/bids/[bidId]/accept/route"];
exports.modules = {

/***/ "(rsc)/./app/api/auth/[...nextauth]/route.ts":
/*!*********************************************!*\
  !*** ./app/api/auth/[...nextauth]/route.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ handler),\n/* harmony export */   POST: () => (/* binding */ handler),\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/bcryptjs/index.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./app/lib/prisma.ts\");\n\n\n\n // ou onde está seu prisma\nconst authOptions = {\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__[\"default\"])({\n            name: \"credentials\",\n            credentials: {\n                email: {\n                    label: \"Email\",\n                    type: \"email\"\n                },\n                password: {\n                    label: \"Senha\",\n                    type: \"password\"\n                }\n            },\n            async authorize (credentials) {\n                if (!credentials?.email || !credentials?.password) {\n                    throw new Error(\"Credenciais inválidas\");\n                }\n                const user = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__[\"default\"].user.findUnique({\n                    where: {\n                        email: credentials.email\n                    }\n                });\n                if (!user || !user.password) {\n                    throw new Error(\"Usuário ou senha inválidos\");\n                }\n                const isPasswordValid = await (0,bcryptjs__WEBPACK_IMPORTED_MODULE_2__.compare)(credentials.password, user.password);\n                if (!isPasswordValid) {\n                    throw new Error(\"Usuário ou senha inválidos\");\n                }\n                return {\n                    id: user.id,\n                    email: user.email,\n                    name: user.name\n                };\n            }\n        })\n    ],\n    pages: {\n        signIn: \"/auth/login\",\n        signOut: \"/auth/logout\",\n        error: \"/auth/error\"\n    },\n    debug: \"development\" === \"development\",\n    session: {\n        strategy: \"jwt\"\n    },\n    secret: process.env.NEXTAUTH_SECRET,\n    callbacks: {\n        async jwt ({ token, user }) {\n            if (user) {\n                token.id = user.id;\n                token.sub = user.id;\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (session.user) {\n                session.user.id = token.id;\n            }\n            return session;\n        }\n    }\n};\nconst handler = next_auth__WEBPACK_IMPORTED_MODULE_0___default()(authOptions);\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUErRDtBQUNHO0FBQy9CO0FBQ0QsQ0FBQywwQkFBMEI7QUFjdEQsTUFBTUksY0FBK0I7SUFDMUNDLFdBQVc7UUFDVEosMkVBQW1CQSxDQUFDO1lBQ2xCSyxNQUFNO1lBQ05DLGFBQWE7Z0JBQ1hDLE9BQU87b0JBQUVDLE9BQU87b0JBQVNDLE1BQU07Z0JBQVE7Z0JBQ3ZDQyxVQUFVO29CQUFFRixPQUFPO29CQUFTQyxNQUFNO2dCQUFXO1lBQy9DO1lBQ0EsTUFBTUUsV0FBVUwsV0FBVztnQkFDekIsSUFBSSxDQUFDQSxhQUFhQyxTQUFTLENBQUNELGFBQWFJLFVBQVU7b0JBQ2pELE1BQU0sSUFBSUUsTUFBTTtnQkFDbEI7Z0JBRUEsTUFBTUMsT0FBTyxNQUFNWCxtREFBTUEsQ0FBQ1csSUFBSSxDQUFDQyxVQUFVLENBQUM7b0JBQ3hDQyxPQUFPO3dCQUNMUixPQUFPRCxZQUFZQyxLQUFLO29CQUMxQjtnQkFDRjtnQkFFQSxJQUFJLENBQUNNLFFBQVEsQ0FBQ0EsS0FBS0gsUUFBUSxFQUFFO29CQUMzQixNQUFNLElBQUlFLE1BQU07Z0JBQ2xCO2dCQUVBLE1BQU1JLGtCQUFrQixNQUFNZixpREFBT0EsQ0FDbkNLLFlBQVlJLFFBQVEsRUFDcEJHLEtBQUtILFFBQVE7Z0JBR2YsSUFBSSxDQUFDTSxpQkFBaUI7b0JBQ3BCLE1BQU0sSUFBSUosTUFBTTtnQkFDbEI7Z0JBRUEsT0FBTztvQkFDTEssSUFBSUosS0FBS0ksRUFBRTtvQkFDWFYsT0FBT00sS0FBS04sS0FBSztvQkFDakJGLE1BQU1RLEtBQUtSLElBQUk7Z0JBQ2pCO1lBQ0Y7UUFDRjtLQUNEO0lBQ0RhLE9BQU87UUFDTEMsUUFBUTtRQUNSQyxTQUFTO1FBQ1RDLE9BQU87SUFDVDtJQUNBQyxPQUFPQyxrQkFBeUI7SUFDaENDLFNBQVM7UUFDUEMsVUFBVTtJQUNaO0lBQ0FDLFFBQVFILFFBQVFJLEdBQUcsQ0FBQ0MsZUFBZTtJQUNuQ0MsV0FBVztRQUNULE1BQU1DLEtBQUksRUFBRUMsS0FBSyxFQUFFbEIsSUFBSSxFQUFFO1lBQ3ZCLElBQUlBLE1BQU07Z0JBQ1JrQixNQUFNZCxFQUFFLEdBQUdKLEtBQUtJLEVBQUU7Z0JBQ2xCYyxNQUFNQyxHQUFHLEdBQUduQixLQUFLSSxFQUFFO1lBQ3JCO1lBQ0EsT0FBT2M7UUFDVDtRQUNBLE1BQU1QLFNBQVEsRUFBRUEsT0FBTyxFQUFFTyxLQUFLLEVBQUU7WUFDOUIsSUFBSVAsUUFBUVgsSUFBSSxFQUFFO2dCQUNoQlcsUUFBUVgsSUFBSSxDQUFDSSxFQUFFLEdBQUdjLE1BQU1kLEVBQUU7WUFDNUI7WUFDQSxPQUFPTztRQUNUO0lBQ0Y7QUFDRixFQUFFO0FBRUYsTUFBTVMsVUFBVWxDLGdEQUFRQSxDQUFDSTtBQUNrQiIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFxPbMOhXFxEb2N1bWVudHNcXFVUQVNLXFxhcHBcXGFwaVxcYXV0aFxcWy4uLm5leHRhdXRoXVxccm91dGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE5leHRBdXRoLCB7IE5leHRBdXRoT3B0aW9ucywgU2Vzc2lvbiB9IGZyb20gXCJuZXh0LWF1dGhcIjtcbmltcG9ydCBDcmVkZW50aWFsc1Byb3ZpZGVyIGZyb20gXCJuZXh0LWF1dGgvcHJvdmlkZXJzL2NyZWRlbnRpYWxzXCI7XG5pbXBvcnQgeyBjb21wYXJlIH0gZnJvbSBcImJjcnlwdGpzXCI7XG5pbXBvcnQgcHJpc21hIGZyb20gXCJAL2xpYi9wcmlzbWFcIjsgLy8gb3Ugb25kZSBlc3TDoSBzZXUgcHJpc21hXG5cbi8vIEV4dGVuZCB0aGUgU2Vzc2lvbiB0eXBlIHRvIGluY2x1ZGUgdGhlIGlkIHByb3BlcnR5XG5kZWNsYXJlIG1vZHVsZSBcIm5leHQtYXV0aFwiIHtcbiAgaW50ZXJmYWNlIFNlc3Npb24ge1xuICAgIHVzZXI6IHtcbiAgICAgIGlkOiBzdHJpbmc7XG4gICAgICBuYW1lPzogc3RyaW5nIHwgbnVsbDtcbiAgICAgIGVtYWlsPzogc3RyaW5nIHwgbnVsbDtcbiAgICAgIGltYWdlPzogc3RyaW5nIHwgbnVsbDtcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBhdXRoT3B0aW9uczogTmV4dEF1dGhPcHRpb25zID0ge1xuICBwcm92aWRlcnM6IFtcbiAgICBDcmVkZW50aWFsc1Byb3ZpZGVyKHtcbiAgICAgIG5hbWU6IFwiY3JlZGVudGlhbHNcIixcbiAgICAgIGNyZWRlbnRpYWxzOiB7XG4gICAgICAgIGVtYWlsOiB7IGxhYmVsOiBcIkVtYWlsXCIsIHR5cGU6IFwiZW1haWxcIiB9LFxuICAgICAgICBwYXNzd29yZDogeyBsYWJlbDogXCJTZW5oYVwiLCB0eXBlOiBcInBhc3N3b3JkXCIgfVxuICAgICAgfSxcbiAgICAgIGFzeW5jIGF1dGhvcml6ZShjcmVkZW50aWFscykge1xuICAgICAgICBpZiAoIWNyZWRlbnRpYWxzPy5lbWFpbCB8fCAhY3JlZGVudGlhbHM/LnBhc3N3b3JkKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ3JlZGVuY2lhaXMgaW52w6FsaWRhc1wiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBwcmlzbWEudXNlci5maW5kVW5pcXVlKHtcbiAgICAgICAgICB3aGVyZToge1xuICAgICAgICAgICAgZW1haWw6IGNyZWRlbnRpYWxzLmVtYWlsXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIXVzZXIgfHwgIXVzZXIucGFzc3dvcmQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVc3XDoXJpbyBvdSBzZW5oYSBpbnbDoWxpZG9zXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaXNQYXNzd29yZFZhbGlkID0gYXdhaXQgY29tcGFyZShcbiAgICAgICAgICBjcmVkZW50aWFscy5wYXNzd29yZCxcbiAgICAgICAgICB1c2VyLnBhc3N3b3JkXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKCFpc1Bhc3N3b3JkVmFsaWQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVc3XDoXJpbyBvdSBzZW5oYSBpbnbDoWxpZG9zXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpZDogdXNlci5pZCxcbiAgICAgICAgICBlbWFpbDogdXNlci5lbWFpbCxcbiAgICAgICAgICBuYW1lOiB1c2VyLm5hbWUsXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSlcbiAgXSxcbiAgcGFnZXM6IHtcbiAgICBzaWduSW46IFwiL2F1dGgvbG9naW5cIixcbiAgICBzaWduT3V0OiBcIi9hdXRoL2xvZ291dFwiLFxuICAgIGVycm9yOiBcIi9hdXRoL2Vycm9yXCIsXG4gIH0sXG4gIGRlYnVnOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJkZXZlbG9wbWVudFwiLFxuICBzZXNzaW9uOiB7XG4gICAgc3RyYXRlZ3k6IFwiand0XCIsXG4gIH0sXG4gIHNlY3JldDogcHJvY2Vzcy5lbnYuTkVYVEFVVEhfU0VDUkVULFxuICBjYWxsYmFja3M6IHtcbiAgICBhc3luYyBqd3QoeyB0b2tlbiwgdXNlciB9KSB7XG4gICAgICBpZiAodXNlcikge1xuICAgICAgICB0b2tlbi5pZCA9IHVzZXIuaWQ7XG4gICAgICAgIHRva2VuLnN1YiA9IHVzZXIuaWQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gdG9rZW47XG4gICAgfSxcbiAgICBhc3luYyBzZXNzaW9uKHsgc2Vzc2lvbiwgdG9rZW4gfSkge1xuICAgICAgaWYgKHNlc3Npb24udXNlcikge1xuICAgICAgICBzZXNzaW9uLnVzZXIuaWQgPSB0b2tlbi5pZCBhcyBzdHJpbmc7XG4gICAgICB9XG4gICAgICByZXR1cm4gc2Vzc2lvbjtcbiAgICB9LFxuICB9LFxufTtcblxuY29uc3QgaGFuZGxlciA9IE5leHRBdXRoKGF1dGhPcHRpb25zKTtcbmV4cG9ydCB7IGhhbmRsZXIgYXMgR0VULCBoYW5kbGVyIGFzIFBPU1QgfTtcbiJdLCJuYW1lcyI6WyJOZXh0QXV0aCIsIkNyZWRlbnRpYWxzUHJvdmlkZXIiLCJjb21wYXJlIiwicHJpc21hIiwiYXV0aE9wdGlvbnMiLCJwcm92aWRlcnMiLCJuYW1lIiwiY3JlZGVudGlhbHMiLCJlbWFpbCIsImxhYmVsIiwidHlwZSIsInBhc3N3b3JkIiwiYXV0aG9yaXplIiwiRXJyb3IiLCJ1c2VyIiwiZmluZFVuaXF1ZSIsIndoZXJlIiwiaXNQYXNzd29yZFZhbGlkIiwiaWQiLCJwYWdlcyIsInNpZ25JbiIsInNpZ25PdXQiLCJlcnJvciIsImRlYnVnIiwicHJvY2VzcyIsInNlc3Npb24iLCJzdHJhdGVneSIsInNlY3JldCIsImVudiIsIk5FWFRBVVRIX1NFQ1JFVCIsImNhbGxiYWNrcyIsImp3dCIsInRva2VuIiwic3ViIiwiaGFuZGxlciIsIkdFVCIsIlBPU1QiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/auth/[...nextauth]/route.ts\n");

/***/ }),

/***/ "(rsc)/./app/api/services/[id]/bids/[bidId]/accept/route.ts":
/*!************************************************************!*\
  !*** ./app/api/services/[id]/bids/[bidId]/accept/route.ts ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./app/lib/prisma.ts\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _api_auth_nextauth_route__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/api/auth/[...nextauth]/route */ \"(rsc)/./app/api/auth/[...nextauth]/route.ts\");\n\n\n\n\n// POST /api/services/[id]/bids/[bidId]/accept - Aceitar uma proposta\nasync function POST(request, { params }) {\n    try {\n        console.log('API accept: Iniciando processamento de aceitação de proposta');\n        const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_2__.getServerSession)(_api_auth_nextauth_route__WEBPACK_IMPORTED_MODULE_3__.authOptions);\n        if (!session || !session.user) {\n            console.log('API accept: Usuário não autenticado');\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Não autorizado\"\n            }, {\n                status: 401\n            });\n        }\n        const { id: serviceId, bidId } = params;\n        console.log(`API accept: Aceitando proposta ${bidId} para serviço ${serviceId}`);\n        // Verificar se a proposta existe\n        const bid = await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__[\"default\"].serviceBid.findUnique({\n            where: {\n                id: bidId\n            },\n            include: {\n                service: {\n                    select: {\n                        id: true,\n                        creatorId: true,\n                        status: true\n                    }\n                },\n                provider: {\n                    select: {\n                        id: true\n                    }\n                }\n            }\n        });\n        if (!bid || bid.serviceId !== serviceId) {\n            console.log('API accept: Proposta não encontrada');\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Proposta não encontrada\"\n            }, {\n                status: 404\n            });\n        }\n        // Verificar se o usuário é o criador do serviço\n        const isServiceCreator = bid.service.creatorId === session.user.id;\n        if (!isServiceCreator) {\n            console.log('API accept: Usuário não é o criador do serviço');\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Apenas o criador do serviço pode aceitar propostas\"\n            }, {\n                status: 403\n            });\n        }\n        console.log('API accept: Atualizando status da proposta para ACCEPTED');\n        // Atualizar o status da proposta\n        const updatedBid = await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__[\"default\"].serviceBid.update({\n            where: {\n                id: bidId\n            },\n            data: {\n                status: \"ACCEPTED\"\n            }\n        });\n        console.log('API accept: Atualizando status do serviço para IN_PROGRESS');\n        // Atualizar o status do serviço\n        await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__[\"default\"].service.update({\n            where: {\n                id: serviceId\n            },\n            data: {\n                status: \"IN_PROGRESS\"\n            }\n        });\n        console.log('API accept: Rejeitando outras propostas');\n        // Rejeitar todas as outras propostas\n        await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__[\"default\"].serviceBid.updateMany({\n            where: {\n                serviceId,\n                id: {\n                    not: bidId\n                }\n            },\n            data: {\n                status: \"REJECTED\"\n            }\n        });\n        console.log('API accept: Criando notificação');\n        // Criar notificação\n        await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__[\"default\"].notification.create({\n            data: {\n                type: \"ACCEPTANCE\",\n                message: \"Sua proposta foi aceita!\",\n                receiver: {\n                    connect: {\n                        id: bid.providerId\n                    }\n                },\n                sender: {\n                    connect: {\n                        id: session.user.id\n                    }\n                }\n            }\n        });\n        console.log('API accept: Proposta aceita com sucesso');\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(updatedBid);\n    } catch (error) {\n        console.error(\"API accept: Erro ao aceitar proposta:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Erro ao processar a solicitação: \" + (error instanceof Error ? error.message : String(error))\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3NlcnZpY2VzL1tpZF0vYmlkcy9bYmlkSWRdL2FjY2VwdC9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBd0Q7QUFDdEI7QUFDVztBQUNnQjtBQUU3RCxxRUFBcUU7QUFDOUQsZUFBZUksS0FDcEJDLE9BQW9CLEVBQ3BCLEVBQUVDLE1BQU0sRUFBNkM7SUFFckQsSUFBSTtRQUNGQyxRQUFRQyxHQUFHLENBQUM7UUFDWixNQUFNQyxVQUFVLE1BQU1QLDJEQUFnQkEsQ0FBQ0MsaUVBQVdBO1FBRWxELElBQUksQ0FBQ00sV0FBVyxDQUFDQSxRQUFRQyxJQUFJLEVBQUU7WUFDN0JILFFBQVFDLEdBQUcsQ0FBQztZQUNaLE9BQU9SLHFEQUFZQSxDQUFDVyxJQUFJLENBQ3RCO2dCQUFFQyxPQUFPO1lBQWlCLEdBQzFCO2dCQUFFQyxRQUFRO1lBQUk7UUFFbEI7UUFFQSxNQUFNLEVBQUVDLElBQUlDLFNBQVMsRUFBRUMsS0FBSyxFQUFFLEdBQUdWO1FBQ2pDQyxRQUFRQyxHQUFHLENBQUMsQ0FBQywrQkFBK0IsRUFBRVEsTUFBTSxjQUFjLEVBQUVELFdBQVc7UUFFL0UsaUNBQWlDO1FBQ2pDLE1BQU1FLE1BQU0sTUFBTWhCLG1EQUFNQSxDQUFDaUIsVUFBVSxDQUFDQyxVQUFVLENBQUM7WUFDN0NDLE9BQU87Z0JBQUVOLElBQUlFO1lBQU07WUFDbkJLLFNBQVM7Z0JBQ1BDLFNBQVM7b0JBQ1BDLFFBQVE7d0JBQ05ULElBQUk7d0JBQ0pVLFdBQVc7d0JBQ1hYLFFBQVE7b0JBQ1Y7Z0JBQ0Y7Z0JBQ0FZLFVBQVU7b0JBQ1JGLFFBQVE7d0JBQ05ULElBQUk7b0JBQ047Z0JBQ0Y7WUFDRjtRQUNGO1FBRUEsSUFBSSxDQUFDRyxPQUFPQSxJQUFJRixTQUFTLEtBQUtBLFdBQVc7WUFDdkNSLFFBQVFDLEdBQUcsQ0FBQztZQUNaLE9BQU9SLHFEQUFZQSxDQUFDVyxJQUFJLENBQ3RCO2dCQUFFQyxPQUFPO1lBQTBCLEdBQ25DO2dCQUFFQyxRQUFRO1lBQUk7UUFFbEI7UUFFQSxnREFBZ0Q7UUFDaEQsTUFBTWEsbUJBQW1CVCxJQUFJSyxPQUFPLENBQUNFLFNBQVMsS0FBS2YsUUFBUUMsSUFBSSxDQUFDSSxFQUFFO1FBRWxFLElBQUksQ0FBQ1ksa0JBQWtCO1lBQ3JCbkIsUUFBUUMsR0FBRyxDQUFDO1lBQ1osT0FBT1IscURBQVlBLENBQUNXLElBQUksQ0FDdEI7Z0JBQUVDLE9BQU87WUFBcUQsR0FDOUQ7Z0JBQUVDLFFBQVE7WUFBSTtRQUVsQjtRQUVBTixRQUFRQyxHQUFHLENBQUM7UUFFWixpQ0FBaUM7UUFDakMsTUFBTW1CLGFBQWEsTUFBTTFCLG1EQUFNQSxDQUFDaUIsVUFBVSxDQUFDVSxNQUFNLENBQUM7WUFDaERSLE9BQU87Z0JBQUVOLElBQUlFO1lBQU07WUFDbkJhLE1BQU07Z0JBQUVoQixRQUFRO1lBQVc7UUFDN0I7UUFFQU4sUUFBUUMsR0FBRyxDQUFDO1FBRVosZ0NBQWdDO1FBQ2hDLE1BQU1QLG1EQUFNQSxDQUFDcUIsT0FBTyxDQUFDTSxNQUFNLENBQUM7WUFDMUJSLE9BQU87Z0JBQUVOLElBQUlDO1lBQVU7WUFDdkJjLE1BQU07Z0JBQUVoQixRQUFRO1lBQWM7UUFDaEM7UUFFQU4sUUFBUUMsR0FBRyxDQUFDO1FBRVoscUNBQXFDO1FBQ3JDLE1BQU1QLG1EQUFNQSxDQUFDaUIsVUFBVSxDQUFDWSxVQUFVLENBQUM7WUFDakNWLE9BQU87Z0JBQ0xMO2dCQUNBRCxJQUFJO29CQUFFaUIsS0FBS2Y7Z0JBQU07WUFDbkI7WUFDQWEsTUFBTTtnQkFBRWhCLFFBQVE7WUFBVztRQUM3QjtRQUVBTixRQUFRQyxHQUFHLENBQUM7UUFFWixvQkFBb0I7UUFDcEIsTUFBTVAsbURBQU1BLENBQUMrQixZQUFZLENBQUNDLE1BQU0sQ0FBQztZQUMvQkosTUFBTTtnQkFDSkssTUFBTTtnQkFDTkMsU0FBUztnQkFDVEMsVUFBVTtvQkFDUkMsU0FBUzt3QkFDUHZCLElBQUlHLElBQUlxQixVQUFVO29CQUNwQjtnQkFDRjtnQkFDQUMsUUFBUTtvQkFDTkYsU0FBUzt3QkFDUHZCLElBQUlMLFFBQVFDLElBQUksQ0FBQ0ksRUFBRTtvQkFDckI7Z0JBQ0Y7WUFDRjtRQUNGO1FBRUFQLFFBQVFDLEdBQUcsQ0FBQztRQUNaLE9BQU9SLHFEQUFZQSxDQUFDVyxJQUFJLENBQUNnQjtJQUMzQixFQUFFLE9BQU9mLE9BQU87UUFDZEwsUUFBUUssS0FBSyxDQUFDLHlDQUF5Q0E7UUFDdkQsT0FBT1oscURBQVlBLENBQUNXLElBQUksQ0FDdEI7WUFBRUMsT0FBTyxzQ0FBdUNBLENBQUFBLGlCQUFpQjRCLFFBQVE1QixNQUFNdUIsT0FBTyxHQUFHTSxPQUFPN0IsTUFBSztRQUFHLEdBQ3hHO1lBQUVDLFFBQVE7UUFBSTtJQUVsQjtBQUNGIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXE9sw6FcXERvY3VtZW50c1xcVVRBU0tcXGFwcFxcYXBpXFxzZXJ2aWNlc1xcW2lkXVxcYmlkc1xcW2JpZElkXVxcYWNjZXB0XFxyb3V0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVxdWVzdCwgTmV4dFJlc3BvbnNlIH0gZnJvbSBcIm5leHQvc2VydmVyXCI7XG5pbXBvcnQgcHJpc21hIGZyb20gXCJAL2xpYi9wcmlzbWFcIjtcbmltcG9ydCB7IGdldFNlcnZlclNlc3Npb24gfSBmcm9tIFwibmV4dC1hdXRoXCI7XG5pbXBvcnQgeyBhdXRoT3B0aW9ucyB9IGZyb20gXCJAL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGVcIjtcblxuLy8gUE9TVCAvYXBpL3NlcnZpY2VzL1tpZF0vYmlkcy9bYmlkSWRdL2FjY2VwdCAtIEFjZWl0YXIgdW1hIHByb3Bvc3RhXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVChcbiAgcmVxdWVzdDogTmV4dFJlcXVlc3QsXG4gIHsgcGFyYW1zIH06IHsgcGFyYW1zOiB7IGlkOiBzdHJpbmc7IGJpZElkOiBzdHJpbmcgfSB9XG4pIHtcbiAgdHJ5IHtcbiAgICBjb25zb2xlLmxvZygnQVBJIGFjY2VwdDogSW5pY2lhbmRvIHByb2Nlc3NhbWVudG8gZGUgYWNlaXRhw6fDo28gZGUgcHJvcG9zdGEnKTtcbiAgICBjb25zdCBzZXNzaW9uID0gYXdhaXQgZ2V0U2VydmVyU2Vzc2lvbihhdXRoT3B0aW9ucyk7XG4gICAgXG4gICAgaWYgKCFzZXNzaW9uIHx8ICFzZXNzaW9uLnVzZXIpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdBUEkgYWNjZXB0OiBVc3XDoXJpbyBuw6NvIGF1dGVudGljYWRvJyk7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICAgIHsgZXJyb3I6IFwiTsOjbyBhdXRvcml6YWRvXCIgfSxcbiAgICAgICAgeyBzdGF0dXM6IDQwMSB9XG4gICAgICApO1xuICAgIH1cbiAgICBcbiAgICBjb25zdCB7IGlkOiBzZXJ2aWNlSWQsIGJpZElkIH0gPSBwYXJhbXM7XG4gICAgY29uc29sZS5sb2coYEFQSSBhY2NlcHQ6IEFjZWl0YW5kbyBwcm9wb3N0YSAke2JpZElkfSBwYXJhIHNlcnZpw6dvICR7c2VydmljZUlkfWApO1xuICAgIFxuICAgIC8vIFZlcmlmaWNhciBzZSBhIHByb3Bvc3RhIGV4aXN0ZVxuICAgIGNvbnN0IGJpZCA9IGF3YWl0IHByaXNtYS5zZXJ2aWNlQmlkLmZpbmRVbmlxdWUoe1xuICAgICAgd2hlcmU6IHsgaWQ6IGJpZElkIH0sXG4gICAgICBpbmNsdWRlOiB7XG4gICAgICAgIHNlcnZpY2U6IHtcbiAgICAgICAgICBzZWxlY3Q6IHtcbiAgICAgICAgICAgIGlkOiB0cnVlLFxuICAgICAgICAgICAgY3JlYXRvcklkOiB0cnVlLFxuICAgICAgICAgICAgc3RhdHVzOiB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBwcm92aWRlcjoge1xuICAgICAgICAgIHNlbGVjdDoge1xuICAgICAgICAgICAgaWQ6IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICBcbiAgICBpZiAoIWJpZCB8fCBiaWQuc2VydmljZUlkICE9PSBzZXJ2aWNlSWQpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdBUEkgYWNjZXB0OiBQcm9wb3N0YSBuw6NvIGVuY29udHJhZGEnKTtcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcbiAgICAgICAgeyBlcnJvcjogXCJQcm9wb3N0YSBuw6NvIGVuY29udHJhZGFcIiB9LFxuICAgICAgICB7IHN0YXR1czogNDA0IH1cbiAgICAgICk7XG4gICAgfVxuICAgIFxuICAgIC8vIFZlcmlmaWNhciBzZSBvIHVzdcOhcmlvIMOpIG8gY3JpYWRvciBkbyBzZXJ2acOnb1xuICAgIGNvbnN0IGlzU2VydmljZUNyZWF0b3IgPSBiaWQuc2VydmljZS5jcmVhdG9ySWQgPT09IHNlc3Npb24udXNlci5pZDtcbiAgICBcbiAgICBpZiAoIWlzU2VydmljZUNyZWF0b3IpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdBUEkgYWNjZXB0OiBVc3XDoXJpbyBuw6NvIMOpIG8gY3JpYWRvciBkbyBzZXJ2acOnbycpO1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgICB7IGVycm9yOiBcIkFwZW5hcyBvIGNyaWFkb3IgZG8gc2VydmnDp28gcG9kZSBhY2VpdGFyIHByb3Bvc3Rhc1wiIH0sXG4gICAgICAgIHsgc3RhdHVzOiA0MDMgfVxuICAgICAgKTtcbiAgICB9XG4gICAgXG4gICAgY29uc29sZS5sb2coJ0FQSSBhY2NlcHQ6IEF0dWFsaXphbmRvIHN0YXR1cyBkYSBwcm9wb3N0YSBwYXJhIEFDQ0VQVEVEJyk7XG4gICAgXG4gICAgLy8gQXR1YWxpemFyIG8gc3RhdHVzIGRhIHByb3Bvc3RhXG4gICAgY29uc3QgdXBkYXRlZEJpZCA9IGF3YWl0IHByaXNtYS5zZXJ2aWNlQmlkLnVwZGF0ZSh7XG4gICAgICB3aGVyZTogeyBpZDogYmlkSWQgfSxcbiAgICAgIGRhdGE6IHsgc3RhdHVzOiBcIkFDQ0VQVEVEXCIgfVxuICAgIH0pO1xuICAgIFxuICAgIGNvbnNvbGUubG9nKCdBUEkgYWNjZXB0OiBBdHVhbGl6YW5kbyBzdGF0dXMgZG8gc2VydmnDp28gcGFyYSBJTl9QUk9HUkVTUycpO1xuICAgIFxuICAgIC8vIEF0dWFsaXphciBvIHN0YXR1cyBkbyBzZXJ2acOnb1xuICAgIGF3YWl0IHByaXNtYS5zZXJ2aWNlLnVwZGF0ZSh7XG4gICAgICB3aGVyZTogeyBpZDogc2VydmljZUlkIH0sXG4gICAgICBkYXRhOiB7IHN0YXR1czogXCJJTl9QUk9HUkVTU1wiIH1cbiAgICB9KTtcbiAgICBcbiAgICBjb25zb2xlLmxvZygnQVBJIGFjY2VwdDogUmVqZWl0YW5kbyBvdXRyYXMgcHJvcG9zdGFzJyk7XG4gICAgXG4gICAgLy8gUmVqZWl0YXIgdG9kYXMgYXMgb3V0cmFzIHByb3Bvc3Rhc1xuICAgIGF3YWl0IHByaXNtYS5zZXJ2aWNlQmlkLnVwZGF0ZU1hbnkoe1xuICAgICAgd2hlcmU6IHtcbiAgICAgICAgc2VydmljZUlkLFxuICAgICAgICBpZDogeyBub3Q6IGJpZElkIH1cbiAgICAgIH0sXG4gICAgICBkYXRhOiB7IHN0YXR1czogXCJSRUpFQ1RFRFwiIH1cbiAgICB9KTtcbiAgICBcbiAgICBjb25zb2xlLmxvZygnQVBJIGFjY2VwdDogQ3JpYW5kbyBub3RpZmljYcOnw6NvJyk7XG4gICAgXG4gICAgLy8gQ3JpYXIgbm90aWZpY2HDp8Ojb1xuICAgIGF3YWl0IHByaXNtYS5ub3RpZmljYXRpb24uY3JlYXRlKHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdHlwZTogXCJBQ0NFUFRBTkNFXCIsXG4gICAgICAgIG1lc3NhZ2U6IFwiU3VhIHByb3Bvc3RhIGZvaSBhY2VpdGEhXCIsXG4gICAgICAgIHJlY2VpdmVyOiB7XG4gICAgICAgICAgY29ubmVjdDoge1xuICAgICAgICAgICAgaWQ6IGJpZC5wcm92aWRlcklkXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBzZW5kZXI6IHtcbiAgICAgICAgICBjb25uZWN0OiB7XG4gICAgICAgICAgICBpZDogc2Vzc2lvbi51c2VyLmlkXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgXG4gICAgY29uc29sZS5sb2coJ0FQSSBhY2NlcHQ6IFByb3Bvc3RhIGFjZWl0YSBjb20gc3VjZXNzbycpO1xuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih1cGRhdGVkQmlkKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiQVBJIGFjY2VwdDogRXJybyBhbyBhY2VpdGFyIHByb3Bvc3RhOlwiLCBlcnJvcik7XG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgeyBlcnJvcjogXCJFcnJvIGFvIHByb2Nlc3NhciBhIHNvbGljaXRhw6fDo286IFwiICsgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKSkgfSxcbiAgICAgIHsgc3RhdHVzOiA1MDAgfVxuICAgICk7XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJwcmlzbWEiLCJnZXRTZXJ2ZXJTZXNzaW9uIiwiYXV0aE9wdGlvbnMiLCJQT1NUIiwicmVxdWVzdCIsInBhcmFtcyIsImNvbnNvbGUiLCJsb2ciLCJzZXNzaW9uIiwidXNlciIsImpzb24iLCJlcnJvciIsInN0YXR1cyIsImlkIiwic2VydmljZUlkIiwiYmlkSWQiLCJiaWQiLCJzZXJ2aWNlQmlkIiwiZmluZFVuaXF1ZSIsIndoZXJlIiwiaW5jbHVkZSIsInNlcnZpY2UiLCJzZWxlY3QiLCJjcmVhdG9ySWQiLCJwcm92aWRlciIsImlzU2VydmljZUNyZWF0b3IiLCJ1cGRhdGVkQmlkIiwidXBkYXRlIiwiZGF0YSIsInVwZGF0ZU1hbnkiLCJub3QiLCJub3RpZmljYXRpb24iLCJjcmVhdGUiLCJ0eXBlIiwibWVzc2FnZSIsInJlY2VpdmVyIiwiY29ubmVjdCIsInByb3ZpZGVySWQiLCJzZW5kZXIiLCJFcnJvciIsIlN0cmluZyJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/services/[id]/bids/[bidId]/accept/route.ts\n");

/***/ }),

/***/ "(rsc)/./app/lib/prisma.ts":
/*!***************************!*\
  !*** ./app/lib/prisma.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst prisma = global.prisma || new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();\nif (true) global.prisma = prisma;\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (prisma);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvbGliL3ByaXNtYS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBNkM7QUFNN0MsTUFBTUMsU0FBU0MsT0FBT0QsTUFBTSxJQUFJLElBQUlELHdEQUFZQTtBQUVoRCxJQUFJRyxJQUFxQyxFQUFFRCxPQUFPRCxNQUFNLEdBQUdBO0FBRTNELGlFQUFlQSxNQUFNQSxFQUFBIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXE9sw6FcXERvY3VtZW50c1xcVVRBU0tcXGFwcFxcbGliXFxwcmlzbWEudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJpc21hQ2xpZW50IH0gZnJvbSAnQHByaXNtYS9jbGllbnQnXG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgdmFyIHByaXNtYTogUHJpc21hQ2xpZW50IHwgdW5kZWZpbmVkXG59XG5cbmNvbnN0IHByaXNtYSA9IGdsb2JhbC5wcmlzbWEgfHwgbmV3IFByaXNtYUNsaWVudCgpXG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSBnbG9iYWwucHJpc21hID0gcHJpc21hXG5cbmV4cG9ydCBkZWZhdWx0IHByaXNtYSJdLCJuYW1lcyI6WyJQcmlzbWFDbGllbnQiLCJwcmlzbWEiLCJnbG9iYWwiLCJwcm9jZXNzIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/lib/prisma.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fservices%2F%5Bid%5D%2Fbids%2F%5BbidId%5D%2Faccept%2Froute&page=%2Fapi%2Fservices%2F%5Bid%5D%2Fbids%2F%5BbidId%5D%2Faccept%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fservices%2F%5Bid%5D%2Fbids%2F%5BbidId%5D%2Faccept%2Froute.ts&appDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fservices%2F%5Bid%5D%2Fbids%2F%5BbidId%5D%2Faccept%2Froute&page=%2Fapi%2Fservices%2F%5Bid%5D%2Fbids%2F%5BbidId%5D%2Faccept%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fservices%2F%5Bid%5D%2Fbids%2F%5BbidId%5D%2Faccept%2Froute.ts&appDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_Ol_Documents_UTASK_app_api_services_id_bids_bidId_accept_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/services/[id]/bids/[bidId]/accept/route.ts */ \"(rsc)/./app/api/services/[id]/bids/[bidId]/accept/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/services/[id]/bids/[bidId]/accept/route\",\n        pathname: \"/api/services/[id]/bids/[bidId]/accept\",\n        filename: \"route\",\n        bundlePath: \"app/api/services/[id]/bids/[bidId]/accept/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\Olá\\\\Documents\\\\UTASK\\\\app\\\\api\\\\services\\\\[id]\\\\bids\\\\[bidId]\\\\accept\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_Ol_Documents_UTASK_app_api_services_id_bids_bidId_accept_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZzZXJ2aWNlcyUyRiU1QmlkJTVEJTJGYmlkcyUyRiU1QmJpZElkJTVEJTJGYWNjZXB0JTJGcm91dGUmcGFnZT0lMkZhcGklMkZzZXJ2aWNlcyUyRiU1QmlkJTVEJTJGYmlkcyUyRiU1QmJpZElkJTVEJTJGYWNjZXB0JTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGc2VydmljZXMlMkYlNUJpZCU1RCUyRmJpZHMlMkYlNUJiaWRJZCU1RCUyRmFjY2VwdCUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNPbCVDMyVBMSU1Q0RvY3VtZW50cyU1Q1VUQVNLJTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj1DJTNBJTVDVXNlcnMlNUNPbCVDMyVBMSU1Q0RvY3VtZW50cyU1Q1VUQVNLJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUErRjtBQUN2QztBQUNxQjtBQUMyQztBQUN4SDtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNEQUFzRDtBQUM5RDtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUMwRjs7QUFFMUYiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiQzpcXFxcVXNlcnNcXFxcT2zDoVxcXFxEb2N1bWVudHNcXFxcVVRBU0tcXFxcYXBwXFxcXGFwaVxcXFxzZXJ2aWNlc1xcXFxbaWRdXFxcXGJpZHNcXFxcW2JpZElkXVxcXFxhY2NlcHRcXFxccm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL3NlcnZpY2VzL1tpZF0vYmlkcy9bYmlkSWRdL2FjY2VwdC9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL3NlcnZpY2VzL1tpZF0vYmlkcy9bYmlkSWRdL2FjY2VwdFwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvc2VydmljZXMvW2lkXS9iaWRzL1tiaWRJZF0vYWNjZXB0L3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiQzpcXFxcVXNlcnNcXFxcT2zDoVxcXFxEb2N1bWVudHNcXFxcVVRBU0tcXFxcYXBwXFxcXGFwaVxcXFxzZXJ2aWNlc1xcXFxbaWRdXFxcXGJpZHNcXFxcW2JpZElkXVxcXFxhY2NlcHRcXFxccm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICB3b3JrQXN5bmNTdG9yYWdlLFxuICAgICAgICB3b3JrVW5pdEFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fservices%2F%5Bid%5D%2Fbids%2F%5BbidId%5D%2Faccept%2Froute&page=%2Fapi%2Fservices%2F%5Bid%5D%2Fbids%2F%5BbidId%5D%2Faccept%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fservices%2F%5Bid%5D%2Fbids%2F%5BbidId%5D%2Faccept%2Froute.ts&appDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = require("@prisma/client");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("querystring");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/bcryptjs","vendor-chunks/oauth","vendor-chunks/object-hash","vendor-chunks/preact","vendor-chunks/uuid","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/lru-cache","vendor-chunks/cookie","vendor-chunks/oidc-token-hash","vendor-chunks/@panva"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fservices%2F%5Bid%5D%2Fbids%2F%5BbidId%5D%2Faccept%2Froute&page=%2Fapi%2Fservices%2F%5Bid%5D%2Fbids%2F%5BbidId%5D%2Faccept%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fservices%2F%5Bid%5D%2Fbids%2F%5BbidId%5D%2Faccept%2Froute.ts&appDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();