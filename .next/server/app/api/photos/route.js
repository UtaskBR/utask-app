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
exports.id = "app/api/photos/route";
exports.ids = ["app/api/photos/route"];
exports.modules = {

/***/ "(rsc)/./app/api/photos/route.ts":
/*!*********************************!*\
  !*** ./app/api/photos/route.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST),\n/* harmony export */   dynamic: () => (/* binding */ dynamic)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./app/lib/auth.ts\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./app/lib/prisma.ts\");\n/* harmony import */ var _lib_cloudinary__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/lib/cloudinary */ \"(rsc)/./app/lib/cloudinary.ts\");\n\n\n\n\n\nconst dynamic = \"force-dynamic\";\nasync function POST(request) {\n    const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_1__.getServerSession)(_lib_auth__WEBPACK_IMPORTED_MODULE_2__.authOptions);\n    if (!session?.user?.id) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Não autorizado\"\n        }, {\n            status: 401\n        });\n    }\n    const formData = await request.formData();\n    const serviceId = formData.get(\"serviceId\")?.toString();\n    if (!serviceId) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"ID do serviço ausente\"\n        }, {\n            status: 400\n        });\n    }\n    // ⚠️ Verificar se o serviço existe e pertence ao usuário logado\n    const service = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__[\"default\"].service.findUnique({\n        where: {\n            id: serviceId\n        },\n        select: {\n            creatorId: true\n        }\n    });\n    if (!service) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Serviço não encontrado\"\n        }, {\n            status: 404\n        });\n    }\n    if (service.creatorId !== session.user.id) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Você não tem permissão para alterar este serviço\"\n        }, {\n            status: 403\n        });\n    }\n    const files = formData.getAll(\"photos\");\n    if (!files.length) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Nenhuma foto enviada\"\n        }, {\n            status: 400\n        });\n    }\n    const uploadedPhotos = [];\n    for (const file of files){\n        const arrayBuffer = await file.arrayBuffer();\n        const buffer = Buffer.from(arrayBuffer);\n        const result = await new Promise((resolve, reject)=>{\n            const stream = _lib_cloudinary__WEBPACK_IMPORTED_MODULE_4__[\"default\"].uploader.upload_stream({\n                folder: \"utask/services\",\n                upload_preset: \"utask-gallery\"\n            }, (error, result)=>error ? reject(error) : resolve(result));\n            stream.end(buffer);\n        });\n        const createdPhoto = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__[\"default\"].photo.create({\n            data: {\n                url: result.secure_url,\n                publicId: result.public_id,\n                serviceId\n            }\n        });\n        uploadedPhotos.push(createdPhoto);\n    }\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(uploadedPhotos);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3Bob3Rvcy9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUF3RDtBQUNYO0FBQ0o7QUFDUDtBQUNRO0FBRW5DLE1BQU1LLFVBQVUsZ0JBQWdCO0FBRWhDLGVBQWVDLEtBQUtDLE9BQW9CO0lBQzdDLE1BQU1DLFVBQVUsTUFBTVAsMkRBQWdCQSxDQUFDQyxrREFBV0E7SUFFbEQsSUFBSSxDQUFDTSxTQUFTQyxNQUFNQyxJQUFJO1FBQ3RCLE9BQU9WLHFEQUFZQSxDQUFDVyxJQUFJLENBQUM7WUFBRUMsT0FBTztRQUFpQixHQUFHO1lBQUVDLFFBQVE7UUFBSTtJQUN0RTtJQUVBLE1BQU1DLFdBQVcsTUFBTVAsUUFBUU8sUUFBUTtJQUN2QyxNQUFNQyxZQUFZRCxTQUFTRSxHQUFHLENBQUMsY0FBY0M7SUFFN0MsSUFBSSxDQUFDRixXQUFXO1FBQ2QsT0FBT2YscURBQVlBLENBQUNXLElBQUksQ0FBQztZQUFFQyxPQUFPO1FBQXdCLEdBQUc7WUFBRUMsUUFBUTtRQUFJO0lBQzdFO0lBRUEsZ0VBQWdFO0lBQ2hFLE1BQU1LLFVBQVUsTUFBTWYsbURBQU1BLENBQUNlLE9BQU8sQ0FBQ0MsVUFBVSxDQUFDO1FBQzlDQyxPQUFPO1lBQUVWLElBQUlLO1FBQVU7UUFDdkJNLFFBQVE7WUFBRUMsV0FBVztRQUFLO0lBQzVCO0lBRUEsSUFBSSxDQUFDSixTQUFTO1FBQ1osT0FBT2xCLHFEQUFZQSxDQUFDVyxJQUFJLENBQUM7WUFBRUMsT0FBTztRQUF5QixHQUFHO1lBQUVDLFFBQVE7UUFBSTtJQUM5RTtJQUVBLElBQUlLLFFBQVFJLFNBQVMsS0FBS2QsUUFBUUMsSUFBSSxDQUFDQyxFQUFFLEVBQUU7UUFDekMsT0FBT1YscURBQVlBLENBQUNXLElBQUksQ0FBQztZQUFFQyxPQUFPO1FBQW1ELEdBQUc7WUFBRUMsUUFBUTtRQUFJO0lBQ3hHO0lBRUEsTUFBTVUsUUFBUVQsU0FBU1UsTUFBTSxDQUFDO0lBRTlCLElBQUksQ0FBQ0QsTUFBTUUsTUFBTSxFQUFFO1FBQ2pCLE9BQU96QixxREFBWUEsQ0FBQ1csSUFBSSxDQUFDO1lBQUVDLE9BQU87UUFBdUIsR0FBRztZQUFFQyxRQUFRO1FBQUk7SUFDNUU7SUFFQSxNQUFNYSxpQkFBaUIsRUFBRTtJQUV6QixLQUFLLE1BQU1DLFFBQVFKLE1BQU87UUFDeEIsTUFBTUssY0FBYyxNQUFNRCxLQUFLQyxXQUFXO1FBQzFDLE1BQU1DLFNBQVNDLE9BQU9DLElBQUksQ0FBQ0g7UUFFM0IsTUFBTUksU0FBUyxNQUFNLElBQUlDLFFBQWEsQ0FBQ0MsU0FBU0M7WUFDOUMsTUFBTUMsU0FBU2hDLHVEQUFVQSxDQUFDaUMsUUFBUSxDQUFDQyxhQUFhLENBQzlDO2dCQUFFQyxRQUFRO2dCQUFrQkMsZUFBZTtZQUFnQixHQUMzRCxDQUFDNUIsT0FBT29CLFNBQVlwQixRQUFRdUIsT0FBT3ZCLFNBQVNzQixRQUFRRjtZQUV0REksT0FBT0ssR0FBRyxDQUFDWjtRQUNiO1FBRUEsTUFBTWEsZUFBZSxNQUFNdkMsbURBQU1BLENBQUN3QyxLQUFLLENBQUNDLE1BQU0sQ0FBQztZQUM3Q0MsTUFBTTtnQkFDSkMsS0FBS2QsT0FBT2UsVUFBVTtnQkFDdEJDLFVBQVVoQixPQUFPaUIsU0FBUztnQkFDMUJsQztZQUNGO1FBQ0Y7UUFFQVcsZUFBZXdCLElBQUksQ0FBQ1I7SUFDdEI7SUFFQSxPQUFPMUMscURBQVlBLENBQUNXLElBQUksQ0FBQ2U7QUFDM0IiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcT2zDoVxcRG9jdW1lbnRzXFxVVEFTS1xcYXBwXFxhcGlcXHBob3Rvc1xccm91dGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlcXVlc3QsIE5leHRSZXNwb25zZSB9IGZyb20gXCJuZXh0L3NlcnZlclwiO1xuaW1wb3J0IHsgZ2V0U2VydmVyU2Vzc2lvbiB9IGZyb20gXCJuZXh0LWF1dGhcIjtcbmltcG9ydCB7IGF1dGhPcHRpb25zIH0gZnJvbSBcIkAvbGliL2F1dGhcIjtcbmltcG9ydCBwcmlzbWEgZnJvbSBcIkAvbGliL3ByaXNtYVwiO1xuaW1wb3J0IGNsb3VkaW5hcnkgZnJvbSBcIkAvbGliL2Nsb3VkaW5hcnlcIjtcblxuZXhwb3J0IGNvbnN0IGR5bmFtaWMgPSBcImZvcmNlLWR5bmFtaWNcIjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFBPU1QocmVxdWVzdDogTmV4dFJlcXVlc3QpIHtcbiAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IGdldFNlcnZlclNlc3Npb24oYXV0aE9wdGlvbnMpO1xuXG4gIGlmICghc2Vzc2lvbj8udXNlcj8uaWQpIHtcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogXCJOw6NvIGF1dG9yaXphZG9cIiB9LCB7IHN0YXR1czogNDAxIH0pO1xuICB9XG5cbiAgY29uc3QgZm9ybURhdGEgPSBhd2FpdCByZXF1ZXN0LmZvcm1EYXRhKCk7XG4gIGNvbnN0IHNlcnZpY2VJZCA9IGZvcm1EYXRhLmdldChcInNlcnZpY2VJZFwiKT8udG9TdHJpbmcoKTtcblxuICBpZiAoIXNlcnZpY2VJZCkge1xuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiBcIklEIGRvIHNlcnZpw6dvIGF1c2VudGVcIiB9LCB7IHN0YXR1czogNDAwIH0pO1xuICB9XG5cbiAgLy8g4pqg77iPIFZlcmlmaWNhciBzZSBvIHNlcnZpw6dvIGV4aXN0ZSBlIHBlcnRlbmNlIGFvIHVzdcOhcmlvIGxvZ2Fkb1xuICBjb25zdCBzZXJ2aWNlID0gYXdhaXQgcHJpc21hLnNlcnZpY2UuZmluZFVuaXF1ZSh7XG4gICAgd2hlcmU6IHsgaWQ6IHNlcnZpY2VJZCB9LFxuICAgIHNlbGVjdDogeyBjcmVhdG9ySWQ6IHRydWUgfSxcbiAgfSk7XG5cbiAgaWYgKCFzZXJ2aWNlKSB7XG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6IFwiU2VydmnDp28gbsOjbyBlbmNvbnRyYWRvXCIgfSwgeyBzdGF0dXM6IDQwNCB9KTtcbiAgfVxuXG4gIGlmIChzZXJ2aWNlLmNyZWF0b3JJZCAhPT0gc2Vzc2lvbi51c2VyLmlkKSB7XG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6IFwiVm9jw6ogbsOjbyB0ZW0gcGVybWlzc8OjbyBwYXJhIGFsdGVyYXIgZXN0ZSBzZXJ2acOnb1wiIH0sIHsgc3RhdHVzOiA0MDMgfSk7XG4gIH1cblxuICBjb25zdCBmaWxlcyA9IGZvcm1EYXRhLmdldEFsbChcInBob3Rvc1wiKSBhcyBGaWxlW107XG5cbiAgaWYgKCFmaWxlcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogXCJOZW5odW1hIGZvdG8gZW52aWFkYVwiIH0sIHsgc3RhdHVzOiA0MDAgfSk7XG4gIH1cblxuICBjb25zdCB1cGxvYWRlZFBob3RvcyA9IFtdO1xuXG4gIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuICAgIGNvbnN0IGFycmF5QnVmZmVyID0gYXdhaXQgZmlsZS5hcnJheUJ1ZmZlcigpO1xuICAgIGNvbnN0IGJ1ZmZlciA9IEJ1ZmZlci5mcm9tKGFycmF5QnVmZmVyKTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3Qgc3RyZWFtID0gY2xvdWRpbmFyeS51cGxvYWRlci51cGxvYWRfc3RyZWFtKFxuICAgICAgICB7IGZvbGRlcjogXCJ1dGFzay9zZXJ2aWNlc1wiLCB1cGxvYWRfcHJlc2V0OiBcInV0YXNrLWdhbGxlcnlcIiB9LFxuICAgICAgICAoZXJyb3IsIHJlc3VsdCkgPT4gKGVycm9yID8gcmVqZWN0KGVycm9yKSA6IHJlc29sdmUocmVzdWx0KSlcbiAgICAgICk7XG4gICAgICBzdHJlYW0uZW5kKGJ1ZmZlcik7XG4gICAgfSk7XG5cbiAgICBjb25zdCBjcmVhdGVkUGhvdG8gPSBhd2FpdCBwcmlzbWEucGhvdG8uY3JlYXRlKHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdXJsOiByZXN1bHQuc2VjdXJlX3VybCxcbiAgICAgICAgcHVibGljSWQ6IHJlc3VsdC5wdWJsaWNfaWQsXG4gICAgICAgIHNlcnZpY2VJZCxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICB1cGxvYWRlZFBob3Rvcy5wdXNoKGNyZWF0ZWRQaG90byk7XG4gIH1cblxuICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24odXBsb2FkZWRQaG90b3MpO1xufVxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsImdldFNlcnZlclNlc3Npb24iLCJhdXRoT3B0aW9ucyIsInByaXNtYSIsImNsb3VkaW5hcnkiLCJkeW5hbWljIiwiUE9TVCIsInJlcXVlc3QiLCJzZXNzaW9uIiwidXNlciIsImlkIiwianNvbiIsImVycm9yIiwic3RhdHVzIiwiZm9ybURhdGEiLCJzZXJ2aWNlSWQiLCJnZXQiLCJ0b1N0cmluZyIsInNlcnZpY2UiLCJmaW5kVW5pcXVlIiwid2hlcmUiLCJzZWxlY3QiLCJjcmVhdG9ySWQiLCJmaWxlcyIsImdldEFsbCIsImxlbmd0aCIsInVwbG9hZGVkUGhvdG9zIiwiZmlsZSIsImFycmF5QnVmZmVyIiwiYnVmZmVyIiwiQnVmZmVyIiwiZnJvbSIsInJlc3VsdCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0Iiwic3RyZWFtIiwidXBsb2FkZXIiLCJ1cGxvYWRfc3RyZWFtIiwiZm9sZGVyIiwidXBsb2FkX3ByZXNldCIsImVuZCIsImNyZWF0ZWRQaG90byIsInBob3RvIiwiY3JlYXRlIiwiZGF0YSIsInVybCIsInNlY3VyZV91cmwiLCJwdWJsaWNJZCIsInB1YmxpY19pZCIsInB1c2giXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/photos/route.ts\n");

