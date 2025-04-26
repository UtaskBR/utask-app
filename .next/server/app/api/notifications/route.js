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
exports.id = "app/api/notifications/route";
exports.ids = ["app/api/notifications/route"];
exports.modules = {

/***/ "(rsc)/./app/api/auth/[...nextauth]/route.ts":
/*!*********************************************!*\
  !*** ./app/api/auth/[...nextauth]/route.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ handler),\n/* harmony export */   POST: () => (/* binding */ handler),\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/bcryptjs/index.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./app/lib/prisma.ts\");\n\n\n\n // ou onde está seu prisma\nconst authOptions = {\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__[\"default\"])({\n            name: \"credentials\",\n            credentials: {\n                email: {\n                    label: \"Email\",\n                    type: \"email\"\n                },\n                password: {\n                    label: \"Senha\",\n                    type: \"password\"\n                }\n            },\n            async authorize (credentials) {\n                if (!credentials?.email || !credentials?.password) {\n                    throw new Error(\"Credenciais inválidas\");\n                }\n                const user = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__[\"default\"].user.findUnique({\n                    where: {\n                        email: credentials.email\n                    }\n                });\n                if (!user || !user.password) {\n                    throw new Error(\"Usuário ou senha inválidos\");\n                }\n                const isPasswordValid = await (0,bcryptjs__WEBPACK_IMPORTED_MODULE_2__.compare)(credentials.password, user.password);\n                if (!isPasswordValid) {\n                    throw new Error(\"Usuário ou senha inválidos\");\n                }\n                return {\n                    id: user.id,\n                    email: user.email,\n                    name: user.name\n                };\n            }\n        })\n    ],\n    pages: {\n        signIn: \"/auth/login\",\n        signOut: \"/auth/logout\",\n        error: \"/auth/error\"\n    },\n    debug: \"development\" === \"development\",\n    session: {\n        strategy: \"jwt\"\n    },\n    secret: process.env.NEXTAUTH_SECRET,\n    callbacks: {\n        async jwt ({ token, user }) {\n            if (user) {\n                token.id = user.id;\n                token.sub = user.id;\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (session.user) {\n                session.user.id = token.id;\n            }\n            return session;\n        }\n    }\n};\nconst handler = next_auth__WEBPACK_IMPORTED_MODULE_0___default()(authOptions);\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUErRDtBQUNHO0FBQy9CO0FBQ0QsQ0FBQywwQkFBMEI7QUFjdEQsTUFBTUksY0FBK0I7SUFDMUNDLFdBQVc7UUFDVEosMkVBQW1CQSxDQUFDO1lBQ2xCSyxNQUFNO1lBQ05DLGFBQWE7Z0JBQ1hDLE9BQU87b0JBQUVDLE9BQU87b0JBQVNDLE1BQU07Z0JBQVE7Z0JBQ3ZDQyxVQUFVO29CQUFFRixPQUFPO29CQUFTQyxNQUFNO2dCQUFXO1lBQy9DO1lBQ0EsTUFBTUUsV0FBVUwsV0FBVztnQkFDekIsSUFBSSxDQUFDQSxhQUFhQyxTQUFTLENBQUNELGFBQWFJLFVBQVU7b0JBQ2pELE1BQU0sSUFBSUUsTUFBTTtnQkFDbEI7Z0JBRUEsTUFBTUMsT0FBTyxNQUFNWCxtREFBTUEsQ0FBQ1csSUFBSSxDQUFDQyxVQUFVLENBQUM7b0JBQ3hDQyxPQUFPO3dCQUNMUixPQUFPRCxZQUFZQyxLQUFLO29CQUMxQjtnQkFDRjtnQkFFQSxJQUFJLENBQUNNLFFBQVEsQ0FBQ0EsS0FBS0gsUUFBUSxFQUFFO29CQUMzQixNQUFNLElBQUlFLE1BQU07Z0JBQ2xCO2dCQUVBLE1BQU1JLGtCQUFrQixNQUFNZixpREFBT0EsQ0FDbkNLLFlBQVlJLFFBQVEsRUFDcEJHLEtBQUtILFFBQVE7Z0JBR2YsSUFBSSxDQUFDTSxpQkFBaUI7b0JBQ3BCLE1BQU0sSUFBSUosTUFBTTtnQkFDbEI7Z0JBRUEsT0FBTztvQkFDTEssSUFBSUosS0FBS0ksRUFBRTtvQkFDWFYsT0FBT00sS0FBS04sS0FBSztvQkFDakJGLE1BQU1RLEtBQUtSLElBQUk7Z0JBQ2pCO1lBQ0Y7UUFDRjtLQUNEO0lBQ0RhLE9BQU87UUFDTEMsUUFBUTtRQUNSQyxTQUFTO1FBQ1RDLE9BQU87SUFDVDtJQUNBQyxPQUFPQyxrQkFBeUI7SUFDaENDLFNBQVM7UUFDUEMsVUFBVTtJQUNaO0lBQ0FDLFFBQVFILFFBQVFJLEdBQUcsQ0FBQ0MsZUFBZTtJQUNuQ0MsV0FBVztRQUNULE1BQU1DLEtBQUksRUFBRUMsS0FBSyxFQUFFbEIsSUFBSSxFQUFFO1lBQ3ZCLElBQUlBLE1BQU07Z0JBQ1JrQixNQUFNZCxFQUFFLEdBQUdKLEtBQUtJLEVBQUU7Z0JBQ2xCYyxNQUFNQyxHQUFHLEdBQUduQixLQUFLSSxFQUFFO1lBQ3JCO1lBQ0EsT0FBT2M7UUFDVDtRQUNBLE1BQU1QLFNBQVEsRUFBRUEsT0FBTyxFQUFFTyxLQUFLLEVBQUU7WUFDOUIsSUFBSVAsUUFBUVgsSUFBSSxFQUFFO2dCQUNoQlcsUUFBUVgsSUFBSSxDQUFDSSxFQUFFLEdBQUdjLE1BQU1kLEVBQUU7WUFDNUI7WUFDQSxPQUFPTztRQUNUO0lBQ0Y7QUFDRixFQUFFO0FBRUYsTUFBTVMsVUFBVWxDLGdEQUFRQSxDQUFDSTtBQUNrQiIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFxPbMOhXFxEb2N1bWVudHNcXFVUQVNLXFxhcHBcXGFwaVxcYXV0aFxcWy4uLm5leHRhdXRoXVxccm91dGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE5leHRBdXRoLCB7IE5leHRBdXRoT3B0aW9ucywgU2Vzc2lvbiB9IGZyb20gXCJuZXh0LWF1dGhcIjtcbmltcG9ydCBDcmVkZW50aWFsc1Byb3ZpZGVyIGZyb20gXCJuZXh0LWF1dGgvcHJvdmlkZXJzL2NyZWRlbnRpYWxzXCI7XG5pbXBvcnQgeyBjb21wYXJlIH0gZnJvbSBcImJjcnlwdGpzXCI7XG5pbXBvcnQgcHJpc21hIGZyb20gXCJAL2xpYi9wcmlzbWFcIjsgLy8gb3Ugb25kZSBlc3TDoSBzZXUgcHJpc21hXG5cbi8vIEV4dGVuZCB0aGUgU2Vzc2lvbiB0eXBlIHRvIGluY2x1ZGUgdGhlIGlkIHByb3BlcnR5XG5kZWNsYXJlIG1vZHVsZSBcIm5leHQtYXV0aFwiIHtcbiAgaW50ZXJmYWNlIFNlc3Npb24ge1xuICAgIHVzZXI6IHtcbiAgICAgIGlkOiBzdHJpbmc7XG4gICAgICBuYW1lPzogc3RyaW5nIHwgbnVsbDtcbiAgICAgIGVtYWlsPzogc3RyaW5nIHwgbnVsbDtcbiAgICAgIGltYWdlPzogc3RyaW5nIHwgbnVsbDtcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBhdXRoT3B0aW9uczogTmV4dEF1dGhPcHRpb25zID0ge1xuICBwcm92aWRlcnM6IFtcbiAgICBDcmVkZW50aWFsc1Byb3ZpZGVyKHtcbiAgICAgIG5hbWU6IFwiY3JlZGVudGlhbHNcIixcbiAgICAgIGNyZWRlbnRpYWxzOiB7XG4gICAgICAgIGVtYWlsOiB7IGxhYmVsOiBcIkVtYWlsXCIsIHR5cGU6IFwiZW1haWxcIiB9LFxuICAgICAgICBwYXNzd29yZDogeyBsYWJlbDogXCJTZW5oYVwiLCB0eXBlOiBcInBhc3N3b3JkXCIgfVxuICAgICAgfSxcbiAgICAgIGFzeW5jIGF1dGhvcml6ZShjcmVkZW50aWFscykge1xuICAgICAgICBpZiAoIWNyZWRlbnRpYWxzPy5lbWFpbCB8fCAhY3JlZGVudGlhbHM/LnBhc3N3b3JkKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ3JlZGVuY2lhaXMgaW52w6FsaWRhc1wiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBwcmlzbWEudXNlci5maW5kVW5pcXVlKHtcbiAgICAgICAgICB3aGVyZToge1xuICAgICAgICAgICAgZW1haWw6IGNyZWRlbnRpYWxzLmVtYWlsXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIXVzZXIgfHwgIXVzZXIucGFzc3dvcmQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVc3XDoXJpbyBvdSBzZW5oYSBpbnbDoWxpZG9zXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaXNQYXNzd29yZFZhbGlkID0gYXdhaXQgY29tcGFyZShcbiAgICAgICAgICBjcmVkZW50aWFscy5wYXNzd29yZCxcbiAgICAgICAgICB1c2VyLnBhc3N3b3JkXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKCFpc1Bhc3N3b3JkVmFsaWQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVc3XDoXJpbyBvdSBzZW5oYSBpbnbDoWxpZG9zXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpZDogdXNlci5pZCxcbiAgICAgICAgICBlbWFpbDogdXNlci5lbWFpbCxcbiAgICAgICAgICBuYW1lOiB1c2VyLm5hbWUsXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSlcbiAgXSxcbiAgcGFnZXM6IHtcbiAgICBzaWduSW46IFwiL2F1dGgvbG9naW5cIixcbiAgICBzaWduT3V0OiBcIi9hdXRoL2xvZ291dFwiLFxuICAgIGVycm9yOiBcIi9hdXRoL2Vycm9yXCIsXG4gIH0sXG4gIGRlYnVnOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJkZXZlbG9wbWVudFwiLFxuICBzZXNzaW9uOiB7XG4gICAgc3RyYXRlZ3k6IFwiand0XCIsXG4gIH0sXG4gIHNlY3JldDogcHJvY2Vzcy5lbnYuTkVYVEFVVEhfU0VDUkVULFxuICBjYWxsYmFja3M6IHtcbiAgICBhc3luYyBqd3QoeyB0b2tlbiwgdXNlciB9KSB7XG4gICAgICBpZiAodXNlcikge1xuICAgICAgICB0b2tlbi5pZCA9IHVzZXIuaWQ7XG4gICAgICAgIHRva2VuLnN1YiA9IHVzZXIuaWQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gdG9rZW47XG4gICAgfSxcbiAgICBhc3luYyBzZXNzaW9uKHsgc2Vzc2lvbiwgdG9rZW4gfSkge1xuICAgICAgaWYgKHNlc3Npb24udXNlcikge1xuICAgICAgICBzZXNzaW9uLnVzZXIuaWQgPSB0b2tlbi5pZCBhcyBzdHJpbmc7XG4gICAgICB9XG4gICAgICByZXR1cm4gc2Vzc2lvbjtcbiAgICB9LFxuICB9LFxufTtcblxuY29uc3QgaGFuZGxlciA9IE5leHRBdXRoKGF1dGhPcHRpb25zKTtcbmV4cG9ydCB7IGhhbmRsZXIgYXMgR0VULCBoYW5kbGVyIGFzIFBPU1QgfTtcbiJdLCJuYW1lcyI6WyJOZXh0QXV0aCIsIkNyZWRlbnRpYWxzUHJvdmlkZXIiLCJjb21wYXJlIiwicHJpc21hIiwiYXV0aE9wdGlvbnMiLCJwcm92aWRlcnMiLCJuYW1lIiwiY3JlZGVudGlhbHMiLCJlbWFpbCIsImxhYmVsIiwidHlwZSIsInBhc3N3b3JkIiwiYXV0aG9yaXplIiwiRXJyb3IiLCJ1c2VyIiwiZmluZFVuaXF1ZSIsIndoZXJlIiwiaXNQYXNzd29yZFZhbGlkIiwiaWQiLCJwYWdlcyIsInNpZ25JbiIsInNpZ25PdXQiLCJlcnJvciIsImRlYnVnIiwicHJvY2VzcyIsInNlc3Npb24iLCJzdHJhdGVneSIsInNlY3JldCIsImVudiIsIk5FWFRBVVRIX1NFQ1JFVCIsImNhbGxiYWNrcyIsImp3dCIsInRva2VuIiwic3ViIiwiaGFuZGxlciIsIkdFVCIsIlBPU1QiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/auth/[...nextauth]/route.ts\n");

