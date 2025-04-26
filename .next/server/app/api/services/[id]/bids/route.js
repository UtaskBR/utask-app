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
exports.id = "app/api/services/[id]/bids/route";
exports.ids = ["app/api/services/[id]/bids/route"];
exports.modules = {

/***/ "(rsc)/./app/api/auth/[...nextauth]/route.ts":
/*!*********************************************!*\
  !*** ./app/api/auth/[...nextauth]/route.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ handler),\n/* harmony export */   POST: () => (/* binding */ handler),\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/bcryptjs/index.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./app/lib/prisma.ts\");\n\n\n\n // ou onde está seu prisma\nconst authOptions = {\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__[\"default\"])({\n            name: \"credentials\",\n            credentials: {\n                email: {\n                    label: \"Email\",\n                    type: \"email\"\n                },\n                password: {\n                    label: \"Senha\",\n                    type: \"password\"\n                }\n            },\n            async authorize (credentials) {\n                if (!credentials?.email || !credentials?.password) {\n                    throw new Error(\"Credenciais inválidas\");\n                }\n                const user = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__[\"default\"].user.findUnique({\n                    where: {\n                        email: credentials.email\n                    }\n                });\n                if (!user || !user.password) {\n                    throw new Error(\"Usuário ou senha inválidos\");\n                }\n                const isPasswordValid = await (0,bcryptjs__WEBPACK_IMPORTED_MODULE_2__.compare)(credentials.password, user.password);\n                if (!isPasswordValid) {\n                    throw new Error(\"Usuário ou senha inválidos\");\n                }\n                return {\n                    id: user.id,\n                    email: user.email,\n                    name: user.name\n                };\n            }\n        })\n    ],\n    pages: {\n        signIn: \"/auth/login\",\n        signOut: \"/auth/logout\",\n        error: \"/auth/error\"\n    },\n    debug: \"development\" === \"development\",\n    session: {\n        strategy: \"jwt\"\n    },\n    secret: process.env.NEXTAUTH_SECRET,\n    callbacks: {\n        async jwt ({ token, user }) {\n            if (user) {\n                token.id = user.id;\n                token.sub = user.id;\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (session.user) {\n                session.user.id = token.id;\n            }\n            return session;\n        }\n    }\n};\nconst handler = next_auth__WEBPACK_IMPORTED_MODULE_0___default()(authOptions);\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUErRDtBQUNHO0FBQy9CO0FBQ0QsQ0FBQywwQkFBMEI7QUFjdEQsTUFBTUksY0FBK0I7SUFDMUNDLFdBQVc7UUFDVEosMkVBQW1CQSxDQUFDO1lBQ2xCSyxNQUFNO1lBQ05DLGFBQWE7Z0JBQ1hDLE9BQU87b0JBQUVDLE9BQU87b0JBQVNDLE1BQU07Z0JBQVE7Z0JBQ3ZDQyxVQUFVO29CQUFFRixPQUFPO29CQUFTQyxNQUFNO2dCQUFXO1lBQy9DO1lBQ0EsTUFBTUUsV0FBVUwsV0FBVztnQkFDekIsSUFBSSxDQUFDQSxhQUFhQyxTQUFTLENBQUNELGFBQWFJLFVBQVU7b0JBQ2pELE1BQU0sSUFBSUUsTUFBTTtnQkFDbEI7Z0JBRUEsTUFBTUMsT0FBTyxNQUFNWCxtREFBTUEsQ0FBQ1csSUFBSSxDQUFDQyxVQUFVLENBQUM7b0JBQ3hDQyxPQUFPO3dCQUNMUixPQUFPRCxZQUFZQyxLQUFLO29CQUMxQjtnQkFDRjtnQkFFQSxJQUFJLENBQUNNLFFBQVEsQ0FBQ0EsS0FBS0gsUUFBUSxFQUFFO29CQUMzQixNQUFNLElBQUlFLE1BQU07Z0JBQ2xCO2dCQUVBLE1BQU1JLGtCQUFrQixNQUFNZixpREFBT0EsQ0FDbkNLLFlBQVlJLFFBQVEsRUFDcEJHLEtBQUtILFFBQVE7Z0JBR2YsSUFBSSxDQUFDTSxpQkFBaUI7b0JBQ3BCLE1BQU0sSUFBSUosTUFBTTtnQkFDbEI7Z0JBRUEsT0FBTztvQkFDTEssSUFBSUosS0FBS0ksRUFBRTtvQkFDWFYsT0FBT00sS0FBS04sS0FBSztvQkFDakJGLE1BQU1RLEtBQUtSLElBQUk7Z0JBQ2pCO1lBQ0Y7UUFDRjtLQUNEO0lBQ0RhLE9BQU87UUFDTEMsUUFBUTtRQUNSQyxTQUFTO1FBQ1RDLE9BQU87SUFDVDtJQUNBQyxPQUFPQyxrQkFBeUI7SUFDaENDLFNBQVM7UUFDUEMsVUFBVTtJQUNaO0lBQ0FDLFFBQVFILFFBQVFJLEdBQUcsQ0FBQ0MsZUFBZTtJQUNuQ0MsV0FBVztRQUNULE1BQU1DLEtBQUksRUFBRUMsS0FBSyxFQUFFbEIsSUFBSSxFQUFFO1lBQ3ZCLElBQUlBLE1BQU07Z0JBQ1JrQixNQUFNZCxFQUFFLEdBQUdKLEtBQUtJLEVBQUU7Z0JBQ2xCYyxNQUFNQyxHQUFHLEdBQUduQixLQUFLSSxFQUFFO1lBQ3JCO1lBQ0EsT0FBT2M7UUFDVDtRQUNBLE1BQU1QLFNBQVEsRUFBRUEsT0FBTyxFQUFFTyxLQUFLLEVBQUU7WUFDOUIsSUFBSVAsUUFBUVgsSUFBSSxFQUFFO2dCQUNoQlcsUUFBUVgsSUFBSSxDQUFDSSxFQUFFLEdBQUdjLE1BQU1kLEVBQUU7WUFDNUI7WUFDQSxPQUFPTztRQUNUO0lBQ0Y7QUFDRixFQUFFO0FBRUYsTUFBTVMsVUFBVWxDLGdEQUFRQSxDQUFDSTtBQUNrQiIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFxPbMOhXFxEb2N1bWVudHNcXFVUQVNLXFxhcHBcXGFwaVxcYXV0aFxcWy4uLm5leHRhdXRoXVxccm91dGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE5leHRBdXRoLCB7IE5leHRBdXRoT3B0aW9ucywgU2Vzc2lvbiB9IGZyb20gXCJuZXh0LWF1dGhcIjtcbmltcG9ydCBDcmVkZW50aWFsc1Byb3ZpZGVyIGZyb20gXCJuZXh0LWF1dGgvcHJvdmlkZXJzL2NyZWRlbnRpYWxzXCI7XG5pbXBvcnQgeyBjb21wYXJlIH0gZnJvbSBcImJjcnlwdGpzXCI7XG5pbXBvcnQgcHJpc21hIGZyb20gXCJAL2xpYi9wcmlzbWFcIjsgLy8gb3Ugb25kZSBlc3TDoSBzZXUgcHJpc21hXG5cbi8vIEV4dGVuZCB0aGUgU2Vzc2lvbiB0eXBlIHRvIGluY2x1ZGUgdGhlIGlkIHByb3BlcnR5XG5kZWNsYXJlIG1vZHVsZSBcIm5leHQtYXV0aFwiIHtcbiAgaW50ZXJmYWNlIFNlc3Npb24ge1xuICAgIHVzZXI6IHtcbiAgICAgIGlkOiBzdHJpbmc7XG4gICAgICBuYW1lPzogc3RyaW5nIHwgbnVsbDtcbiAgICAgIGVtYWlsPzogc3RyaW5nIHwgbnVsbDtcbiAgICAgIGltYWdlPzogc3RyaW5nIHwgbnVsbDtcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBhdXRoT3B0aW9uczogTmV4dEF1dGhPcHRpb25zID0ge1xuICBwcm92aWRlcnM6IFtcbiAgICBDcmVkZW50aWFsc1Byb3ZpZGVyKHtcbiAgICAgIG5hbWU6IFwiY3JlZGVudGlhbHNcIixcbiAgICAgIGNyZWRlbnRpYWxzOiB7XG4gICAgICAgIGVtYWlsOiB7IGxhYmVsOiBcIkVtYWlsXCIsIHR5cGU6IFwiZW1haWxcIiB9LFxuICAgICAgICBwYXNzd29yZDogeyBsYWJlbDogXCJTZW5oYVwiLCB0eXBlOiBcInBhc3N3b3JkXCIgfVxuICAgICAgfSxcbiAgICAgIGFzeW5jIGF1dGhvcml6ZShjcmVkZW50aWFscykge1xuICAgICAgICBpZiAoIWNyZWRlbnRpYWxzPy5lbWFpbCB8fCAhY3JlZGVudGlhbHM/LnBhc3N3b3JkKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ3JlZGVuY2lhaXMgaW52w6FsaWRhc1wiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBwcmlzbWEudXNlci5maW5kVW5pcXVlKHtcbiAgICAgICAgICB3aGVyZToge1xuICAgICAgICAgICAgZW1haWw6IGNyZWRlbnRpYWxzLmVtYWlsXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIXVzZXIgfHwgIXVzZXIucGFzc3dvcmQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVc3XDoXJpbyBvdSBzZW5oYSBpbnbDoWxpZG9zXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaXNQYXNzd29yZFZhbGlkID0gYXdhaXQgY29tcGFyZShcbiAgICAgICAgICBjcmVkZW50aWFscy5wYXNzd29yZCxcbiAgICAgICAgICB1c2VyLnBhc3N3b3JkXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKCFpc1Bhc3N3b3JkVmFsaWQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVc3XDoXJpbyBvdSBzZW5oYSBpbnbDoWxpZG9zXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpZDogdXNlci5pZCxcbiAgICAgICAgICBlbWFpbDogdXNlci5lbWFpbCxcbiAgICAgICAgICBuYW1lOiB1c2VyLm5hbWUsXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSlcbiAgXSxcbiAgcGFnZXM6IHtcbiAgICBzaWduSW46IFwiL2F1dGgvbG9naW5cIixcbiAgICBzaWduT3V0OiBcIi9hdXRoL2xvZ291dFwiLFxuICAgIGVycm9yOiBcIi9hdXRoL2Vycm9yXCIsXG4gIH0sXG4gIGRlYnVnOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJkZXZlbG9wbWVudFwiLFxuICBzZXNzaW9uOiB7XG4gICAgc3RyYXRlZ3k6IFwiand0XCIsXG4gIH0sXG4gIHNlY3JldDogcHJvY2Vzcy5lbnYuTkVYVEFVVEhfU0VDUkVULFxuICBjYWxsYmFja3M6IHtcbiAgICBhc3luYyBqd3QoeyB0b2tlbiwgdXNlciB9KSB7XG4gICAgICBpZiAodXNlcikge1xuICAgICAgICB0b2tlbi5pZCA9IHVzZXIuaWQ7XG4gICAgICAgIHRva2VuLnN1YiA9IHVzZXIuaWQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gdG9rZW47XG4gICAgfSxcbiAgICBhc3luYyBzZXNzaW9uKHsgc2Vzc2lvbiwgdG9rZW4gfSkge1xuICAgICAgaWYgKHNlc3Npb24udXNlcikge1xuICAgICAgICBzZXNzaW9uLnVzZXIuaWQgPSB0b2tlbi5pZCBhcyBzdHJpbmc7XG4gICAgICB9XG4gICAgICByZXR1cm4gc2Vzc2lvbjtcbiAgICB9LFxuICB9LFxufTtcblxuY29uc3QgaGFuZGxlciA9IE5leHRBdXRoKGF1dGhPcHRpb25zKTtcbmV4cG9ydCB7IGhhbmRsZXIgYXMgR0VULCBoYW5kbGVyIGFzIFBPU1QgfTtcbiJdLCJuYW1lcyI6WyJOZXh0QXV0aCIsIkNyZWRlbnRpYWxzUHJvdmlkZXIiLCJjb21wYXJlIiwicHJpc21hIiwiYXV0aE9wdGlvbnMiLCJwcm92aWRlcnMiLCJuYW1lIiwiY3JlZGVudGlhbHMiLCJlbWFpbCIsImxhYmVsIiwidHlwZSIsInBhc3N3b3JkIiwiYXV0aG9yaXplIiwiRXJyb3IiLCJ1c2VyIiwiZmluZFVuaXF1ZSIsIndoZXJlIiwiaXNQYXNzd29yZFZhbGlkIiwiaWQiLCJwYWdlcyIsInNpZ25JbiIsInNpZ25PdXQiLCJlcnJvciIsImRlYnVnIiwicHJvY2VzcyIsInNlc3Npb24iLCJzdHJhdGVneSIsInNlY3JldCIsImVudiIsIk5FWFRBVVRIX1NFQ1JFVCIsImNhbGxiYWNrcyIsImp3dCIsInRva2VuIiwic3ViIiwiaGFuZGxlciIsIkdFVCIsIlBPU1QiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/auth/[...nextauth]/route.ts\n");