/***/ }),

/***/ "(rsc)/./app/lib/auth.ts":
/*!*************************!*\
  !*** ./app/lib/auth.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/bcryptjs/index.js\");\n/* harmony import */ var _prisma__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./prisma */ \"(rsc)/./app/lib/prisma.ts\");\n\n\n\nconst authOptions = {\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({\n            name: \"credentials\",\n            credentials: {\n                email: {\n                    label: \"Email\",\n                    type: \"email\"\n                },\n                password: {\n                    label: \"Senha\",\n                    type: \"password\"\n                }\n            },\n            async authorize (credentials) {\n                if (!credentials?.email || !credentials?.password) {\n                    throw new Error(\"Credenciais inválidas\");\n                }\n                const email = credentials.email.toLowerCase();\n                const user = await _prisma__WEBPACK_IMPORTED_MODULE_2__[\"default\"].user.findUnique({\n                    where: {\n                        email: credentials.email\n                    }\n                });\n                if (!user || !user.password) {\n                    throw new Error(\"Usuário ou senha inválidos\");\n                }\n                const isPasswordValid = await (0,bcryptjs__WEBPACK_IMPORTED_MODULE_1__.compare)(credentials.password, user.password);\n                if (!isPasswordValid) {\n                    throw new Error(\"Usuário ou senha inválidos\");\n                }\n                return {\n                    id: user.id,\n                    email: user.email,\n                    name: user.name\n                };\n            }\n        })\n    ],\n    pages: {\n        signIn: \"/auth/login\",\n        signOut: \"/auth/logout\",\n        error: \"/auth/error\"\n    },\n    debug: \"development\" === \"development\",\n    session: {\n        strategy: \"jwt\",\n        maxAge: 30 * 24 * 60 * 60\n    },\n    secret: process.env.NEXTAUTH_SECRET,\n    callbacks: {\n        async jwt ({ token, user }) {\n            if (user) {\n                token.id = user.id;\n                token.sub = user.id;\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (session.user) {\n                session.user.id = token.id;\n            }\n            return session;\n        },\n        async redirect ({ url, baseUrl }) {\n            // Garante que o redirecionamento funcione para URLs relativas e absolutas\n            if (url.startsWith(baseUrl)) {\n                return url;\n            } else if (url.startsWith(\"/\")) {\n                return new URL(url, baseUrl).toString();\n            }\n            // Redireciona para a página inicial por padrão se a URL for inválida\n            return baseUrl;\n        }\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvbGliL2F1dGgudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNrRTtBQUMvQjtBQUNMO0FBY3ZCLE1BQU1HLGNBQStCO0lBQzFDQyxXQUFXO1FBQ1RKLDJFQUFtQkEsQ0FBQztZQUNsQkssTUFBTTtZQUNOQyxhQUFhO2dCQUNYQyxPQUFPO29CQUFFQyxPQUFPO29CQUFTQyxNQUFNO2dCQUFRO2dCQUN2Q0MsVUFBVTtvQkFBRUYsT0FBTztvQkFBU0MsTUFBTTtnQkFBVztZQUMvQztZQUNBLE1BQU1FLFdBQVVMLFdBQVc7Z0JBQ3pCLElBQUksQ0FBQ0EsYUFBYUMsU0FBUyxDQUFDRCxhQUFhSSxVQUFVO29CQUNqRCxNQUFNLElBQUlFLE1BQU07Z0JBQ2xCO2dCQUVBLE1BQU1MLFFBQVFELFlBQVlDLEtBQUssQ0FBQ00sV0FBVztnQkFFM0MsTUFBTUMsT0FBTyxNQUFNWiwrQ0FBTUEsQ0FBQ1ksSUFBSSxDQUFDQyxVQUFVLENBQUM7b0JBQ3hDQyxPQUFPO3dCQUNMVCxPQUFPRCxZQUFZQyxLQUFLO29CQUMxQjtnQkFDRjtnQkFFQSxJQUFJLENBQUNPLFFBQVEsQ0FBQ0EsS0FBS0osUUFBUSxFQUFFO29CQUMzQixNQUFNLElBQUlFLE1BQU07Z0JBQ2xCO2dCQUVBLE1BQU1LLGtCQUFrQixNQUFNaEIsaURBQU9BLENBQ25DSyxZQUFZSSxRQUFRLEVBQ3BCSSxLQUFLSixRQUFRO2dCQUdmLElBQUksQ0FBQ08saUJBQWlCO29CQUNwQixNQUFNLElBQUlMLE1BQU07Z0JBQ2xCO2dCQUVBLE9BQU87b0JBQ0xNLElBQUlKLEtBQUtJLEVBQUU7b0JBQ1hYLE9BQU9PLEtBQUtQLEtBQUs7b0JBQ2pCRixNQUFNUyxLQUFLVCxJQUFJO2dCQUNqQjtZQUNGO1FBQ0Y7S0FDRDtJQUNEYyxPQUFPO1FBQ0xDLFFBQVE7UUFDUkMsU0FBUztRQUNUQyxPQUFPO0lBQ1Q7SUFDQUMsT0FBT0Msa0JBQXlCO0lBQ2hDQyxTQUFTO1FBQ1BDLFVBQVU7UUFDVkMsUUFBUSxLQUFLLEtBQUssS0FBSztJQUN6QjtJQUNBQyxRQUFRSixRQUFRSyxHQUFHLENBQUNDLGVBQWU7SUFDbkNDLFdBQVc7UUFDVCxNQUFNQyxLQUFJLEVBQUVDLEtBQUssRUFBRW5CLElBQUksRUFBRTtZQUN2QixJQUFJQSxNQUFNO2dCQUNSbUIsTUFBTWYsRUFBRSxHQUFHSixLQUFLSSxFQUFFO2dCQUNsQmUsTUFBTUMsR0FBRyxHQUFHcEIsS0FBS0ksRUFBRTtZQUNyQjtZQUNBLE9BQU9lO1FBQ1Q7UUFDQSxNQUFNUixTQUFRLEVBQUVBLE9BQU8sRUFBRVEsS0FBSyxFQUFFO1lBQzlCLElBQUlSLFFBQVFYLElBQUksRUFBRTtnQkFDaEJXLFFBQVFYLElBQUksQ0FBQ0ksRUFBRSxHQUFHZSxNQUFNZixFQUFFO1lBQzVCO1lBQ0EsT0FBT087UUFDVDtRQUNBLE1BQU1VLFVBQVMsRUFBRUMsR0FBRyxFQUFFQyxPQUFPLEVBQUU7WUFDN0IsMEVBQTBFO1lBQzFFLElBQUlELElBQUlFLFVBQVUsQ0FBQ0QsVUFBVTtnQkFDM0IsT0FBT0Q7WUFDVCxPQUFPLElBQUlBLElBQUlFLFVBQVUsQ0FBQyxNQUFNO2dCQUM5QixPQUFPLElBQUlDLElBQUlILEtBQUtDLFNBQVNHLFFBQVE7WUFDdkM7WUFDQSxxRUFBcUU7WUFDckUsT0FBT0g7UUFDVDtJQUNGO0FBQ0YsRUFBRSIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFxPbMOhXFxEb2N1bWVudHNcXFVUQVNLXFxhcHBcXGxpYlxcYXV0aC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0QXV0aE9wdGlvbnMsIFNlc3Npb24gfSBmcm9tIFwibmV4dC1hdXRoXCI7XHJcbmltcG9ydCBDcmVkZW50aWFsc1Byb3ZpZGVyIGZyb20gXCJuZXh0LWF1dGgvcHJvdmlkZXJzL2NyZWRlbnRpYWxzXCI7XHJcbmltcG9ydCB7IGNvbXBhcmUgfSBmcm9tIFwiYmNyeXB0anNcIjtcclxuaW1wb3J0IHByaXNtYSBmcm9tIFwiLi9wcmlzbWFcIjtcclxuXHJcbi8vIEV4dGVuZCB0aGUgU2Vzc2lvbiB0eXBlIHRvIGluY2x1ZGUgdGhlIGlkIHByb3BlcnR5XHJcbmRlY2xhcmUgbW9kdWxlIFwibmV4dC1hdXRoXCIge1xyXG4gIGludGVyZmFjZSBTZXNzaW9uIHtcclxuICAgIHVzZXI6IHtcclxuICAgICAgaWQ6IHN0cmluZztcclxuICAgICAgbmFtZT86IHN0cmluZyB8IG51bGw7XHJcbiAgICAgIGVtYWlsPzogc3RyaW5nIHwgbnVsbDtcclxuICAgICAgaW1hZ2U/OiBzdHJpbmcgfCBudWxsO1xyXG4gICAgfTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBhdXRoT3B0aW9uczogTmV4dEF1dGhPcHRpb25zID0ge1xyXG4gIHByb3ZpZGVyczogW1xyXG4gICAgQ3JlZGVudGlhbHNQcm92aWRlcih7XHJcbiAgICAgIG5hbWU6IFwiY3JlZGVudGlhbHNcIixcclxuICAgICAgY3JlZGVudGlhbHM6IHtcclxuICAgICAgICBlbWFpbDogeyBsYWJlbDogXCJFbWFpbFwiLCB0eXBlOiBcImVtYWlsXCIgfSxcclxuICAgICAgICBwYXNzd29yZDogeyBsYWJlbDogXCJTZW5oYVwiLCB0eXBlOiBcInBhc3N3b3JkXCIgfVxyXG4gICAgICB9LFxyXG4gICAgICBhc3luYyBhdXRob3JpemUoY3JlZGVudGlhbHMpIHtcclxuICAgICAgICBpZiAoIWNyZWRlbnRpYWxzPy5lbWFpbCB8fCAhY3JlZGVudGlhbHM/LnBhc3N3b3JkKSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDcmVkZW5jaWFpcyBpbnbDoWxpZGFzXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBjb25zdCBlbWFpbCA9IGNyZWRlbnRpYWxzLmVtYWlsLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc3QgdXNlciA9IGF3YWl0IHByaXNtYS51c2VyLmZpbmRVbmlxdWUoe1xyXG4gICAgICAgICAgd2hlcmU6IHtcclxuICAgICAgICAgICAgZW1haWw6IGNyZWRlbnRpYWxzLmVtYWlsXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmICghdXNlciB8fCAhdXNlci5wYXNzd29yZCkge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVXN1w6FyaW8gb3Ugc2VuaGEgaW52w6FsaWRvc1wiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGlzUGFzc3dvcmRWYWxpZCA9IGF3YWl0IGNvbXBhcmUoXHJcbiAgICAgICAgICBjcmVkZW50aWFscy5wYXNzd29yZCxcclxuICAgICAgICAgIHVzZXIucGFzc3dvcmRcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAoIWlzUGFzc3dvcmRWYWxpZCkge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVXN1w6FyaW8gb3Ugc2VuaGEgaW52w6FsaWRvc1wiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBpZDogdXNlci5pZCxcclxuICAgICAgICAgIGVtYWlsOiB1c2VyLmVtYWlsLFxyXG4gICAgICAgICAgbmFtZTogdXNlci5uYW1lLFxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgXSxcclxuICBwYWdlczoge1xyXG4gICAgc2lnbkluOiBcIi9hdXRoL2xvZ2luXCIsXHJcbiAgICBzaWduT3V0OiBcIi9hdXRoL2xvZ291dFwiLFxyXG4gICAgZXJyb3I6IFwiL2F1dGgvZXJyb3JcIixcclxuICB9LFxyXG4gIGRlYnVnOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJkZXZlbG9wbWVudFwiLFxyXG4gIHNlc3Npb246IHtcclxuICAgIHN0cmF0ZWd5OiBcImp3dFwiLFxyXG4gICAgbWF4QWdlOiAzMCAqIDI0ICogNjAgKiA2MCwgLy8gMzAgZGlhc1xyXG4gIH0sXHJcbiAgc2VjcmV0OiBwcm9jZXNzLmVudi5ORVhUQVVUSF9TRUNSRVQsXHJcbiAgY2FsbGJhY2tzOiB7XHJcbiAgICBhc3luYyBqd3QoeyB0b2tlbiwgdXNlciB9KSB7XHJcbiAgICAgIGlmICh1c2VyKSB7XHJcbiAgICAgICAgdG9rZW4uaWQgPSB1c2VyLmlkO1xyXG4gICAgICAgIHRva2VuLnN1YiA9IHVzZXIuaWQ7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRva2VuO1xyXG4gICAgfSxcclxuICAgIGFzeW5jIHNlc3Npb24oeyBzZXNzaW9uLCB0b2tlbiB9KSB7XHJcbiAgICAgIGlmIChzZXNzaW9uLnVzZXIpIHtcclxuICAgICAgICBzZXNzaW9uLnVzZXIuaWQgPSB0b2tlbi5pZCBhcyBzdHJpbmc7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHNlc3Npb247XHJcbiAgICB9LFxyXG4gICAgYXN5bmMgcmVkaXJlY3QoeyB1cmwsIGJhc2VVcmwgfSkge1xyXG4gICAgICAvLyBHYXJhbnRlIHF1ZSBvIHJlZGlyZWNpb25hbWVudG8gZnVuY2lvbmUgcGFyYSBVUkxzIHJlbGF0aXZhcyBlIGFic29sdXRhc1xyXG4gICAgICBpZiAodXJsLnN0YXJ0c1dpdGgoYmFzZVVybCkpIHtcclxuICAgICAgICByZXR1cm4gdXJsO1xyXG4gICAgICB9IGVsc2UgaWYgKHVybC5zdGFydHNXaXRoKFwiL1wiKSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgVVJMKHVybCwgYmFzZVVybCkudG9TdHJpbmcoKTtcclxuICAgICAgfVxyXG4gICAgICAvLyBSZWRpcmVjaW9uYSBwYXJhIGEgcMOhZ2luYSBpbmljaWFsIHBvciBwYWRyw6NvIHNlIGEgVVJMIGZvciBpbnbDoWxpZGFcclxuICAgICAgcmV0dXJuIGJhc2VVcmw7XHJcbiAgICB9LFxyXG4gIH0sXHJcbn07XHJcbiJdLCJuYW1lcyI6WyJDcmVkZW50aWFsc1Byb3ZpZGVyIiwiY29tcGFyZSIsInByaXNtYSIsImF1dGhPcHRpb25zIiwicHJvdmlkZXJzIiwibmFtZSIsImNyZWRlbnRpYWxzIiwiZW1haWwiLCJsYWJlbCIsInR5cGUiLCJwYXNzd29yZCIsImF1dGhvcml6ZSIsIkVycm9yIiwidG9Mb3dlckNhc2UiLCJ1c2VyIiwiZmluZFVuaXF1ZSIsIndoZXJlIiwiaXNQYXNzd29yZFZhbGlkIiwiaWQiLCJwYWdlcyIsInNpZ25JbiIsInNpZ25PdXQiLCJlcnJvciIsImRlYnVnIiwicHJvY2VzcyIsInNlc3Npb24iLCJzdHJhdGVneSIsIm1heEFnZSIsInNlY3JldCIsImVudiIsIk5FWFRBVVRIX1NFQ1JFVCIsImNhbGxiYWNrcyIsImp3dCIsInRva2VuIiwic3ViIiwicmVkaXJlY3QiLCJ1cmwiLCJiYXNlVXJsIiwic3RhcnRzV2l0aCIsIlVSTCIsInRvU3RyaW5nIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/lib/auth.ts\n");