/***/ }),

/***/ "(rsc)/./app/api/notifications/route.ts":
/*!****************************************!*\
  !*** ./app/api/notifications/route.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   PATCH: () => (/* binding */ PATCH)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./app/lib/prisma.ts\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _api_auth_nextauth_route__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/api/auth/[...nextauth]/route */ \"(rsc)/./app/api/auth/[...nextauth]/route.ts\");\n\n\n\n\n// GET /api/notifications - Obter notificações do usuário\nasync function GET(request) {\n    try {\n        const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_2__.getServerSession)(_api_auth_nextauth_route__WEBPACK_IMPORTED_MODULE_3__.authOptions);\n        if (!session || !session.user) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Não autorizado\"\n            }, {\n                status: 401\n            });\n        }\n        const { searchParams } = new URL(request.url);\n        const unreadOnly = searchParams.get('unreadOnly') === 'true';\n        const notifications = await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__[\"default\"].notification.findMany({\n            where: {\n                receiverId: session.user.id,\n                ...unreadOnly ? {\n                    read: false\n                } : {}\n            },\n            include: {\n                sender: {\n                    select: {\n                        id: true,\n                        name: true,\n                        image: true\n                    }\n                },\n                service: {\n                    select: {\n                        id: true,\n                        title: true,\n                        value: true,\n                        date: true,\n                        status: true\n                    }\n                },\n                bid: {\n                    select: {\n                        id: true,\n                        value: true,\n                        date: true,\n                        status: true\n                    }\n                }\n            },\n            orderBy: {\n                createdAt: 'desc'\n            }\n        });\n        // Enriquecer as notificações com informações adicionais\n        const enrichedNotifications = notifications.map((notification)=>{\n            // Extrair informações relevantes do serviço e da proposta\n            const serviceInfo = notification.service ? {\n                title: notification.service.title,\n                value: notification.service.value,\n                date: notification.service.date,\n                status: notification.service.status\n            } : null;\n            const bidInfo = notification.bid ? {\n                value: notification.bid.value,\n                date: notification.bid.date,\n                status: notification.bid.status\n            } : null;\n            // Adicionar detalhes formatados para exibição\n            return {\n                ...notification,\n                serviceInfo,\n                bidInfo,\n                details: {\n                    title: serviceInfo?.title || 'Serviço',\n                    value: bidInfo?.value || serviceInfo?.value || null,\n                    date: bidInfo?.date || serviceInfo?.date || null,\n                    formattedValue: bidInfo?.value || serviceInfo?.value ? `R$ ${(bidInfo?.value || serviceInfo?.value).toFixed(2).replace('.', ',')}` : 'Valor a combinar',\n                    formattedDate: bidInfo?.date || serviceInfo?.date ? new Date(bidInfo?.date || serviceInfo?.date).toLocaleDateString('pt-BR', {\n                        day: '2-digit',\n                        month: '2-digit',\n                        year: 'numeric',\n                        hour: '2-digit',\n                        minute: '2-digit'\n                    }) : 'Data a combinar'\n                }\n            };\n        });\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(enrichedNotifications);\n    } catch (error) {\n        console.error(\"Erro ao buscar notificações:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Erro ao processar a solicitação\"\n        }, {\n            status: 500\n        });\n    }\n}\n// PATCH /api/notifications - Marcar notificações como lidas\nasync function PATCH(request) {\n    try {\n        const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_2__.getServerSession)(_api_auth_nextauth_route__WEBPACK_IMPORTED_MODULE_3__.authOptions);\n        if (!session || !session.user) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Não autorizado\"\n            }, {\n                status: 401\n            });\n        }\n        const body = await request.json();\n        const { ids, all } = body;\n        if (all) {\n            // Marcar todas as notificações do usuário como lidas\n            await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__[\"default\"].notification.updateMany({\n                where: {\n                    receiverId: session.user.id,\n                    read: false\n                },\n                data: {\n                    read: true\n                }\n            });\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: true\n            });\n        }\n        if (!ids || !Array.isArray(ids) || ids.length === 0) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"IDs de notificações não fornecidos\"\n            }, {\n                status: 400\n            });\n        }\n        // Verificar se todas as notificações pertencem ao usuário\n        const notifications = await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__[\"default\"].notification.findMany({\n            where: {\n                id: {\n                    in: ids\n                }\n            },\n            select: {\n                id: true,\n                receiverId: true\n            }\n        });\n        const unauthorizedIds = notifications.filter((notification)=>notification.receiverId !== session.user.id).map((notification)=>notification.id);\n        if (unauthorizedIds.length > 0) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Não autorizado a modificar algumas notificações\"\n            }, {\n                status: 403\n            });\n        }\n        // Marcar notificações como lidas\n        await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__[\"default\"].notification.updateMany({\n            where: {\n                id: {\n                    in: ids\n                }\n            },\n            data: {\n                read: true\n            }\n        });\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: true\n        });\n    } catch (error) {\n        console.error(\"Erro ao atualizar notificações:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Erro ao processar a solicitação\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LENBQUNnQixZQUFZLENBQUNDLFFBQVEsQ0FBQztZQUN2REMsT0FBTztnQkFDTEUsSUFBSTtvQkFBRXlDLElBQUlSO2dCQUFJO1lBQ2hCO1lBQ0E3QixRQUFRO2dCQUNOSixJQUFJO2dCQUNKRCxZQUFZO1lBQ2Q7UUFDRjtRQUVBLE1BQU0yQyxrQkFBa0IvQyxjQUNyQmdELE1BQU0sQ0FBQy9DLENBQUFBLGVBQWdCQSxhQUFhRyxVQUFVLEtBQUtkLFFBQVFDLElBQUksQ0FBQ2MsRUFBRSxFQUNsRWUsR0FBRyxDQUFDbkIsQ0FBQUEsZUFBZ0JBLGFBQWFJLEVBQUU7UUFFdEMsSUFBSTBDLGdCQUFnQkYsTUFBTSxHQUFHLEdBQUc7WUFDOUIsT0FBTzdELHFEQUFZQSxDQUFDUSxJQUFJLENBQ3RCO2dCQUFFQyxPQUFPO1lBQWtELEdBQzNEO2dCQUFFQyxRQUFRO1lBQUk7UUFFbEI7UUFFQSxpQ0FBaUM7UUFDakMsTUFBTVQsbURBQU1BLENBQUNnQixZQUFZLENBQUN1QyxVQUFVLENBQUM7WUFDbkNyQyxPQUFPO2dCQUNMRSxJQUFJO29CQUFFeUMsSUFBSVI7Z0JBQUk7WUFDaEI7WUFDQUcsTUFBTTtnQkFDSm5DLE1BQU07WUFDUjtRQUNGO1FBRUEsT0FBT3RCLHFEQUFZQSxDQUFDUSxJQUFJLENBQUM7WUFBRWtELFNBQVM7UUFBSztJQUMzQyxFQUFFLE9BQU9qRCxPQUFPO1FBQ2QwQyxRQUFRMUMsS0FBSyxDQUFDLG1DQUFtQ0E7UUFDakQsT0FBT1QscURBQVlBLENBQUNRLElBQUksQ0FDdEI7WUFBRUMsT0FBTztRQUFrQyxHQUMzQztZQUFFQyxRQUFRO1FBQUk7SUFFbEI7QUFDRiIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFxPbMOhXFxEb2N1bWVudHNcXFVUQVNLXFxhcHBcXGFwaVxcbm90aWZpY2F0aW9uc1xccm91dGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlcXVlc3QsIE5leHRSZXNwb25zZSB9IGZyb20gXCJuZXh0L3NlcnZlclwiO1xuaW1wb3J0IHByaXNtYSBmcm9tIFwiQC9saWIvcHJpc21hXCI7XG5pbXBvcnQgeyBnZXRTZXJ2ZXJTZXNzaW9uIH0gZnJvbSBcIm5leHQtYXV0aFwiO1xuaW1wb3J0IHsgYXV0aE9wdGlvbnMgfSBmcm9tIFwiQC9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlXCI7XG5cbi8vIEdFVCAvYXBpL25vdGlmaWNhdGlvbnMgLSBPYnRlciBub3RpZmljYcOnw7VlcyBkbyB1c3XDoXJpb1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIEdFVChyZXF1ZXN0OiBOZXh0UmVxdWVzdCkge1xuICB0cnkge1xuICAgIGNvbnN0IHNlc3Npb24gPSBhd2FpdCBnZXRTZXJ2ZXJTZXNzaW9uKGF1dGhPcHRpb25zKTtcbiAgICBcbiAgICBpZiAoIXNlc3Npb24gfHwgIXNlc3Npb24udXNlcikge1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgICB7IGVycm9yOiBcIk7Do28gYXV0b3JpemFkb1wiIH0sXG4gICAgICAgIHsgc3RhdHVzOiA0MDEgfVxuICAgICAgKTtcbiAgICB9XG4gICAgXG4gICAgY29uc3QgeyBzZWFyY2hQYXJhbXMgfSA9IG5ldyBVUkwocmVxdWVzdC51cmwpO1xuICAgIGNvbnN0IHVucmVhZE9ubHkgPSBzZWFyY2hQYXJhbXMuZ2V0KCd1bnJlYWRPbmx5JykgPT09ICd0cnVlJztcbiAgICBcbiAgICBjb25zdCBub3RpZmljYXRpb25zID0gYXdhaXQgcHJpc21hLm5vdGlmaWNhdGlvbi5maW5kTWFueSh7XG4gICAgICB3aGVyZToge1xuICAgICAgICByZWNlaXZlcklkOiBzZXNzaW9uLnVzZXIuaWQsXG4gICAgICAgIC4uLih1bnJlYWRPbmx5ID8geyByZWFkOiBmYWxzZSB9IDoge30pXG4gICAgICB9LFxuICAgICAgaW5jbHVkZToge1xuICAgICAgICBzZW5kZXI6IHtcbiAgICAgICAgICBzZWxlY3Q6IHtcbiAgICAgICAgICAgIGlkOiB0cnVlLFxuICAgICAgICAgICAgbmFtZTogdHJ1ZSxcbiAgICAgICAgICAgIGltYWdlOiB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBzZXJ2aWNlOiB7XG4gICAgICAgICAgc2VsZWN0OiB7XG4gICAgICAgICAgICBpZDogdHJ1ZSxcbiAgICAgICAgICAgIHRpdGxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IHRydWUsXG4gICAgICAgICAgICBkYXRlOiB0cnVlLFxuICAgICAgICAgICAgc3RhdHVzOiB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBiaWQ6IHtcbiAgICAgICAgICBzZWxlY3Q6IHtcbiAgICAgICAgICAgIGlkOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IHRydWUsXG4gICAgICAgICAgICBkYXRlOiB0cnVlLFxuICAgICAgICAgICAgc3RhdHVzOiB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb3JkZXJCeToge1xuICAgICAgICBjcmVhdGVkQXQ6ICdkZXNjJ1xuICAgICAgfVxuICAgIH0pO1xuICAgIFxuICAgIC8vIEVucmlxdWVjZXIgYXMgbm90aWZpY2HDp8O1ZXMgY29tIGluZm9ybWHDp8O1ZXMgYWRpY2lvbmFpc1xuICAgIGNvbnN0IGVucmljaGVkTm90aWZpY2F0aW9ucyA9IG5vdGlmaWNhdGlvbnMubWFwKG5vdGlmaWNhdGlvbiA9PiB7XG4gICAgICAvLyBFeHRyYWlyIGluZm9ybWHDp8O1ZXMgcmVsZXZhbnRlcyBkbyBzZXJ2acOnbyBlIGRhIHByb3Bvc3RhXG4gICAgICBjb25zdCBzZXJ2aWNlSW5mbyA9IG5vdGlmaWNhdGlvbi5zZXJ2aWNlID8ge1xuICAgICAgICB0aXRsZTogbm90aWZpY2F0aW9uLnNlcnZpY2UudGl0bGUsXG4gICAgICAgIHZhbHVlOiBub3RpZmljYXRpb24uc2VydmljZS52YWx1ZSxcbiAgICAgICAgZGF0ZTogbm90aWZpY2F0aW9uLnNlcnZpY2UuZGF0ZSxcbiAgICAgICAgc3RhdHVzOiBub3RpZmljYXRpb24uc2VydmljZS5zdGF0dXNcbiAgICAgIH0gOiBudWxsO1xuICAgICAgXG4gICAgICBjb25zdCBiaWRJbmZvID0gbm90aWZpY2F0aW9uLmJpZCA/IHtcbiAgICAgICAgdmFsdWU6IG5vdGlmaWNhdGlvbi5iaWQudmFsdWUsXG4gICAgICAgIGRhdGU6IG5vdGlmaWNhdGlvbi5iaWQuZGF0ZSxcbiAgICAgICAgc3RhdHVzOiBub3RpZmljYXRpb24uYmlkLnN0YXR1c1xuICAgICAgfSA6IG51bGw7XG4gICAgICBcbiAgICAgIC8vIEFkaWNpb25hciBkZXRhbGhlcyBmb3JtYXRhZG9zIHBhcmEgZXhpYmnDp8Ojb1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4ubm90aWZpY2F0aW9uLFxuICAgICAgICBzZXJ2aWNlSW5mbyxcbiAgICAgICAgYmlkSW5mbyxcbiAgICAgICAgZGV0YWlsczoge1xuICAgICAgICAgIHRpdGxlOiBzZXJ2aWNlSW5mbz8udGl0bGUgfHwgJ1NlcnZpw6dvJyxcbiAgICAgICAgICB2YWx1ZTogYmlkSW5mbz8udmFsdWUgfHwgc2VydmljZUluZm8/LnZhbHVlIHx8IG51bGwsXG4gICAgICAgICAgZGF0ZTogYmlkSW5mbz8uZGF0ZSB8fCBzZXJ2aWNlSW5mbz8uZGF0ZSB8fCBudWxsLFxuICAgICAgICAgIGZvcm1hdHRlZFZhbHVlOiBiaWRJbmZvPy52YWx1ZSB8fCBzZXJ2aWNlSW5mbz8udmFsdWUgXG4gICAgICAgICAgICA/IGBSJCAkeyhiaWRJbmZvPy52YWx1ZSB8fCBzZXJ2aWNlSW5mbz8udmFsdWUpLnRvRml4ZWQoMikucmVwbGFjZSgnLicsICcsJyl9YFxuICAgICAgICAgICAgOiAnVmFsb3IgYSBjb21iaW5hcicsXG4gICAgICAgICAgZm9ybWF0dGVkRGF0ZTogYmlkSW5mbz8uZGF0ZSB8fCBzZXJ2aWNlSW5mbz8uZGF0ZVxuICAgICAgICAgICAgPyBuZXcgRGF0ZShiaWRJbmZvPy5kYXRlIHx8IHNlcnZpY2VJbmZvPy5kYXRlKS50b0xvY2FsZURhdGVTdHJpbmcoJ3B0LUJSJywge1xuICAgICAgICAgICAgICAgIGRheTogJzItZGlnaXQnLFxuICAgICAgICAgICAgICAgIG1vbnRoOiAnMi1kaWdpdCcsXG4gICAgICAgICAgICAgICAgeWVhcjogJ251bWVyaWMnLFxuICAgICAgICAgICAgICAgIGhvdXI6ICcyLWRpZ2l0JyxcbiAgICAgICAgICAgICAgICBtaW51dGU6ICcyLWRpZ2l0J1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgOiAnRGF0YSBhIGNvbWJpbmFyJ1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pO1xuICAgIFxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihlbnJpY2hlZE5vdGlmaWNhdGlvbnMpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvIGFvIGJ1c2NhciBub3RpZmljYcOnw7VlczpcIiwgZXJyb3IpO1xuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcbiAgICAgIHsgZXJyb3I6IFwiRXJybyBhbyBwcm9jZXNzYXIgYSBzb2xpY2l0YcOnw6NvXCIgfSxcbiAgICAgIHsgc3RhdHVzOiA1MDAgfVxuICAgICk7XG4gIH1cbn1cblxuLy8gUEFUQ0ggL2FwaS9ub3RpZmljYXRpb25zIC0gTWFyY2FyIG5vdGlmaWNhw6fDtWVzIGNvbW8gbGlkYXNcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBQQVRDSChyZXF1ZXN0OiBOZXh0UmVxdWVzdCkge1xuICB0cnkge1xuICAgIGNvbnN0IHNlc3Npb24gPSBhd2FpdCBnZXRTZXJ2ZXJTZXNzaW9uKGF1dGhPcHRpb25zKTtcbiAgICBcbiAgICBpZiAoIXNlc3Npb24gfHwgIXNlc3Npb24udXNlcikge1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgICB7IGVycm9yOiBcIk7Do28gYXV0b3JpemFkb1wiIH0sXG4gICAgICAgIHsgc3RhdHVzOiA0MDEgfVxuICAgICAgKTtcbiAgICB9XG4gICAgXG4gICAgY29uc3QgYm9keSA9IGF3YWl0IHJlcXVlc3QuanNvbigpO1xuICAgIGNvbnN0IHsgaWRzLCBhbGwgfSA9IGJvZHk7XG4gICAgXG4gICAgaWYgKGFsbCkge1xuICAgICAgLy8gTWFyY2FyIHRvZGFzIGFzIG5vdGlmaWNhw6fDtWVzIGRvIHVzdcOhcmlvIGNvbW8gbGlkYXNcbiAgICAgIGF3YWl0IHByaXNtYS5ub3RpZmljYXRpb24udXBkYXRlTWFueSh7XG4gICAgICAgIHdoZXJlOiB7XG4gICAgICAgICAgcmVjZWl2ZXJJZDogc2Vzc2lvbi51c2VyLmlkLFxuICAgICAgICAgIHJlYWQ6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICByZWFkOiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgXG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBzdWNjZXNzOiB0cnVlIH0pO1xuICAgIH1cbiAgICBcbiAgICBpZiAoIWlkcyB8fCAhQXJyYXkuaXNBcnJheShpZHMpIHx8IGlkcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcbiAgICAgICAgeyBlcnJvcjogXCJJRHMgZGUgbm90aWZpY2HDp8O1ZXMgbsOjbyBmb3JuZWNpZG9zXCIgfSxcbiAgICAgICAgeyBzdGF0dXM6IDQwMCB9XG4gICAgICApO1xuICAgIH1cbiAgICBcbiAgICAvLyBWZXJpZmljYXIgc2UgdG9kYXMgYXMgbm90aWZpY2HDp8O1ZXMgcGVydGVuY2VtIGFvIHVzdcOhcmlvXG4gICAgY29uc3Qgbm90aWZpY2F0aW9ucyA9IGF3YWl0IHByaXNtYS5ub3RpZmljYXRpb24uZmluZE1hbnkoe1xuICAgICAgd2hlcmU6IHtcbiAgICAgICAgaWQ6IHsgaW46IGlkcyB9XG4gICAgICB9LFxuICAgICAgc2VsZWN0OiB7XG4gICAgICAgIGlkOiB0cnVlLFxuICAgICAgICByZWNlaXZlcklkOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gICAgXG4gICAgY29uc3QgdW5hdXRob3JpemVkSWRzID0gbm90aWZpY2F0aW9uc1xuICAgICAgLmZpbHRlcihub3RpZmljYXRpb24gPT4gbm90aWZpY2F0aW9uLnJlY2VpdmVySWQgIT09IHNlc3Npb24udXNlci5pZClcbiAgICAgIC5tYXAobm90aWZpY2F0aW9uID0+IG5vdGlmaWNhdGlvbi5pZCk7XG4gICAgXG4gICAgaWYgKHVuYXV0aG9yaXplZElkcy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICAgIHsgZXJyb3I6IFwiTsOjbyBhdXRvcml6YWRvIGEgbW9kaWZpY2FyIGFsZ3VtYXMgbm90aWZpY2HDp8O1ZXNcIiB9LFxuICAgICAgICB7IHN0YXR1czogNDAzIH1cbiAgICAgICk7XG4gICAgfVxuICAgIFxuICAgIC8vIE1hcmNhciBub3RpZmljYcOnw7VlcyBjb21vIGxpZGFzXG4gICAgYXdhaXQgcHJpc21hLm5vdGlmaWNhdGlvbi51cGRhdGVNYW55KHtcbiAgICAgIHdoZXJlOiB7XG4gICAgICAgIGlkOiB7IGluOiBpZHMgfVxuICAgICAgfSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgcmVhZDogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICAgIFxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IHN1Y2Nlc3M6IHRydWUgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkVycm8gYW8gYXR1YWxpemFyIG5vdGlmaWNhw6fDtWVzOlwiLCBlcnJvcik7XG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgeyBlcnJvcjogXCJFcnJvIGFvIHByb2Nlc3NhciBhIHNvbGljaXRhw6fDo29cIiB9LFxuICAgICAgeyBzdGF0dXM6IDUwMCB9XG4gICAgKTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsInByaXNtYSIsImdldFNlcnZlclNlc3Npb24iLCJhdXRoT3B0aW9ucyIsIkdFVCIsInJlcXVlc3QiLCJzZXNzaW9uIiwidXNlciIsImpzb24iLCJlcnJvciIsInN0YXR1cyIsInNlYXJjaFBhcmFtcyIsIlVSTCIsInVybCIsInVucmVhZE9ubHkiLCJnZXQiLCJub3RpZmljYXRpb25zIiwibm90aWZpY2F0aW9uIiwiZmluZE1hbnkiLCJ3aGVyZSIsInJlY2VpdmVySWQiLCJpZCIsInJlYWQiLCJpbmNsdWRlIiwic2VuZGVyIiwic2VsZWN0IiwibmFtZSIsImltYWdlIiwic2VydmljZSIsInRpdGxlIiwidmFsdWUiLCJkYXRlIiwiYmlkIiwib3JkZXJCeSIsImNyZWF0ZWRBdCIsImVucmljaGVkTm90aWZpY2F0aW9ucyIsIm1hcCIsInNlcnZpY2VJbmZvIiwiYmlkSW5mbyIsImRldGFpbHMiLCJmb3JtYXR0ZWRWYWx1ZSIsInRvRml4ZWQiLCJyZXBsYWNlIiwiZm9ybWF0dGVkRGF0ZSIsIkRhdGUiLCJ0b0xvY2FsZURhdGVTdHJpbmciLCJkYXkiLCJtb250aCIsInllYXIiLCJob3VyIiwibWludXRlIiwiY29uc29sZSIsIlBBVENIIiwiYm9keSIsImlkcyIsImFsbCIsInVwZGF0ZU1hbnkiLCJkYXRhIiwic3VjY2VzcyIsIkFycmF5IiwiaXNBcnJheSIsImxlbmd0aCIsImluIiwidW5hdXRob3JpemVkSWRzIiwiZmlsdGVyIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/notifications/route.ts\n");