/***/ }),

/***/ "(rsc)/./app/api/services/[id]/bids/route.ts":
/*!*********************************************!*\
  !*** ./app/api/services/[id]/bids/route.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./app/lib/prisma.ts\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _api_auth_nextauth_route__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/api/auth/[...nextauth]/route */ \"(rsc)/./app/api/auth/[...nextauth]/route.ts\");\n\n\n\n\n// GET /api/services/[id]/bids - Listar todas as propostas para um serviço\nasync function GET(request, { params }) {\n    try {\n        const serviceId = params.id;\n        const bids = await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__[\"default\"].serviceBid.findMany({\n            where: {\n                serviceId\n            },\n            include: {\n                provider: {\n                    select: {\n                        id: true,\n                        name: true,\n                        image: true,\n                        rating: true\n                    }\n                }\n            },\n            orderBy: {\n                createdAt: \"desc\"\n            }\n        });\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(bids);\n    } catch (error) {\n        console.error(\"Erro ao buscar propostas:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Erro ao processar a solicitação\"\n        }, {\n            status: 500\n        });\n    }\n}\n// POST /api/services/[id]/bids - Criar uma nova proposta para um serviço\nasync function POST(request, { params }) {\n    try {\n        const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_2__.getServerSession)(_api_auth_nextauth_route__WEBPACK_IMPORTED_MODULE_3__.authOptions);\n        if (!session || !session.user) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Não autorizado\"\n            }, {\n                status: 401\n            });\n        }\n        const serviceId = params.id;\n        const body = await request.json();\n        const { value, message, proposedDate } = body;\n        // Verificar se o serviço existe\n        const service = await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__[\"default\"].service.findUnique({\n            where: {\n                id: serviceId\n            },\n            select: {\n                id: true,\n                creatorId: true,\n                status: true\n            }\n        });\n        if (!service) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Serviço não encontrado\"\n            }, {\n                status: 404\n            });\n        }\n        // Verificar se o usuário não está fazendo proposta para seu próprio serviço\n        if (service.creatorId === session.user.id) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Não é possível fazer proposta para seu próprio serviço\"\n            }, {\n                status: 400\n            });\n        }\n        // Verificar se o serviço está aberto para propostas\n        if (service.status !== \"OPEN\") {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Este serviço não está aberto para propostas\"\n            }, {\n                status: 400\n            });\n        }\n        // Verificar se o usuário já fez uma proposta para este serviço\n        const existingBid = await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__[\"default\"].serviceBid.findFirst({\n            where: {\n                serviceId,\n                providerId: session.user.id\n            }\n        });\n        if (existingBid) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Você já fez uma proposta para este serviço\"\n            }, {\n                status: 400\n            });\n        }\n        // Criar a proposta\n        const bid = await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__[\"default\"].serviceBid.create({\n            data: {\n                value,\n                message,\n                proposedDate: proposedDate ? new Date(proposedDate) : null,\n                service: {\n                    connect: {\n                        id: serviceId\n                    }\n                },\n                provider: {\n                    connect: {\n                        id: session.user.id\n                    }\n                }\n            }\n        });\n        // Criar notificação para o criador do serviço\n        await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__[\"default\"].notification.create({\n            data: {\n                type: \"BID\",\n                message: `Nova proposta para seu serviço: ${service.id}`,\n                receiver: {\n                    connect: {\n                        id: service.creatorId\n                    }\n                },\n                sender: {\n                    connect: {\n                        id: session.user.id\n                    }\n                }\n            }\n        });\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(bid, {\n            status: 201\n        });\n    } catch (error) {\n        console.error(\"Erro ao criar proposta:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Erro ao processar a solicitação\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3NlcnZpY2VzL1tpZF0vYmlkcy9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQXdEO0FBQ3RCO0FBQ1c7QUFDZ0I7QUFFN0QsMEVBQTBFO0FBQ25FLGVBQWVJLElBQ3BCQyxPQUFvQixFQUNwQixFQUFFQyxNQUFNLEVBQThCO0lBRXRDLElBQUk7UUFDRixNQUFNQyxZQUFZRCxPQUFPRSxFQUFFO1FBRTNCLE1BQU1DLE9BQU8sTUFBTVIsbURBQU1BLENBQUNTLFVBQVUsQ0FBQ0MsUUFBUSxDQUFDO1lBQzVDQyxPQUFPO2dCQUFFTDtZQUFVO1lBQ25CTSxTQUFTO2dCQUNQQyxVQUFVO29CQUNSQyxRQUFRO3dCQUNOUCxJQUFJO3dCQUNKUSxNQUFNO3dCQUNOQyxPQUFPO3dCQUNQQyxRQUFRO29CQUNWO2dCQUNGO1lBQ0Y7WUFDQUMsU0FBUztnQkFDUEMsV0FBVztZQUNiO1FBQ0Y7UUFFQSxPQUFPcEIscURBQVlBLENBQUNxQixJQUFJLENBQUNaO0lBQzNCLEVBQUUsT0FBT2EsT0FBTztRQUNkQyxRQUFRRCxLQUFLLENBQUMsNkJBQTZCQTtRQUMzQyxPQUFPdEIscURBQVlBLENBQUNxQixJQUFJLENBQ3RCO1lBQUVDLE9BQU87UUFBa0MsR0FDM0M7WUFBRUUsUUFBUTtRQUFJO0lBRWxCO0FBQ0Y7QUFFQSx5RUFBeUU7QUFDbEUsZUFBZUMsS0FDcEJwQixPQUFvQixFQUNwQixFQUFFQyxNQUFNLEVBQThCO0lBRXRDLElBQUk7UUFDRixNQUFNb0IsVUFBVSxNQUFNeEIsMkRBQWdCQSxDQUFDQyxpRUFBV0E7UUFFbEQsSUFBSSxDQUFDdUIsV0FBVyxDQUFDQSxRQUFRQyxJQUFJLEVBQUU7WUFDN0IsT0FBTzNCLHFEQUFZQSxDQUFDcUIsSUFBSSxDQUN0QjtnQkFBRUMsT0FBTztZQUFpQixHQUMxQjtnQkFBRUUsUUFBUTtZQUFJO1FBRWxCO1FBRUEsTUFBTWpCLFlBQVlELE9BQU9FLEVBQUU7UUFDM0IsTUFBTW9CLE9BQU8sTUFBTXZCLFFBQVFnQixJQUFJO1FBQy9CLE1BQU0sRUFBRVEsS0FBSyxFQUFFQyxPQUFPLEVBQUVDLFlBQVksRUFBRSxHQUFHSDtRQUV6QyxnQ0FBZ0M7UUFDaEMsTUFBTUksVUFBVSxNQUFNL0IsbURBQU1BLENBQUMrQixPQUFPLENBQUNDLFVBQVUsQ0FBQztZQUM5Q3JCLE9BQU87Z0JBQUVKLElBQUlEO1lBQVU7WUFDdkJRLFFBQVE7Z0JBQ05QLElBQUk7Z0JBQ0owQixXQUFXO2dCQUNYVixRQUFRO1lBQ1Y7UUFDRjtRQUVBLElBQUksQ0FBQ1EsU0FBUztZQUNaLE9BQU9oQyxxREFBWUEsQ0FBQ3FCLElBQUksQ0FDdEI7Z0JBQUVDLE9BQU87WUFBeUIsR0FDbEM7Z0JBQUVFLFFBQVE7WUFBSTtRQUVsQjtRQUVBLDRFQUE0RTtRQUM1RSxJQUFJUSxRQUFRRSxTQUFTLEtBQUtSLFFBQVFDLElBQUksQ0FBQ25CLEVBQUUsRUFBRTtZQUN6QyxPQUFPUixxREFBWUEsQ0FBQ3FCLElBQUksQ0FDdEI7Z0JBQUVDLE9BQU87WUFBeUQsR0FDbEU7Z0JBQUVFLFFBQVE7WUFBSTtRQUVsQjtRQUVBLG9EQUFvRDtRQUNwRCxJQUFJUSxRQUFRUixNQUFNLEtBQUssUUFBUTtZQUM3QixPQUFPeEIscURBQVlBLENBQUNxQixJQUFJLENBQ3RCO2dCQUFFQyxPQUFPO1lBQThDLEdBQ3ZEO2dCQUFFRSxRQUFRO1lBQUk7UUFFbEI7UUFFQSwrREFBK0Q7UUFDL0QsTUFBTVcsY0FBYyxNQUFNbEMsbURBQU1BLENBQUNTLFVBQVUsQ0FBQzBCLFNBQVMsQ0FBQztZQUNwRHhCLE9BQU87Z0JBQ0xMO2dCQUNBOEIsWUFBWVgsUUFBUUMsSUFBSSxDQUFDbkIsRUFBRTtZQUM3QjtRQUNGO1FBRUEsSUFBSTJCLGFBQWE7WUFDZixPQUFPbkMscURBQVlBLENBQUNxQixJQUFJLENBQ3RCO2dCQUFFQyxPQUFPO1lBQTZDLEdBQ3REO2dCQUFFRSxRQUFRO1lBQUk7UUFFbEI7UUFFQSxtQkFBbUI7UUFDbkIsTUFBTWMsTUFBTSxNQUFNckMsbURBQU1BLENBQUNTLFVBQVUsQ0FBQzZCLE1BQU0sQ0FBQztZQUN6Q0MsTUFBTTtnQkFDSlg7Z0JBQ0FDO2dCQUNBQyxjQUFjQSxlQUFlLElBQUlVLEtBQUtWLGdCQUFnQjtnQkFDdERDLFNBQVM7b0JBQ1BVLFNBQVM7d0JBQ1BsQyxJQUFJRDtvQkFDTjtnQkFDRjtnQkFDQU8sVUFBVTtvQkFDUjRCLFNBQVM7d0JBQ1BsQyxJQUFJa0IsUUFBUUMsSUFBSSxDQUFDbkIsRUFBRTtvQkFDckI7Z0JBQ0Y7WUFDRjtRQUNGO1FBRUEsOENBQThDO1FBQzlDLE1BQU1QLG1EQUFNQSxDQUFDMEMsWUFBWSxDQUFDSixNQUFNLENBQUM7WUFDL0JDLE1BQU07Z0JBQ0pJLE1BQU07Z0JBQ05kLFNBQVMsQ0FBQyxnQ0FBZ0MsRUFBRUUsUUFBUXhCLEVBQUUsRUFBRTtnQkFDeERxQyxVQUFVO29CQUNSSCxTQUFTO3dCQUNQbEMsSUFBSXdCLFFBQVFFLFNBQVM7b0JBQ3ZCO2dCQUNGO2dCQUNBWSxRQUFRO29CQUNOSixTQUFTO3dCQUNQbEMsSUFBSWtCLFFBQVFDLElBQUksQ0FBQ25CLEVBQUU7b0JBQ3JCO2dCQUNGO1lBQ0Y7UUFDRjtRQUVBLE9BQU9SLHFEQUFZQSxDQUFDcUIsSUFBSSxDQUFDaUIsS0FBSztZQUFFZCxRQUFRO1FBQUk7SUFDOUMsRUFBRSxPQUFPRixPQUFPO1FBQ2RDLFFBQVFELEtBQUssQ0FBQywyQkFBMkJBO1FBQ3pDLE9BQU90QixxREFBWUEsQ0FBQ3FCLElBQUksQ0FDdEI7WUFBRUMsT0FBTztRQUFrQyxHQUMzQztZQUFFRSxRQUFRO1FBQUk7SUFFbEI7QUFDRiIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFxPbMOhXFxEb2N1bWVudHNcXFVUQVNLXFxhcHBcXGFwaVxcc2VydmljZXNcXFtpZF1cXGJpZHNcXHJvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXF1ZXN0LCBOZXh0UmVzcG9uc2UgfSBmcm9tIFwibmV4dC9zZXJ2ZXJcIjtcbmltcG9ydCBwcmlzbWEgZnJvbSBcIkAvbGliL3ByaXNtYVwiO1xuaW1wb3J0IHsgZ2V0U2VydmVyU2Vzc2lvbiB9IGZyb20gXCJuZXh0LWF1dGhcIjtcbmltcG9ydCB7IGF1dGhPcHRpb25zIH0gZnJvbSBcIkAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZVwiO1xuXG4vLyBHRVQgL2FwaS9zZXJ2aWNlcy9baWRdL2JpZHMgLSBMaXN0YXIgdG9kYXMgYXMgcHJvcG9zdGFzIHBhcmEgdW0gc2VydmnDp29cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBHRVQoXG4gIHJlcXVlc3Q6IE5leHRSZXF1ZXN0LFxuICB7IHBhcmFtcyB9OiB7IHBhcmFtczogeyBpZDogc3RyaW5nIH0gfVxuKSB7XG4gIHRyeSB7XG4gICAgY29uc3Qgc2VydmljZUlkID0gcGFyYW1zLmlkO1xuICAgIFxuICAgIGNvbnN0IGJpZHMgPSBhd2FpdCBwcmlzbWEuc2VydmljZUJpZC5maW5kTWFueSh7XG4gICAgICB3aGVyZTogeyBzZXJ2aWNlSWQgfSxcbiAgICAgIGluY2x1ZGU6IHtcbiAgICAgICAgcHJvdmlkZXI6IHtcbiAgICAgICAgICBzZWxlY3Q6IHtcbiAgICAgICAgICAgIGlkOiB0cnVlLFxuICAgICAgICAgICAgbmFtZTogdHJ1ZSxcbiAgICAgICAgICAgIGltYWdlOiB0cnVlLFxuICAgICAgICAgICAgcmF0aW5nOiB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb3JkZXJCeToge1xuICAgICAgICBjcmVhdGVkQXQ6IFwiZGVzY1wiXG4gICAgICB9XG4gICAgfSk7XG4gICAgXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKGJpZHMpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvIGFvIGJ1c2NhciBwcm9wb3N0YXM6XCIsIGVycm9yKTtcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICB7IGVycm9yOiBcIkVycm8gYW8gcHJvY2Vzc2FyIGEgc29saWNpdGHDp8Ojb1wiIH0sXG4gICAgICB7IHN0YXR1czogNTAwIH1cbiAgICApO1xuICB9XG59XG5cbi8vIFBPU1QgL2FwaS9zZXJ2aWNlcy9baWRdL2JpZHMgLSBDcmlhciB1bWEgbm92YSBwcm9wb3N0YSBwYXJhIHVtIHNlcnZpw6dvXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVChcbiAgcmVxdWVzdDogTmV4dFJlcXVlc3QsXG4gIHsgcGFyYW1zIH06IHsgcGFyYW1zOiB7IGlkOiBzdHJpbmcgfSB9XG4pIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBzZXNzaW9uID0gYXdhaXQgZ2V0U2VydmVyU2Vzc2lvbihhdXRoT3B0aW9ucyk7XG4gICAgXG4gICAgaWYgKCFzZXNzaW9uIHx8ICFzZXNzaW9uLnVzZXIpIHtcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcbiAgICAgICAgeyBlcnJvcjogXCJOw6NvIGF1dG9yaXphZG9cIiB9LFxuICAgICAgICB7IHN0YXR1czogNDAxIH1cbiAgICAgICk7XG4gICAgfVxuICAgIFxuICAgIGNvbnN0IHNlcnZpY2VJZCA9IHBhcmFtcy5pZDtcbiAgICBjb25zdCBib2R5ID0gYXdhaXQgcmVxdWVzdC5qc29uKCk7XG4gICAgY29uc3QgeyB2YWx1ZSwgbWVzc2FnZSwgcHJvcG9zZWREYXRlIH0gPSBib2R5O1xuICAgIFxuICAgIC8vIFZlcmlmaWNhciBzZSBvIHNlcnZpw6dvIGV4aXN0ZVxuICAgIGNvbnN0IHNlcnZpY2UgPSBhd2FpdCBwcmlzbWEuc2VydmljZS5maW5kVW5pcXVlKHtcbiAgICAgIHdoZXJlOiB7IGlkOiBzZXJ2aWNlSWQgfSxcbiAgICAgIHNlbGVjdDogeyBcbiAgICAgICAgaWQ6IHRydWUsXG4gICAgICAgIGNyZWF0b3JJZDogdHJ1ZSxcbiAgICAgICAgc3RhdHVzOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gICAgXG4gICAgaWYgKCFzZXJ2aWNlKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICAgIHsgZXJyb3I6IFwiU2VydmnDp28gbsOjbyBlbmNvbnRyYWRvXCIgfSxcbiAgICAgICAgeyBzdGF0dXM6IDQwNCB9XG4gICAgICApO1xuICAgIH1cbiAgICBcbiAgICAvLyBWZXJpZmljYXIgc2UgbyB1c3XDoXJpbyBuw6NvIGVzdMOhIGZhemVuZG8gcHJvcG9zdGEgcGFyYSBzZXUgcHLDs3ByaW8gc2VydmnDp29cbiAgICBpZiAoc2VydmljZS5jcmVhdG9ySWQgPT09IHNlc3Npb24udXNlci5pZCkge1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgICB7IGVycm9yOiBcIk7Do28gw6kgcG9zc8OtdmVsIGZhemVyIHByb3Bvc3RhIHBhcmEgc2V1IHByw7NwcmlvIHNlcnZpw6dvXCIgfSxcbiAgICAgICAgeyBzdGF0dXM6IDQwMCB9XG4gICAgICApO1xuICAgIH1cbiAgICBcbiAgICAvLyBWZXJpZmljYXIgc2UgbyBzZXJ2acOnbyBlc3TDoSBhYmVydG8gcGFyYSBwcm9wb3N0YXNcbiAgICBpZiAoc2VydmljZS5zdGF0dXMgIT09IFwiT1BFTlwiKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICAgIHsgZXJyb3I6IFwiRXN0ZSBzZXJ2acOnbyBuw6NvIGVzdMOhIGFiZXJ0byBwYXJhIHByb3Bvc3Rhc1wiIH0sXG4gICAgICAgIHsgc3RhdHVzOiA0MDAgfVxuICAgICAgKTtcbiAgICB9XG4gICAgXG4gICAgLy8gVmVyaWZpY2FyIHNlIG8gdXN1w6FyaW8gasOhIGZleiB1bWEgcHJvcG9zdGEgcGFyYSBlc3RlIHNlcnZpw6dvXG4gICAgY29uc3QgZXhpc3RpbmdCaWQgPSBhd2FpdCBwcmlzbWEuc2VydmljZUJpZC5maW5kRmlyc3Qoe1xuICAgICAgd2hlcmU6IHtcbiAgICAgICAgc2VydmljZUlkLFxuICAgICAgICBwcm92aWRlcklkOiBzZXNzaW9uLnVzZXIuaWRcbiAgICAgIH1cbiAgICB9KTtcbiAgICBcbiAgICBpZiAoZXhpc3RpbmdCaWQpIHtcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcbiAgICAgICAgeyBlcnJvcjogXCJWb2PDqiBqw6EgZmV6IHVtYSBwcm9wb3N0YSBwYXJhIGVzdGUgc2VydmnDp29cIiB9LFxuICAgICAgICB7IHN0YXR1czogNDAwIH1cbiAgICAgICk7XG4gICAgfVxuICAgIFxuICAgIC8vIENyaWFyIGEgcHJvcG9zdGFcbiAgICBjb25zdCBiaWQgPSBhd2FpdCBwcmlzbWEuc2VydmljZUJpZC5jcmVhdGUoe1xuICAgICAgZGF0YToge1xuICAgICAgICB2YWx1ZSxcbiAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgcHJvcG9zZWREYXRlOiBwcm9wb3NlZERhdGUgPyBuZXcgRGF0ZShwcm9wb3NlZERhdGUpIDogbnVsbCxcbiAgICAgICAgc2VydmljZToge1xuICAgICAgICAgIGNvbm5lY3Q6IHtcbiAgICAgICAgICAgIGlkOiBzZXJ2aWNlSWRcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHByb3ZpZGVyOiB7XG4gICAgICAgICAgY29ubmVjdDoge1xuICAgICAgICAgICAgaWQ6IHNlc3Npb24udXNlci5pZFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIFxuICAgIC8vIENyaWFyIG5vdGlmaWNhw6fDo28gcGFyYSBvIGNyaWFkb3IgZG8gc2VydmnDp29cbiAgICBhd2FpdCBwcmlzbWEubm90aWZpY2F0aW9uLmNyZWF0ZSh7XG4gICAgICBkYXRhOiB7XG4gICAgICAgIHR5cGU6IFwiQklEXCIsXG4gICAgICAgIG1lc3NhZ2U6IGBOb3ZhIHByb3Bvc3RhIHBhcmEgc2V1IHNlcnZpw6dvOiAke3NlcnZpY2UuaWR9YCxcbiAgICAgICAgcmVjZWl2ZXI6IHtcbiAgICAgICAgICBjb25uZWN0OiB7XG4gICAgICAgICAgICBpZDogc2VydmljZS5jcmVhdG9ySWRcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHNlbmRlcjoge1xuICAgICAgICAgIGNvbm5lY3Q6IHtcbiAgICAgICAgICAgIGlkOiBzZXNzaW9uLnVzZXIuaWRcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICBcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oYmlkLCB7IHN0YXR1czogMjAxIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvIGFvIGNyaWFyIHByb3Bvc3RhOlwiLCBlcnJvcik7XG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgeyBlcnJvcjogXCJFcnJvIGFvIHByb2Nlc3NhciBhIHNvbGljaXRhw6fDo29cIiB9LFxuICAgICAgeyBzdGF0dXM6IDUwMCB9XG4gICAgKTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsInByaXNtYSIsImdldFNlcnZlclNlc3Npb24iLCJhdXRoT3B0aW9ucyIsIkdFVCIsInJlcXVlc3QiLCJwYXJhbXMiLCJzZXJ2aWNlSWQiLCJpZCIsImJpZHMiLCJzZXJ2aWNlQmlkIiwiZmluZE1hbnkiLCJ3aGVyZSIsImluY2x1ZGUiLCJwcm92aWRlciIsInNlbGVjdCIsIm5hbWUiLCJpbWFnZSIsInJhdGluZyIsIm9yZGVyQnkiLCJjcmVhdGVkQXQiLCJqc29uIiwiZXJyb3IiLCJjb25zb2xlIiwic3RhdHVzIiwiUE9TVCIsInNlc3Npb24iLCJ1c2VyIiwiYm9keSIsInZhbHVlIiwibWVzc2FnZSIsInByb3Bvc2VkRGF0ZSIsInNlcnZpY2UiLCJmaW5kVW5pcXVlIiwiY3JlYXRvcklkIiwiZXhpc3RpbmdCaWQiLCJmaW5kRmlyc3QiLCJwcm92aWRlcklkIiwiYmlkIiwiY3JlYXRlIiwiZGF0YSIsIkRhdGUiLCJjb25uZWN0Iiwibm90aWZpY2F0aW9uIiwidHlwZSIsInJlY2VpdmVyIiwic2VuZGVyIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/services/[id]/bids/route.ts\n");