/***/ }),

/***/ "(rsc)/./app/lib/cloudinary.ts":
/*!*******************************!*\
  !*** ./app/lib/cloudinary.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var cloudinary__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! cloudinary */ \"(rsc)/./node_modules/cloudinary/cloudinary.js\");\n/* harmony import */ var cloudinary__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(cloudinary__WEBPACK_IMPORTED_MODULE_0__);\n\ncloudinary__WEBPACK_IMPORTED_MODULE_0__.v2.config({\n    cloud_name: \"dhkkz3vlv\",\n    api_key: \"246669364386365\",\n    api_secret: \"2WzMlaPynf_adyjXGQwflxqqRsA\"\n});\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (cloudinary__WEBPACK_IMPORTED_MODULE_0__.v2);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvbGliL2Nsb3VkaW5hcnkudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQThDO0FBRTlDQywwQ0FBVUEsQ0FBQ0MsTUFBTSxDQUFDO0lBQ2hCQyxZQUFZQyxXQUFpQztJQUM3Q0csU0FBU0gsaUJBQThCO0lBQ3ZDSyxZQUFZTCw2QkFBaUM7QUFDL0M7QUFFQSxpRUFBZUgsMENBQVVBLEVBQUMiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcT2zDoVxcRG9jdW1lbnRzXFxVVEFTS1xcYXBwXFxsaWJcXGNsb3VkaW5hcnkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdjIgYXMgY2xvdWRpbmFyeSB9IGZyb20gJ2Nsb3VkaW5hcnknO1xuXG5jbG91ZGluYXJ5LmNvbmZpZyh7XG4gIGNsb3VkX25hbWU6IHByb2Nlc3MuZW52LkNMT1VESU5BUllfQ0xPVURfTkFNRSxcbiAgYXBpX2tleTogcHJvY2Vzcy5lbnYuQ0xPVURJTkFSWV9BUElfS0VZLFxuICBhcGlfc2VjcmV0OiBwcm9jZXNzLmVudi5DTE9VRElOQVJZX0FQSV9TRUNSRVQsXG59KTtcblxuZXhwb3J0IGRlZmF1bHQgY2xvdWRpbmFyeTtcbiJdLCJuYW1lcyI6WyJ2MiIsImNsb3VkaW5hcnkiLCJjb25maWciLCJjbG91ZF9uYW1lIiwicHJvY2VzcyIsImVudiIsIkNMT1VESU5BUllfQ0xPVURfTkFNRSIsImFwaV9rZXkiLCJDTE9VRElOQVJZX0FQSV9LRVkiLCJhcGlfc2VjcmV0IiwiQ0xPVURJTkFSWV9BUElfU0VDUkVUIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/lib/cloudinary.ts\n");

