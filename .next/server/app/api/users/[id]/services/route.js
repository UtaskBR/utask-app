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
exports.id = "app/api/users/[id]/services/route";
exports.ids = ["app/api/users/[id]/services/route"];
exports.modules = {

/***/ "(rsc)/./app/api/auth/[...nextauth]/route.ts":
/*!*********************************************!*\
  !*** ./app/api/auth/[...nextauth]/route.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ handler),\n/* harmony export */   POST: () => (/* binding */ handler),\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/bcryptjs/index.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./app/lib/prisma.ts\");\n\n\n\n // ou onde está seu prisma\nconst authOptions = {\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__[\"default\"])({\n            name: \"credentials\",\n            credentials: {\n                email: {\n                    label: \"Email\",\n                    type: \"email\"\n                },\n                password: {\n                    label: \"Senha\",\n                    type: \"password\"\n                }\n            },\n            async authorize (credentials) {\n                if (!credentials?.email || !credentials?.password) {\n                    throw new Error(\"Credenciais inválidas\");\n                }\n                const user = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__[\"default\"].user.findUnique({\n                    where: {\n                        email: credentials.email\n                    }\n                });\n                if (!user || !user.password) {\n                    throw new Error(\"Usuário ou senha inválidos\");\n                }\n                const isPasswordValid = await (0,bcryptjs__WEBPACK_IMPORTED_MODULE_2__.compare)(credentials.password, user.password);\n                if (!isPasswordValid) {\n                    throw new Error(\"Usuário ou senha inválidos\");\n                }\n                return {\n                    id: user.id,\n                    email: user.email,\n                    name: user.name\n                };\n            }\n        })\n    ],\n    pages: {\n        signIn: \"/auth/login\",\n        signOut: \"/auth/logout\",\n        error: \"/auth/error\"\n    },\n    debug: \"development\" === \"development\",\n    session: {\n        strategy: \"jwt\"\n    },\n    secret: process.env.NEXTAUTH_SECRET,\n    callbacks: {\n        async jwt ({ token, user }) {\n            if (user) {\n                token.id = user.id;\n                token.sub = user.id;\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (session.user) {\n                session.user.id = token.id;\n            }\n            return session;\n        }\n    }\n};\nconst handler = next_auth__WEBPACK_IMPORTED_MODULE_0___default()(authOptions);\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUErRDtBQUNHO0FBQy9CO0FBQ0QsQ0FBQywwQkFBMEI7QUFjdEQsTUFBTUksY0FBK0I7SUFDMUNDLFdBQVc7UUFDVEosMkVBQW1CQSxDQUFDO1lBQ2xCSyxNQUFNO1lBQ05DLGFBQWE7Z0JBQ1hDLE9BQU87b0JBQUVDLE9BQU87b0JBQVNDLE1BQU07Z0JBQVE7Z0JBQ3ZDQyxVQUFVO29CQUFFRixPQUFPO29CQUFTQyxNQUFNO2dCQUFXO1lBQy9DO1lBQ0EsTUFBTUUsV0FBVUwsV0FBVztnQkFDekIsSUFBSSxDQUFDQSxhQUFhQyxTQUFTLENBQUNELGFBQWFJLFVBQVU7b0JBQ2pELE1BQU0sSUFBSUUsTUFBTTtnQkFDbEI7Z0JBRUEsTUFBTUMsT0FBTyxNQUFNWCxtREFBTUEsQ0FBQ1csSUFBSSxDQUFDQyxVQUFVLENBQUM7b0JBQ3hDQyxPQUFPO3dCQUNMUixPQUFPRCxZQUFZQyxLQUFLO29CQUMxQjtnQkFDRjtnQkFFQSxJQUFJLENBQUNNLFFBQVEsQ0FBQ0EsS0FBS0gsUUFBUSxFQUFFO29CQUMzQixNQUFNLElBQUlFLE1BQU07Z0JBQ2xCO2dCQUVBLE1BQU1JLGtCQUFrQixNQUFNZixpREFBT0EsQ0FDbkNLLFlBQVlJLFFBQVEsRUFDcEJHLEtBQUtILFFBQVE7Z0JBR2YsSUFBSSxDQUFDTSxpQkFBaUI7b0JBQ3BCLE1BQU0sSUFBSUosTUFBTTtnQkFDbEI7Z0JBRUEsT0FBTztvQkFDTEssSUFBSUosS0FBS0ksRUFBRTtvQkFDWFYsT0FBT00sS0FBS04sS0FBSztvQkFDakJGLE1BQU1RLEtBQUtSLElBQUk7Z0JBQ2pCO1lBQ0Y7UUFDRjtLQUNEO0lBQ0RhLE9BQU87UUFDTEMsUUFBUTtRQUNSQyxTQUFTO1FBQ1RDLE9BQU87SUFDVDtJQUNBQyxPQUFPQyxrQkFBeUI7SUFDaENDLFNBQVM7UUFDUEMsVUFBVTtJQUNaO0lBQ0FDLFFBQVFILFFBQVFJLEdBQUcsQ0FBQ0MsZUFBZTtJQUNuQ0MsV0FBVztRQUNULE1BQU1DLEtBQUksRUFBRUMsS0FBSyxFQUFFbEIsSUFBSSxFQUFFO1lBQ3ZCLElBQUlBLE1BQU07Z0JBQ1JrQixNQUFNZCxFQUFFLEdBQUdKLEtBQUtJLEVBQUU7Z0JBQ2xCYyxNQUFNQyxHQUFHLEdBQUduQixLQUFLSSxFQUFFO1lBQ3JCO1lBQ0EsT0FBT2M7UUFDVDtRQUNBLE1BQU1QLFNBQVEsRUFBRUEsT0FBTyxFQUFFTyxLQUFLLEVBQUU7WUFDOUIsSUFBSVAsUUFBUVgsSUFBSSxFQUFFO2dCQUNoQlcsUUFBUVgsSUFBSSxDQUFDSSxFQUFFLEdBQUdjLE1BQU1kLEVBQUU7WUFDNUI7WUFDQSxPQUFPTztRQUNUO0lBQ0Y7QUFDRixFQUFFO0FBRUYsTUFBTVMsVUFBVWxDLGdEQUFRQSxDQUFDSTtBQUNrQiIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFxPbMOhXFxEb2N1bWVudHNcXFVUQVNLXFxhcHBcXGFwaVxcYXV0aFxcWy4uLm5leHRhdXRoXVxccm91dGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE5leHRBdXRoLCB7IE5leHRBdXRoT3B0aW9ucywgU2Vzc2lvbiB9IGZyb20gXCJuZXh0LWF1dGhcIjtcbmltcG9ydCBDcmVkZW50aWFsc1Byb3ZpZGVyIGZyb20gXCJuZXh0LWF1dGgvcHJvdmlkZXJzL2NyZWRlbnRpYWxzXCI7XG5pbXBvcnQgeyBjb21wYXJlIH0gZnJvbSBcImJjcnlwdGpzXCI7XG5pbXBvcnQgcHJpc21hIGZyb20gXCJAL2xpYi9wcmlzbWFcIjsgLy8gb3Ugb25kZSBlc3TDoSBzZXUgcHJpc21hXG5cbi8vIEV4dGVuZCB0aGUgU2Vzc2lvbiB0eXBlIHRvIGluY2x1ZGUgdGhlIGlkIHByb3BlcnR5XG5kZWNsYXJlIG1vZHVsZSBcIm5leHQtYXV0aFwiIHtcbiAgaW50ZXJmYWNlIFNlc3Npb24ge1xuICAgIHVzZXI6IHtcbiAgICAgIGlkOiBzdHJpbmc7XG4gICAgICBuYW1lPzogc3RyaW5nIHwgbnVsbDtcbiAgICAgIGVtYWlsPzogc3RyaW5nIHwgbnVsbDtcbiAgICAgIGltYWdlPzogc3RyaW5nIHwgbnVsbDtcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBhdXRoT3B0aW9uczogTmV4dEF1dGhPcHRpb25zID0ge1xuICBwcm92aWRlcnM6IFtcbiAgICBDcmVkZW50aWFsc1Byb3ZpZGVyKHtcbiAgICAgIG5hbWU6IFwiY3JlZGVudGlhbHNcIixcbiAgICAgIGNyZWRlbnRpYWxzOiB7XG4gICAgICAgIGVtYWlsOiB7IGxhYmVsOiBcIkVtYWlsXCIsIHR5cGU6IFwiZW1haWxcIiB9LFxuICAgICAgICBwYXNzd29yZDogeyBsYWJlbDogXCJTZW5oYVwiLCB0eXBlOiBcInBhc3N3b3JkXCIgfVxuICAgICAgfSxcbiAgICAgIGFzeW5jIGF1dGhvcml6ZShjcmVkZW50aWFscykge1xuICAgICAgICBpZiAoIWNyZWRlbnRpYWxzPy5lbWFpbCB8fCAhY3JlZGVudGlhbHM/LnBhc3N3b3JkKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ3JlZGVuY2lhaXMgaW52w6FsaWRhc1wiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBwcmlzbWEudXNlci5maW5kVW5pcXVlKHtcbiAgICAgICAgICB3aGVyZToge1xuICAgICAgICAgICAgZW1haWw6IGNyZWRlbnRpYWxzLmVtYWlsXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIXVzZXIgfHwgIXVzZXIucGFzc3dvcmQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVc3XDoXJpbyBvdSBzZW5oYSBpbnbDoWxpZG9zXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaXNQYXNzd29yZFZhbGlkID0gYXdhaXQgY29tcGFyZShcbiAgICAgICAgICBjcmVkZW50aWFscy5wYXNzd29yZCxcbiAgICAgICAgICB1c2VyLnBhc3N3b3JkXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKCFpc1Bhc3N3b3JkVmFsaWQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVc3XDoXJpbyBvdSBzZW5oYSBpbnbDoWxpZG9zXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpZDogdXNlci5pZCxcbiAgICAgICAgICBlbWFpbDogdXNlci5lbWFpbCxcbiAgICAgICAgICBuYW1lOiB1c2VyLm5hbWUsXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSlcbiAgXSxcbiAgcGFnZXM6IHtcbiAgICBzaWduSW46IFwiL2F1dGgvbG9naW5cIixcbiAgICBzaWduT3V0OiBcIi9hdXRoL2xvZ291dFwiLFxuICAgIGVycm9yOiBcIi9hdXRoL2Vycm9yXCIsXG4gIH0sXG4gIGRlYnVnOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJkZXZlbG9wbWVudFwiLFxuICBzZXNzaW9uOiB7XG4gICAgc3RyYXRlZ3k6IFwiand0XCIsXG4gIH0sXG4gIHNlY3JldDogcHJvY2Vzcy5lbnYuTkVYVEFVVEhfU0VDUkVULFxuICBjYWxsYmFja3M6IHtcbiAgICBhc3luYyBqd3QoeyB0b2tlbiwgdXNlciB9KSB7XG4gICAgICBpZiAodXNlcikge1xuICAgICAgICB0b2tlbi5pZCA9IHVzZXIuaWQ7XG4gICAgICAgIHRva2VuLnN1YiA9IHVzZXIuaWQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gdG9rZW47XG4gICAgfSxcbiAgICBhc3luYyBzZXNzaW9uKHsgc2Vzc2lvbiwgdG9rZW4gfSkge1xuICAgICAgaWYgKHNlc3Npb24udXNlcikge1xuICAgICAgICBzZXNzaW9uLnVzZXIuaWQgPSB0b2tlbi5pZCBhcyBzdHJpbmc7XG4gICAgICB9XG4gICAgICByZXR1cm4gc2Vzc2lvbjtcbiAgICB9LFxuICB9LFxufTtcblxuY29uc3QgaGFuZGxlciA9IE5leHRBdXRoKGF1dGhPcHRpb25zKTtcbmV4cG9ydCB7IGhhbmRsZXIgYXMgR0VULCBoYW5kbGVyIGFzIFBPU1QgfTtcbiJdLCJuYW1lcyI6WyJOZXh0QXV0aCIsIkNyZWRlbnRpYWxzUHJvdmlkZXIiLCJjb21wYXJlIiwicHJpc21hIiwiYXV0aE9wdGlvbnMiLCJwcm92aWRlcnMiLCJuYW1lIiwiY3JlZGVudGlhbHMiLCJlbWFpbCIsImxhYmVsIiwidHlwZSIsInBhc3N3b3JkIiwiYXV0aG9yaXplIiwiRXJyb3IiLCJ1c2VyIiwiZmluZFVuaXF1ZSIsIndoZXJlIiwiaXNQYXNzd29yZFZhbGlkIiwiaWQiLCJwYWdlcyIsInNpZ25JbiIsInNpZ25PdXQiLCJlcnJvciIsImRlYnVnIiwicHJvY2VzcyIsInNlc3Npb24iLCJzdHJhdGVneSIsInNlY3JldCIsImVudiIsIk5FWFRBVVRIX1NFQ1JFVCIsImNhbGxiYWNrcyIsImp3dCIsInRva2VuIiwic3ViIiwiaGFuZGxlciIsIkdFVCIsIlBPU1QiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/auth/[...nextauth]/route.ts\n");