/***/ }),

/***/ "(rsc)/./app/lib/prisma.ts":
/*!***************************!*\
  !*** ./app/lib/prisma.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst prisma = global.prisma || new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();\nif (true) global.prisma = prisma;\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (prisma);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvbGliL3ByaXNtYS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBNkM7QUFNN0MsTUFBTUMsU0FBU0MsT0FBT0QsTUFBTSxJQUFJLElBQUlELHdEQUFZQTtBQUVoRCxJQUFJRyxJQUFxQyxFQUFFRCxPQUFPRCxNQUFNLEdBQUdBO0FBRTNELGlFQUFlQSxNQUFNQSxFQUFBIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXE9sw6FcXERvY3VtZW50c1xcVVRBU0tcXGFwcFxcbGliXFxwcmlzbWEudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJpc21hQ2xpZW50IH0gZnJvbSAnQHByaXNtYS9jbGllbnQnXG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgdmFyIHByaXNtYTogUHJpc21hQ2xpZW50IHwgdW5kZWZpbmVkXG59XG5cbmNvbnN0IHByaXNtYSA9IGdsb2JhbC5wcmlzbWEgfHwgbmV3IFByaXNtYUNsaWVudCgpXG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSBnbG9iYWwucHJpc21hID0gcHJpc21hXG5cbmV4cG9ydCBkZWZhdWx0IHByaXNtYSJdLCJuYW1lcyI6WyJQcmlzbWFDbGllbnQiLCJwcmlzbWEiLCJnbG9iYWwiLCJwcm9jZXNzIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/lib/prisma.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fservices%2F%5Bid%5D%2Fbids%2Froute&page=%2Fapi%2Fservices%2F%5Bid%5D%2Fbids%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fservices%2F%5Bid%5D%2Fbids%2Froute.ts&appDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fservices%2F%5Bid%5D%2Fbids%2Froute&page=%2Fapi%2Fservices%2F%5Bid%5D%2Fbids%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fservices%2F%5Bid%5D%2Fbids%2Froute.ts&appDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_Ol_Documents_UTASK_app_api_services_id_bids_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/services/[id]/bids/route.ts */ \"(rsc)/./app/api/services/[id]/bids/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/services/[id]/bids/route\",\n        pathname: \"/api/services/[id]/bids\",\n        filename: \"route\",\n        bundlePath: \"app/api/services/[id]/bids/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\Olá\\\\Documents\\\\UTASK\\\\app\\\\api\\\\services\\\\[id]\\\\bids\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_Ol_Documents_UTASK_app_api_services_id_bids_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZzZXJ2aWNlcyUyRiU1QmlkJTVEJTJGYmlkcyUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGc2VydmljZXMlMkYlNUJpZCU1RCUyRmJpZHMlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZzZXJ2aWNlcyUyRiU1QmlkJTVEJTJGYmlkcyUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNPbCVDMyVBMSU1Q0RvY3VtZW50cyU1Q1VUQVNLJTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj1DJTNBJTVDVXNlcnMlNUNPbCVDMyVBMSU1Q0RvY3VtZW50cyU1Q1VUQVNLJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUErRjtBQUN2QztBQUNxQjtBQUMwQjtBQUN2RztBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNEQUFzRDtBQUM5RDtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUMwRjs7QUFFMUYiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiQzpcXFxcVXNlcnNcXFxcT2zDoVxcXFxEb2N1bWVudHNcXFxcVVRBU0tcXFxcYXBwXFxcXGFwaVxcXFxzZXJ2aWNlc1xcXFxbaWRdXFxcXGJpZHNcXFxccm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL3NlcnZpY2VzL1tpZF0vYmlkcy9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL3NlcnZpY2VzL1tpZF0vYmlkc1wiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvc2VydmljZXMvW2lkXS9iaWRzL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiQzpcXFxcVXNlcnNcXFxcT2zDoVxcXFxEb2N1bWVudHNcXFxcVVRBU0tcXFxcYXBwXFxcXGFwaVxcXFxzZXJ2aWNlc1xcXFxbaWRdXFxcXGJpZHNcXFxccm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICB3b3JrQXN5bmNTdG9yYWdlLFxuICAgICAgICB3b3JrVW5pdEFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fservices%2F%5Bid%5D%2Fbids%2Froute&page=%2Fapi%2Fservices%2F%5Bid%5D%2Fbids%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fservices%2F%5Bid%5D%2Fbids%2Froute.ts&appDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

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
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/bcryptjs","vendor-chunks/oauth","vendor-chunks/object-hash","vendor-chunks/preact","vendor-chunks/uuid","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/lru-cache","vendor-chunks/cookie","vendor-chunks/oidc-token-hash","vendor-chunks/@panva"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fservices%2F%5Bid%5D%2Fbids%2Froute&page=%2Fapi%2Fservices%2F%5Bid%5D%2Fbids%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fservices%2F%5Bid%5D%2Fbids%2Froute.ts&appDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();