/***/ }),

/***/ "(rsc)/./app/lib/prisma.ts":
/*!***************************!*\
  !*** ./app/lib/prisma.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n// app/lib/prisma.ts\n\n// Evita múltiplas instâncias do Prisma Client em desenvolvimento\nconst globalForPrisma = global;\nconst prisma = globalForPrisma.prisma || new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();\nif (true) globalForPrisma.prisma = prisma;\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (prisma);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvbGliL3ByaXNtYS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUEsb0JBQW9CO0FBRTBCO0FBRTlDLGlFQUFpRTtBQUNqRSxNQUFNQyxrQkFBa0JDO0FBRWpCLE1BQU1DLFNBQVNGLGdCQUFnQkUsTUFBTSxJQUFJLElBQUlILHdEQUFZQSxHQUFHO0FBRW5FLElBQUlJLElBQXFDLEVBQUVILGdCQUFnQkUsTUFBTSxHQUFHQTtBQUVwRSxpRUFBZUEsTUFBTUEsRUFBQyIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFxPbMOhXFxEb2N1bWVudHNcXFVUQVNLXFxhcHBcXGxpYlxccHJpc21hLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIGFwcC9saWIvcHJpc21hLnRzXG5cbmltcG9ydCB7IFByaXNtYUNsaWVudCB9IGZyb20gJ0BwcmlzbWEvY2xpZW50JztcblxuLy8gRXZpdGEgbcO6bHRpcGxhcyBpbnN0w6JuY2lhcyBkbyBQcmlzbWEgQ2xpZW50IGVtIGRlc2Vudm9sdmltZW50b1xuY29uc3QgZ2xvYmFsRm9yUHJpc21hID0gZ2xvYmFsIGFzIHVua25vd24gYXMgeyBwcmlzbWE6IFByaXNtYUNsaWVudCB9O1xuXG5leHBvcnQgY29uc3QgcHJpc21hID0gZ2xvYmFsRm9yUHJpc21hLnByaXNtYSB8fCBuZXcgUHJpc21hQ2xpZW50KCk7XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSBnbG9iYWxGb3JQcmlzbWEucHJpc21hID0gcHJpc21hO1xuXG5leHBvcnQgZGVmYXVsdCBwcmlzbWE7XG4iXSwibmFtZXMiOlsiUHJpc21hQ2xpZW50IiwiZ2xvYmFsRm9yUHJpc21hIiwiZ2xvYmFsIiwicHJpc21hIiwicHJvY2VzcyJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/lib/prisma.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fphotos%2Froute&page=%2Fapi%2Fphotos%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fphotos%2Froute.ts&appDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fphotos%2Froute&page=%2Fapi%2Fphotos%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fphotos%2Froute.ts&appDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_Ol_Documents_UTASK_app_api_photos_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/photos/route.ts */ \"(rsc)/./app/api/photos/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/photos/route\",\n        pathname: \"/api/photos\",\n        filename: \"route\",\n        bundlePath: \"app/api/photos/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\Olá\\\\Documents\\\\UTASK\\\\app\\\\api\\\\photos\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_Ol_Documents_UTASK_app_api_photos_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZwaG90b3MlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRnBob3RvcyUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRnBob3RvcyUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNPbCVDMyVBMSU1Q0RvY3VtZW50cyU1Q1VUQVNLJTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj1DJTNBJTVDVXNlcnMlNUNPbCVDMyVBMSU1Q0RvY3VtZW50cyU1Q1VUQVNLJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUErRjtBQUN2QztBQUNxQjtBQUNZO0FBQ3pGO0FBQ0E7QUFDQTtBQUNBLHdCQUF3Qix5R0FBbUI7QUFDM0M7QUFDQSxjQUFjLGtFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsc0RBQXNEO0FBQzlEO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQzBGOztBQUUxRiIsInNvdXJjZXMiOlsiIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCJDOlxcXFxVc2Vyc1xcXFxPbMOhXFxcXERvY3VtZW50c1xcXFxVVEFTS1xcXFxhcHBcXFxcYXBpXFxcXHBob3Rvc1xcXFxyb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvcGhvdG9zL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvcGhvdG9zXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9waG90b3Mvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCJDOlxcXFxVc2Vyc1xcXFxPbMOhXFxcXERvY3VtZW50c1xcXFxVVEFTS1xcXFxhcHBcXFxcYXBpXFxcXHBob3Rvc1xcXFxyb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHdvcmtBc3luY1N0b3JhZ2UsXG4gICAgICAgIHdvcmtVbml0QXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fphotos%2Froute&page=%2Fapi%2Fphotos%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fphotos%2Froute.ts&appDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

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

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

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

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("querystring");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

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
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/bcryptjs","vendor-chunks/oauth","vendor-chunks/object-hash","vendor-chunks/preact","vendor-chunks/uuid","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/lru-cache","vendor-chunks/cookie","vendor-chunks/oidc-token-hash","vendor-chunks/@panva","vendor-chunks/lodash","vendor-chunks/cloudinary","vendor-chunks/q"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fphotos%2Froute&page=%2Fapi%2Fphotos%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fphotos%2Froute.ts&appDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5COl%C3%A1%5CDocuments%5CUTASK&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();