/***/ }),

/***/ "(rsc)/./app/api/users/[id]/services/route.ts":
/*!**********************************************!*\
  !*** ./app/api/users/[id]/services/route.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./app/lib/prisma.ts\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _api_auth_nextauth_route__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/api/auth/[...nextauth]/route */ \"(rsc)/./app/api/auth/[...nextauth]/route.ts\");\n\n\n\n\n// GET /api/users/[id]/services - Obter todos os serviços relacionados ao usuário\nasync function GET(request, { params }) {\n    try {\n        const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_2__.getServerSession)(_api_auth_nextauth_route__WEBPACK_IMPORTED_MODULE_3__.authOptions);\n        if (!session || !session.user) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Não autorizado\"\n            }, {\n                status: 401\n            });\n        }\n        const userId = params.id;\n        // Verificar se o usuário está tentando acessar seus próprios serviços\n        if (userId !== session.user.id) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Não autorizado a acessar serviços de outro usuário\"\n            }, {\n                status: 403\n            });\n        }\n        // Buscar serviços criados pelo usuário\n        const createdServices = await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__[\"default\"].service.findMany({\n            where: {\n                creatorId: userId\n            },\n            include: {\n                creator: {\n                    select: {\n                        id: true,\n                        name: true,\n                        image: true\n                    }\n                },\n                profession: true,\n                bids: {\n                    include: {\n                        provider: {\n                            select: {\n                                id: true,\n                                name: true,\n                                image: true\n                            }\n                        }\n                    }\n                }\n            },\n            orderBy: {\n                createdAt: 'desc'\n            }\n        });\n        // Buscar serviços onde o usuário fez propostas (candidaturas)\n        const servicesWithUserBids = await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__[\"default\"].service.findMany({\n            where: {\n                bids: {\n                    some: {\n                        providerId: userId\n                    }\n                }\n            },\n            include: {\n                creator: {\n                    select: {\n                        id: true,\n                        name: true,\n                        image: true\n                    }\n                },\n                profession: true,\n                bids: {\n                    where: {\n                        providerId: userId\n                    },\n                    include: {\n                        provider: {\n                            select: {\n                                id: true,\n                                name: true,\n                                image: true\n                            }\n                        }\n                    }\n                }\n            },\n            orderBy: {\n                createdAt: 'desc'\n            }\n        });\n        // Adicionar a proposta do usuário como uma propriedade separada para facilitar o acesso no frontend\n        const servicesWithUserBidsFormatted = servicesWithUserBids.map((service)=>({\n                ...service,\n                userBid: service.bids[0] // A consulta já filtra apenas as propostas do usuário\n            }));\n        // Combinar os dois conjuntos de serviços e remover duplicatas\n        const allServices = [\n            ...createdServices,\n            ...servicesWithUserBidsFormatted\n        ];\n        // Remover duplicatas (serviços que o usuário criou e também fez proposta)\n        const uniqueServices = Array.from(new Map(allServices.map((service)=>[\n                service.id,\n                service\n            ])).values());\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(uniqueServices);\n    } catch (error) {\n        console.error(\"Erro ao buscar serviços do usuário:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Erro ao processar a solicitação\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3VzZXJzL1tpZF0vc2VydmljZXMvcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQXdEO0FBQ3RCO0FBQ1c7QUFDZ0I7QUFFN0QsaUZBQWlGO0FBQzFFLGVBQWVJLElBQ3BCQyxPQUFvQixFQUNwQixFQUFFQyxNQUFNLEVBQThCO0lBRXRDLElBQUk7UUFDRixNQUFNQyxVQUFVLE1BQU1MLDJEQUFnQkEsQ0FBQ0MsaUVBQVdBO1FBRWxELElBQUksQ0FBQ0ksV0FBVyxDQUFDQSxRQUFRQyxJQUFJLEVBQUU7WUFDN0IsT0FBT1IscURBQVlBLENBQUNTLElBQUksQ0FDdEI7Z0JBQUVDLE9BQU87WUFBaUIsR0FDMUI7Z0JBQUVDLFFBQVE7WUFBSTtRQUVsQjtRQUVBLE1BQU1DLFNBQVNOLE9BQU9PLEVBQUU7UUFFeEIsc0VBQXNFO1FBQ3RFLElBQUlELFdBQVdMLFFBQVFDLElBQUksQ0FBQ0ssRUFBRSxFQUFFO1lBQzlCLE9BQU9iLHFEQUFZQSxDQUFDUyxJQUFJLENBQ3RCO2dCQUFFQyxPQUFPO1lBQXFELEdBQzlEO2dCQUFFQyxRQUFRO1lBQUk7UUFFbEI7UUFFQSx1Q0FBdUM7UUFDdkMsTUFBTUcsa0JBQWtCLE1BQU1iLG1EQUFNQSxDQUFDYyxPQUFPLENBQUNDLFFBQVEsQ0FBQztZQUNwREMsT0FBTztnQkFDTEMsV0FBV047WUFDYjtZQUNBTyxTQUFTO2dCQUNQQyxTQUFTO29CQUNQQyxRQUFRO3dCQUNOUixJQUFJO3dCQUNKUyxNQUFNO3dCQUNOQyxPQUFPO29CQUNUO2dCQUNGO2dCQUNBQyxZQUFZO2dCQUNaQyxNQUFNO29CQUNKTixTQUFTO3dCQUNQTyxVQUFVOzRCQUNSTCxRQUFRO2dDQUNOUixJQUFJO2dDQUNKUyxNQUFNO2dDQUNOQyxPQUFPOzRCQUNUO3dCQUNGO29CQUNGO2dCQUNGO1lBQ0Y7WUFDQUksU0FBUztnQkFDUEMsV0FBVztZQUNiO1FBQ0Y7UUFFQSw4REFBOEQ7UUFDOUQsTUFBTUMsdUJBQXVCLE1BQU01QixtREFBTUEsQ0FBQ2MsT0FBTyxDQUFDQyxRQUFRLENBQUM7WUFDekRDLE9BQU87Z0JBQ0xRLE1BQU07b0JBQ0pLLE1BQU07d0JBQ0pDLFlBQVluQjtvQkFDZDtnQkFDRjtZQUNGO1lBQ0FPLFNBQVM7Z0JBQ1BDLFNBQVM7b0JBQ1BDLFFBQVE7d0JBQ05SLElBQUk7d0JBQ0pTLE1BQU07d0JBQ05DLE9BQU87b0JBQ1Q7Z0JBQ0Y7Z0JBQ0FDLFlBQVk7Z0JBQ1pDLE1BQU07b0JBQ0pSLE9BQU87d0JBQ0xjLFlBQVluQjtvQkFDZDtvQkFDQU8sU0FBUzt3QkFDUE8sVUFBVTs0QkFDUkwsUUFBUTtnQ0FDTlIsSUFBSTtnQ0FDSlMsTUFBTTtnQ0FDTkMsT0FBTzs0QkFDVDt3QkFDRjtvQkFDRjtnQkFDRjtZQUNGO1lBQ0FJLFNBQVM7Z0JBQ1BDLFdBQVc7WUFDYjtRQUNGO1FBRUEsb0dBQW9HO1FBQ3BHLE1BQU1JLGdDQUFnQ0gscUJBQXFCSSxHQUFHLENBQUNsQixDQUFBQSxVQUFZO2dCQUN6RSxHQUFHQSxPQUFPO2dCQUNWbUIsU0FBU25CLFFBQVFVLElBQUksQ0FBQyxFQUFFLENBQUMsc0RBQXNEO1lBQ2pGO1FBRUEsOERBQThEO1FBQzlELE1BQU1VLGNBQWM7ZUFDZnJCO2VBQ0FrQjtTQUNKO1FBRUQsMEVBQTBFO1FBQzFFLE1BQU1JLGlCQUFpQkMsTUFBTUMsSUFBSSxDQUMvQixJQUFJQyxJQUFJSixZQUFZRixHQUFHLENBQUNsQixDQUFBQSxVQUFXO2dCQUFDQSxRQUFRRixFQUFFO2dCQUFFRTthQUFRLEdBQUd5QixNQUFNO1FBR25FLE9BQU94QyxxREFBWUEsQ0FBQ1MsSUFBSSxDQUFDMkI7SUFDM0IsRUFBRSxPQUFPMUIsT0FBTztRQUNkK0IsUUFBUS9CLEtBQUssQ0FBQyx1Q0FBdUNBO1FBQ3JELE9BQU9WLHFEQUFZQSxDQUFDUyxJQUFJLENBQ3RCO1lBQUVDLE9BQU87UUFBa0MsR0FDM0M7WUFBRUMsUUFBUTtRQUFJO0lBRWxCO0FBQ0YiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcT2zDoVxcRG9jdW1lbnRzXFxVVEFTS1xcYXBwXFxhcGlcXHVzZXJzXFxbaWRdXFxzZXJ2aWNlc1xccm91dGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlcXVlc3QsIE5leHRSZXNwb25zZSB9IGZyb20gXCJuZXh0L3NlcnZlclwiO1xyXG5pbXBvcnQgcHJpc21hIGZyb20gXCJAL2xpYi9wcmlzbWFcIjtcclxuaW1wb3J0IHsgZ2V0U2VydmVyU2Vzc2lvbiB9IGZyb20gXCJuZXh0LWF1dGhcIjtcclxuaW1wb3J0IHsgYXV0aE9wdGlvbnMgfSBmcm9tICdAL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGUnO1xyXG5cclxuLy8gR0VUIC9hcGkvdXNlcnMvW2lkXS9zZXJ2aWNlcyAtIE9idGVyIHRvZG9zIG9zIHNlcnZpw6dvcyByZWxhY2lvbmFkb3MgYW8gdXN1w6FyaW9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIEdFVChcclxuICByZXF1ZXN0OiBOZXh0UmVxdWVzdCxcclxuICB7IHBhcmFtcyB9OiB7IHBhcmFtczogeyBpZDogc3RyaW5nIH0gfVxyXG4pIHtcclxuICB0cnkge1xyXG4gICAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IGdldFNlcnZlclNlc3Npb24oYXV0aE9wdGlvbnMpO1xyXG4gICAgXHJcbiAgICBpZiAoIXNlc3Npb24gfHwgIXNlc3Npb24udXNlcikge1xyXG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXHJcbiAgICAgICAgeyBlcnJvcjogXCJOw6NvIGF1dG9yaXphZG9cIiB9LFxyXG4gICAgICAgIHsgc3RhdHVzOiA0MDEgfVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjb25zdCB1c2VySWQgPSBwYXJhbXMuaWQ7XHJcbiAgICBcclxuICAgIC8vIFZlcmlmaWNhciBzZSBvIHVzdcOhcmlvIGVzdMOhIHRlbnRhbmRvIGFjZXNzYXIgc2V1cyBwcsOzcHJpb3Mgc2VydmnDp29zXHJcbiAgICBpZiAodXNlcklkICE9PSBzZXNzaW9uLnVzZXIuaWQpIHtcclxuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxyXG4gICAgICAgIHsgZXJyb3I6IFwiTsOjbyBhdXRvcml6YWRvIGEgYWNlc3NhciBzZXJ2acOnb3MgZGUgb3V0cm8gdXN1w6FyaW9cIiB9LFxyXG4gICAgICAgIHsgc3RhdHVzOiA0MDMgfVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyBCdXNjYXIgc2VydmnDp29zIGNyaWFkb3MgcGVsbyB1c3XDoXJpb1xyXG4gICAgY29uc3QgY3JlYXRlZFNlcnZpY2VzID0gYXdhaXQgcHJpc21hLnNlcnZpY2UuZmluZE1hbnkoe1xyXG4gICAgICB3aGVyZToge1xyXG4gICAgICAgIGNyZWF0b3JJZDogdXNlcklkXHJcbiAgICAgIH0sXHJcbiAgICAgIGluY2x1ZGU6IHtcclxuICAgICAgICBjcmVhdG9yOiB7XHJcbiAgICAgICAgICBzZWxlY3Q6IHtcclxuICAgICAgICAgICAgaWQ6IHRydWUsXHJcbiAgICAgICAgICAgIG5hbWU6IHRydWUsXHJcbiAgICAgICAgICAgIGltYWdlOiB0cnVlXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBwcm9mZXNzaW9uOiB0cnVlLFxyXG4gICAgICAgIGJpZHM6IHtcclxuICAgICAgICAgIGluY2x1ZGU6IHtcclxuICAgICAgICAgICAgcHJvdmlkZXI6IHtcclxuICAgICAgICAgICAgICBzZWxlY3Q6IHtcclxuICAgICAgICAgICAgICAgIGlkOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGltYWdlOiB0cnVlXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBvcmRlckJ5OiB7XHJcbiAgICAgICAgY3JlYXRlZEF0OiAnZGVzYydcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIC8vIEJ1c2NhciBzZXJ2acOnb3Mgb25kZSBvIHVzdcOhcmlvIGZleiBwcm9wb3N0YXMgKGNhbmRpZGF0dXJhcylcclxuICAgIGNvbnN0IHNlcnZpY2VzV2l0aFVzZXJCaWRzID0gYXdhaXQgcHJpc21hLnNlcnZpY2UuZmluZE1hbnkoe1xyXG4gICAgICB3aGVyZToge1xyXG4gICAgICAgIGJpZHM6IHtcclxuICAgICAgICAgIHNvbWU6IHtcclxuICAgICAgICAgICAgcHJvdmlkZXJJZDogdXNlcklkXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBpbmNsdWRlOiB7XHJcbiAgICAgICAgY3JlYXRvcjoge1xyXG4gICAgICAgICAgc2VsZWN0OiB7XHJcbiAgICAgICAgICAgIGlkOiB0cnVlLFxyXG4gICAgICAgICAgICBuYW1lOiB0cnVlLFxyXG4gICAgICAgICAgICBpbWFnZTogdHJ1ZVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcHJvZmVzc2lvbjogdHJ1ZSxcclxuICAgICAgICBiaWRzOiB7XHJcbiAgICAgICAgICB3aGVyZToge1xyXG4gICAgICAgICAgICBwcm92aWRlcklkOiB1c2VySWRcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBpbmNsdWRlOiB7XHJcbiAgICAgICAgICAgIHByb3ZpZGVyOiB7XHJcbiAgICAgICAgICAgICAgc2VsZWN0OiB7XHJcbiAgICAgICAgICAgICAgICBpZDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIG5hbWU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBpbWFnZTogdHJ1ZVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgb3JkZXJCeToge1xyXG4gICAgICAgIGNyZWF0ZWRBdDogJ2Rlc2MnXHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICAvLyBBZGljaW9uYXIgYSBwcm9wb3N0YSBkbyB1c3XDoXJpbyBjb21vIHVtYSBwcm9wcmllZGFkZSBzZXBhcmFkYSBwYXJhIGZhY2lsaXRhciBvIGFjZXNzbyBubyBmcm9udGVuZFxyXG4gICAgY29uc3Qgc2VydmljZXNXaXRoVXNlckJpZHNGb3JtYXR0ZWQgPSBzZXJ2aWNlc1dpdGhVc2VyQmlkcy5tYXAoc2VydmljZSA9PiAoe1xyXG4gICAgICAuLi5zZXJ2aWNlLFxyXG4gICAgICB1c2VyQmlkOiBzZXJ2aWNlLmJpZHNbMF0gLy8gQSBjb25zdWx0YSBqw6EgZmlsdHJhIGFwZW5hcyBhcyBwcm9wb3N0YXMgZG8gdXN1w6FyaW9cclxuICAgIH0pKTtcclxuICAgIFxyXG4gICAgLy8gQ29tYmluYXIgb3MgZG9pcyBjb25qdW50b3MgZGUgc2VydmnDp29zIGUgcmVtb3ZlciBkdXBsaWNhdGFzXHJcbiAgICBjb25zdCBhbGxTZXJ2aWNlcyA9IFtcclxuICAgICAgLi4uY3JlYXRlZFNlcnZpY2VzLFxyXG4gICAgICAuLi5zZXJ2aWNlc1dpdGhVc2VyQmlkc0Zvcm1hdHRlZFxyXG4gICAgXTtcclxuICAgIFxyXG4gICAgLy8gUmVtb3ZlciBkdXBsaWNhdGFzIChzZXJ2acOnb3MgcXVlIG8gdXN1w6FyaW8gY3Jpb3UgZSB0YW1iw6ltIGZleiBwcm9wb3N0YSlcclxuICAgIGNvbnN0IHVuaXF1ZVNlcnZpY2VzID0gQXJyYXkuZnJvbShcclxuICAgICAgbmV3IE1hcChhbGxTZXJ2aWNlcy5tYXAoc2VydmljZSA9PiBbc2VydmljZS5pZCwgc2VydmljZV0pKS52YWx1ZXMoKVxyXG4gICAgKTtcclxuICAgIFxyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHVuaXF1ZVNlcnZpY2VzKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcihcIkVycm8gYW8gYnVzY2FyIHNlcnZpw6dvcyBkbyB1c3XDoXJpbzpcIiwgZXJyb3IpO1xyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxyXG4gICAgICB7IGVycm9yOiBcIkVycm8gYW8gcHJvY2Vzc2FyIGEgc29saWNpdGHDp8Ojb1wiIH0sXHJcbiAgICAgIHsgc3RhdHVzOiA1MDAgfVxyXG4gICAgKTtcclxuICB9XHJcbn1cclxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsInByaXNtYSIsImdldFNlcnZlclNlc3Npb24iLCJhdXRoT3B0aW9ucyIsIkdFVCIsInJlcXVlc3QiLCJwYXJhbXMiLCJzZXNzaW9uIiwidXNlciIsImpzb24iLCJlcnJvciIsInN0YXR1cyIsInVzZXJJZCIsImlkIiwiY3JlYXRlZFNlcnZpY2VzIiwic2VydmljZSIsImZpbmRNYW55Iiwid2hlcmUiLCJjcmVhdG9ySWQiLCJpbmNsdWRlIiwiY3JlYXRvciIsInNlbGVjdCIsIm5hbWUiLCJpbWFnZSIsInByb2Zlc3Npb24iLCJiaWRzIiwicHJvdmlkZXIiLCJvcmRlckJ5IiwiY3JlYXRlZEF0Iiwic2VydmljZXNXaXRoVXNlckJpZHMiLCJzb21lIiwicHJvdmlkZXJJZCIsInNlcnZpY2VzV2l0aFVzZXJCaWRzRm9ybWF0dGVkIiwibWFwIiwidXNlckJpZCIsImFsbFNlcnZpY2VzIiwidW5pcXVlU2VydmljZXMiLCJBcnJheSIsImZyb20iLCJNYXAiLCJ2YWx1ZXMiLCJjb25zb2xlIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/users/[id]/services/route.ts\n");