/***/ }),

/***/ "(rsc)/./app/lib/prisma.ts":
/*!***************************!*\
  !*** ./app/lib/prisma.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst prisma = global.prisma || new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();\nif (true) global.prisma = prisma;\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (prisma);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvbGliL3ByaXNtYS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBNkM7QUFNN0MsTUFBTUMsU0FBU0MsT0FBT0QsTUFBTSxJQUFJLElBQUlELHdEQUFZQTtBQUVoRCxJQUFJRyxJQUFxQyxFQUFFRCxPQUFPRCxNQUFNLEdBQUdBO0FBRTNELGlFQUFlQSxNQUFNQSxFQUFBIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXE9sw6FcXERvY3VtZW50c1xcVVRBU0tcXGFwcFxcbGliXFxwcmlzbWEudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJpc21hQ2xpZW50IH0gZnJvbSAnQHByaXNtYS9jbGllbnQnXG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgdmFyIHByaXNtYTogUHJpc21hQ2xpZW50IHwgdW5kZWZpbmVkXG59XG5cbmNvbnN0IHByaXNtYSA9IGdsb2JhbC5wcmlzbWEgfHwgbmV3IFByaXNtYUNsaWVudCgpXG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSBnbG9iYWwucHJpc21hID0gcHJpc21hXG5cbmV4cG9ydCBkZWZhdWx0IHByaXNtYSJdLCJuYW1lcyI6WyJQcmlzbWFDbGllbnQiLCJwcmlzbWEiLCJnbG9iYWwiLCJwcm9jZXNzIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/lib/prisma.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fnotifications%2Froute&page=%2Fapi%2Fnotifications%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fnotifications%2Froute.ts&appDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fnotifications%2Froute&page=%2Fapi%2Fnotifications%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fnotifications%2Froute.ts&appDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_Ol_Documents_UTASK_app_api_notifications_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/notifications/route.ts */ \"(rsc)/./app/api/notifications/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/notifications/route\",\n        pathname: \"/api/notifications\",\n        filename: \"route\",\n        bundlePath: \"app/api/notifications/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\Olá\\\\Documents\\\\UTASK\\\\app\\\\api\\\\notifications\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_Ol_Documents_UTASK_app_api_notifications_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZub3RpZmljYXRpb25zJTJGcm91dGUmcGFnZT0lMkZhcGklMkZub3RpZmljYXRpb25zJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGbm90aWZpY2F0aW9ucyUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNPbCVDMyVBMSU1Q0RvY3VtZW50cyU1Q1VUQVNLJTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj1DJTNBJTVDVXNlcnMlNUNPbCVDMyVBMSU1Q0RvY3VtZW50cyU1Q1VUQVNLJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUErRjtBQUN2QztBQUNxQjtBQUNtQjtBQUNoRztBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNEQUFzRDtBQUM5RDtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUMwRjs7QUFFMUYiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiQzpcXFxcVXNlcnNcXFxcT2zDoVxcXFxEb2N1bWVudHNcXFxcVVRBU0tcXFxcYXBwXFxcXGFwaVxcXFxub3RpZmljYXRpb25zXFxcXHJvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9ub3RpZmljYXRpb25zL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvbm90aWZpY2F0aW9uc1wiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvbm90aWZpY2F0aW9ucy9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkM6XFxcXFVzZXJzXFxcXE9sw6FcXFxcRG9jdW1lbnRzXFxcXFVUQVNLXFxcXGFwcFxcXFxhcGlcXFxcbm90aWZpY2F0aW9uc1xcXFxyb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHdvcmtBc3luY1N0b3JhZ2UsXG4gICAgICAgIHdvcmtVbml0QXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fnotifications%2Froute&page=%2Fapi%2Fnotifications%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fnotifications%2Froute.ts&appDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

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
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/bcryptjs","vendor-chunks/oauth","vendor-chunks/object-hash","vendor-chunks/preact","vendor-chunks/uuid","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/lru-cache","vendor-chunks/cookie","vendor-chunks/oidc-token-hash","vendor-chunks/@panva"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fnotifications%2Froute&page=%2Fapi%2Fnotifications%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fnotifications%2Froute.ts&appDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();