/***/ }),

/***/ "(rsc)/./app/lib/prisma.ts":
/*!***************************!*\
  !*** ./app/lib/prisma.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst prisma = global.prisma || new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();\nif (true) global.prisma = prisma;\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (prisma);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvbGliL3ByaXNtYS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBNkM7QUFNN0MsTUFBTUMsU0FBU0MsT0FBT0QsTUFBTSxJQUFJLElBQUlELHdEQUFZQTtBQUVoRCxJQUFJRyxJQUFxQyxFQUFFRCxPQUFPRCxNQUFNLEdBQUdBO0FBRTNELGlFQUFlQSxNQUFNQSxFQUFBIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXE9sw6FcXERvY3VtZW50c1xcVVRBU0tcXGFwcFxcbGliXFxwcmlzbWEudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJpc21hQ2xpZW50IH0gZnJvbSAnQHByaXNtYS9jbGllbnQnXG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgdmFyIHByaXNtYTogUHJpc21hQ2xpZW50IHwgdW5kZWZpbmVkXG59XG5cbmNvbnN0IHByaXNtYSA9IGdsb2JhbC5wcmlzbWEgfHwgbmV3IFByaXNtYUNsaWVudCgpXG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSBnbG9iYWwucHJpc21hID0gcHJpc21hXG5cbmV4cG9ydCBkZWZhdWx0IHByaXNtYSJdLCJuYW1lcyI6WyJQcmlzbWFDbGllbnQiLCJwcmlzbWEiLCJnbG9iYWwiLCJwcm9jZXNzIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/lib/prisma.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fusers%2F%5Bid%5D%2Fservices%2Froute&page=%2Fapi%2Fusers%2F%5Bid%5D%2Fservices%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fusers%2F%5Bid%5D%2Fservices%2Froute.ts&appDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fusers%2F%5Bid%5D%2Fservices%2Froute&page=%2Fapi%2Fusers%2F%5Bid%5D%2Fservices%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fusers%2F%5Bid%5D%2Fservices%2Froute.ts&appDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_Ol_Documents_UTASK_app_api_users_id_services_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/users/[id]/services/route.ts */ \"(rsc)/./app/api/users/[id]/services/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/users/[id]/services/route\",\n        pathname: \"/api/users/[id]/services\",\n        filename: \"route\",\n        bundlePath: \"app/api/users/[id]/services/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\Olá\\\\Documents\\\\UTASK\\\\app\\\\api\\\\users\\\\[id]\\\\services\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_Ol_Documents_UTASK_app_api_users_id_services_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZ1c2VycyUyRiU1QmlkJTVEJTJGc2VydmljZXMlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRnVzZXJzJTJGJTVCaWQlNUQlMkZzZXJ2aWNlcyUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRnVzZXJzJTJGJTVCaWQlNUQlMkZzZXJ2aWNlcyUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNPbCVDMyVBMSU1Q0RvY3VtZW50cyU1Q1VUQVNLJTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj1DJTNBJTVDVXNlcnMlNUNPbCVDMyVBMSU1Q0RvY3VtZW50cyU1Q1VUQVNLJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUErRjtBQUN2QztBQUNxQjtBQUMyQjtBQUN4RztBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNEQUFzRDtBQUM5RDtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUMwRjs7QUFFMUYiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiQzpcXFxcVXNlcnNcXFxcT2zDoVxcXFxEb2N1bWVudHNcXFxcVVRBU0tcXFxcYXBwXFxcXGFwaVxcXFx1c2Vyc1xcXFxbaWRdXFxcXHNlcnZpY2VzXFxcXHJvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS91c2Vycy9baWRdL3NlcnZpY2VzL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvdXNlcnMvW2lkXS9zZXJ2aWNlc1wiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvdXNlcnMvW2lkXS9zZXJ2aWNlcy9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkM6XFxcXFVzZXJzXFxcXE9sw6FcXFxcRG9jdW1lbnRzXFxcXFVUQVNLXFxcXGFwcFxcXFxhcGlcXFxcdXNlcnNcXFxcW2lkXVxcXFxzZXJ2aWNlc1xcXFxyb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHdvcmtBc3luY1N0b3JhZ2UsXG4gICAgICAgIHdvcmtVbml0QXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fusers%2F%5Bid%5D%2Fservices%2Froute&page=%2Fapi%2Fusers%2F%5Bid%5D%2Fservices%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fusers%2F%5Bid%5D%2Fservices%2Froute.ts&appDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

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
var __webpack_require__ = require("../../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/bcryptjs","vendor-chunks/oauth","vendor-chunks/object-hash","vendor-chunks/preact","vendor-chunks/uuid","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/lru-cache","vendor-chunks/cookie","vendor-chunks/oidc-token-hash","vendor-chunks/@panva"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fusers%2F%5Bid%5D%2Fservices%2Froute&page=%2Fapi%2Fusers%2F%5Bid%5D%2Fservices%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fusers%2F%5Bid%5D%2Fservices%2Froute.ts&appDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();