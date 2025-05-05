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

/***/ "(rsc)/./app/api/notifications/route.ts":
/*!****************************************!*\
  !*** ./app/api/notifications/route.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   PATCH: () => (/* binding */ PATCH)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./app/lib/prisma.ts\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./app/lib/auth.ts\");\n\n\n\n\n// GET /api/notifications - Obter notificações do usuário\nasync function GET(request, { params }) {\n    try {\n        const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_2__.getServerSession)(_lib_auth__WEBPACK_IMPORTED_MODULE_3__.authOptions);\n        if (!session || !session.user) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Não autorizado\"\n            }, {\n                status: 401\n            });\n        }\n        const { searchParams } = new URL(request.url);\n        const unreadOnly = searchParams.get('unreadOnly') === 'true';\n        const notifications = await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__[\"default\"].notification.findMany({\n            where: {\n                receiverId: session.user.id,\n                ...unreadOnly ? {\n                    read: false\n                } : {}\n            },\n            include: {\n                sender: {\n                    select: {\n                        id: true,\n                        name: true,\n                        image: true\n                    }\n                }\n            },\n            orderBy: {\n                createdAt: 'desc'\n            }\n        });\n        // Retornar as notificações sem tentar acessar relações inexistentes\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(notifications);\n    } catch (error) {\n        console.error(\"Erro ao buscar notificações:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Erro ao processar a solicitação\"\n        }, {\n            status: 500\n        });\n    }\n}\n// PATCH /api/notifications - Marcar notificações como lidas\nasync function PATCH(request, { params }) {\n    try {\n        const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_2__.getServerSession)(_lib_auth__WEBPACK_IMPORTED_MODULE_3__.authOptions);\n        if (!session || !session.user) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Não autorizado\"\n            }, {\n                status: 401\n            });\n        }\n        const body = await request.json();\n        const { ids, all } = body;\n        if (all) {\n            // Marcar todas as notificações do usuário como lidas\n            await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__[\"default\"].notification.updateMany({\n                where: {\n                    receiverId: session.user.id,\n                    read: false\n                },\n                data: {\n                    read: true\n                }\n            });\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: true\n            });\n        }\n        if (!ids || !Array.isArray(ids) || ids.length === 0) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"IDs de notificações não fornecidos\"\n            }, {\n                status: 400\n            });\n        }\n        // Verificar se todas as notificações pertencem ao usuário\n        const notifications = await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__[\"default\"].notification.findMany({\n            where: {\n                id: {\n                    in: ids\n                }\n            },\n            select: {\n                id: true,\n                receiverId: true\n            }\n        });\n        const unauthorizedIds = notifications.filter((notification)=>notification.receiverId !== session.user.id).map((notification)=>notification.id);\n        if (unauthorizedIds.length > 0) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Não autorizado a modificar algumas notificações\"\n            }, {\n                status: 403\n            });\n        }\n        // Marcar notificações como lidas\n        await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__[\"default\"].notification.updateMany({\n            where: {\n                id: {\n                    in: ids\n                }\n            },\n            data: {\n                read: true\n            }\n        });\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: true\n        });\n    } catch (error) {\n        console.error(\"Erro ao atualizar notificações:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Erro ao processar a solicitação\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL25vdGlmaWNhdGlvbnMvcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUF3RDtBQUN0QjtBQUNXO0FBQ0o7QUFFekMseURBQXlEO0FBQ2xELGVBQWVJLElBQ3BCQyxPQUFvQixFQUNwQixFQUFFQyxNQUFNLEVBQTZCO0lBRXJDLElBQUk7UUFDRixNQUFNQyxVQUFVLE1BQU1MLDJEQUFnQkEsQ0FBQ0Msa0RBQVdBO1FBRWxELElBQUksQ0FBQ0ksV0FBVyxDQUFDQSxRQUFRQyxJQUFJLEVBQUU7WUFDN0IsT0FBT1IscURBQVlBLENBQUNTLElBQUksQ0FDdEI7Z0JBQUVDLE9BQU87WUFBaUIsR0FDMUI7Z0JBQUVDLFFBQVE7WUFBSTtRQUVsQjtRQUVBLE1BQU0sRUFBRUMsWUFBWSxFQUFFLEdBQUcsSUFBSUMsSUFBSVIsUUFBUVMsR0FBRztRQUM1QyxNQUFNQyxhQUFhSCxhQUFhSSxHQUFHLENBQUMsa0JBQWtCO1FBRXRELE1BQU1DLGdCQUFnQixNQUFNaEIsbURBQU1BLENBQUNpQixZQUFZLENBQUNDLFFBQVEsQ0FBQztZQUN2REMsT0FBTztnQkFDTEMsWUFBWWQsUUFBUUMsSUFBSSxDQUFDYyxFQUFFO2dCQUMzQixHQUFJUCxhQUFhO29CQUFFUSxNQUFNO2dCQUFNLElBQUksQ0FBQyxDQUFDO1lBQ3ZDO1lBQ0FDLFNBQVM7Z0JBQ1BDLFFBQVE7b0JBQ05DLFFBQVE7d0JBQ05KLElBQUk7d0JBQ0pLLE1BQU07d0JBQ05DLE9BQU87b0JBQ1Q7Z0JBQ0Y7WUFDRjtZQUNBQyxTQUFTO2dCQUNQQyxXQUFXO1lBQ2I7UUFDRjtRQUVBLG9FQUFvRTtRQUNwRSxPQUFPOUIscURBQVlBLENBQUNTLElBQUksQ0FBQ1E7SUFDM0IsRUFBRSxPQUFPUCxPQUFPO1FBQ2RxQixRQUFRckIsS0FBSyxDQUFDLGdDQUFnQ0E7UUFDOUMsT0FBT1YscURBQVlBLENBQUNTLElBQUksQ0FDdEI7WUFBRUMsT0FBTztRQUFrQyxHQUMzQztZQUFFQyxRQUFRO1FBQUk7SUFFbEI7QUFDRjtBQUVBLDREQUE0RDtBQUNyRCxlQUFlcUIsTUFDcEIzQixPQUFvQixFQUNwQixFQUFFQyxNQUFNLEVBQTZCO0lBRXJDLElBQUk7UUFDRixNQUFNQyxVQUFVLE1BQU1MLDJEQUFnQkEsQ0FBQ0Msa0RBQVdBO1FBRWxELElBQUksQ0FBQ0ksV0FBVyxDQUFDQSxRQUFRQyxJQUFJLEVBQUU7WUFDN0IsT0FBT1IscURBQVlBLENBQUNTLElBQUksQ0FDdEI7Z0JBQUVDLE9BQU87WUFBaUIsR0FDMUI7Z0JBQUVDLFFBQVE7WUFBSTtRQUVsQjtRQUVBLE1BQU1zQixPQUFPLE1BQU01QixRQUFRSSxJQUFJO1FBQy9CLE1BQU0sRUFBRXlCLEdBQUcsRUFBRUMsR0FBRyxFQUFFLEdBQUdGO1FBRXJCLElBQUlFLEtBQUs7WUFDUCxxREFBcUQ7WUFDckQsTUFBTWxDLG1EQUFNQSxDQUFDaUIsWUFBWSxDQUFDa0IsVUFBVSxDQUFDO2dCQUNuQ2hCLE9BQU87b0JBQ0xDLFlBQVlkLFFBQVFDLElBQUksQ0FBQ2MsRUFBRTtvQkFDM0JDLE1BQU07Z0JBQ1I7Z0JBQ0FjLE1BQU07b0JBQ0pkLE1BQU07Z0JBQ1I7WUFDRjtZQUVBLE9BQU92QixxREFBWUEsQ0FBQ1MsSUFBSSxDQUFDO2dCQUFFNkIsU0FBUztZQUFLO1FBQzNDO1FBRUEsSUFBSSxDQUFDSixPQUFPLENBQUNLLE1BQU1DLE9BQU8sQ0FBQ04sUUFBUUEsSUFBSU8sTUFBTSxLQUFLLEdBQUc7WUFDbkQsT0FBT3pDLHFEQUFZQSxDQUFDUyxJQUFJLENBQ3RCO2dCQUFFQyxPQUFPO1lBQXFDLEdBQzlDO2dCQUFFQyxRQUFRO1lBQUk7UUFFbEI7UUFFQSwwREFBMEQ7UUFDMUQsTUFBTU0sZ0JBQWdCLE1BQU1oQixtREFBTUEsQ0FBQ2lCLFlBQVksQ0FBQ0MsUUFBUSxDQUFDO1lBQ3ZEQyxPQUFPO2dCQUNMRSxJQUFJO29CQUFFb0IsSUFBSVI7Z0JBQUk7WUFDaEI7WUFDQVIsUUFBUTtnQkFDTkosSUFBSTtnQkFDSkQsWUFBWTtZQUNkO1FBQ0Y7UUFFQSxNQUFNc0Isa0JBQWtCMUIsY0FDckIyQixNQUFNLENBQUMxQixDQUFBQSxlQUFnQkEsYUFBYUcsVUFBVSxLQUFLZCxRQUFRQyxJQUFJLENBQUNjLEVBQUUsRUFDbEV1QixHQUFHLENBQUMzQixDQUFBQSxlQUFnQkEsYUFBYUksRUFBRTtRQUV0QyxJQUFJcUIsZ0JBQWdCRixNQUFNLEdBQUcsR0FBRztZQUM5QixPQUFPekMscURBQVlBLENBQUNTLElBQUksQ0FDdEI7Z0JBQUVDLE9BQU87WUFBa0QsR0FDM0Q7Z0JBQUVDLFFBQVE7WUFBSTtRQUVsQjtRQUVBLGlDQUFpQztRQUNqQyxNQUFNVixtREFBTUEsQ0FBQ2lCLFlBQVksQ0FBQ2tCLFVBQVUsQ0FBQztZQUNuQ2hCLE9BQU87Z0JBQ0xFLElBQUk7b0JBQUVvQixJQUFJUjtnQkFBSTtZQUNoQjtZQUNBRyxNQUFNO2dCQUNKZCxNQUFNO1lBQ1I7UUFDRjtRQUVBLE9BQU92QixxREFBWUEsQ0FBQ1MsSUFBSSxDQUFDO1lBQUU2QixTQUFTO1FBQUs7SUFDM0MsRUFBRSxPQUFPNUIsT0FBTztRQUNkcUIsUUFBUXJCLEtBQUssQ0FBQyxtQ0FBbUNBO1FBQ2pELE9BQU9WLHFEQUFZQSxDQUFDUyxJQUFJLENBQ3RCO1lBQUVDLE9BQU87UUFBa0MsR0FDM0M7WUFBRUMsUUFBUTtRQUFJO0lBRWxCO0FBQ0YiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcT2zDoVxcRG9jdW1lbnRzXFxVVEFTS1xcYXBwXFxhcGlcXG5vdGlmaWNhdGlvbnNcXHJvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXF1ZXN0LCBOZXh0UmVzcG9uc2UgfSBmcm9tIFwibmV4dC9zZXJ2ZXJcIjtcbmltcG9ydCBwcmlzbWEgZnJvbSBcIkAvbGliL3ByaXNtYVwiO1xuaW1wb3J0IHsgZ2V0U2VydmVyU2Vzc2lvbiB9IGZyb20gXCJuZXh0LWF1dGhcIjtcbmltcG9ydCB7IGF1dGhPcHRpb25zIH0gZnJvbSBcIkAvbGliL2F1dGhcIjtcblxuLy8gR0VUIC9hcGkvbm90aWZpY2F0aW9ucyAtIE9idGVyIG5vdGlmaWNhw6fDtWVzIGRvIHVzdcOhcmlvXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKFxuICByZXF1ZXN0OiBOZXh0UmVxdWVzdCxcbiAgeyBwYXJhbXMgfTogeyBwYXJhbXM6IFByb21pc2U8eyAgfT4gfVxuKSB7XG4gIHRyeSB7XG4gICAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IGdldFNlcnZlclNlc3Npb24oYXV0aE9wdGlvbnMpO1xuICAgIFxuICAgIGlmICghc2Vzc2lvbiB8fCAhc2Vzc2lvbi51c2VyKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICAgIHsgZXJyb3I6IFwiTsOjbyBhdXRvcml6YWRvXCIgfSxcbiAgICAgICAgeyBzdGF0dXM6IDQwMSB9XG4gICAgICApO1xuICAgIH1cbiAgICBcbiAgICBjb25zdCB7IHNlYXJjaFBhcmFtcyB9ID0gbmV3IFVSTChyZXF1ZXN0LnVybCk7XG4gICAgY29uc3QgdW5yZWFkT25seSA9IHNlYXJjaFBhcmFtcy5nZXQoJ3VucmVhZE9ubHknKSA9PT0gJ3RydWUnO1xuICAgIFxuICAgIGNvbnN0IG5vdGlmaWNhdGlvbnMgPSBhd2FpdCBwcmlzbWEubm90aWZpY2F0aW9uLmZpbmRNYW55KHtcbiAgICAgIHdoZXJlOiB7XG4gICAgICAgIHJlY2VpdmVySWQ6IHNlc3Npb24udXNlci5pZCxcbiAgICAgICAgLi4uKHVucmVhZE9ubHkgPyB7IHJlYWQ6IGZhbHNlIH0gOiB7fSlcbiAgICAgIH0sXG4gICAgICBpbmNsdWRlOiB7XG4gICAgICAgIHNlbmRlcjoge1xuICAgICAgICAgIHNlbGVjdDoge1xuICAgICAgICAgICAgaWQ6IHRydWUsXG4gICAgICAgICAgICBuYW1lOiB0cnVlLFxuICAgICAgICAgICAgaW1hZ2U6IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvcmRlckJ5OiB7XG4gICAgICAgIGNyZWF0ZWRBdDogJ2Rlc2MnXG4gICAgICB9XG4gICAgfSk7XG4gICAgXG4gICAgLy8gUmV0b3JuYXIgYXMgbm90aWZpY2HDp8O1ZXMgc2VtIHRlbnRhciBhY2Vzc2FyIHJlbGHDp8O1ZXMgaW5leGlzdGVudGVzXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKG5vdGlmaWNhdGlvbnMpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvIGFvIGJ1c2NhciBub3RpZmljYcOnw7VlczpcIiwgZXJyb3IpO1xuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcbiAgICAgIHsgZXJyb3I6IFwiRXJybyBhbyBwcm9jZXNzYXIgYSBzb2xpY2l0YcOnw6NvXCIgfSxcbiAgICAgIHsgc3RhdHVzOiA1MDAgfVxuICAgICk7XG4gIH1cbn1cblxuLy8gUEFUQ0ggL2FwaS9ub3RpZmljYXRpb25zIC0gTWFyY2FyIG5vdGlmaWNhw6fDtWVzIGNvbW8gbGlkYXNcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBQQVRDSChcbiAgcmVxdWVzdDogTmV4dFJlcXVlc3QsXG4gIHsgcGFyYW1zIH06IHsgcGFyYW1zOiBQcm9taXNlPHsgIH0+IH1cbikge1xuICB0cnkge1xuICAgIGNvbnN0IHNlc3Npb24gPSBhd2FpdCBnZXRTZXJ2ZXJTZXNzaW9uKGF1dGhPcHRpb25zKTtcbiAgICBcbiAgICBpZiAoIXNlc3Npb24gfHwgIXNlc3Npb24udXNlcikge1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgICB7IGVycm9yOiBcIk7Do28gYXV0b3JpemFkb1wiIH0sXG4gICAgICAgIHsgc3RhdHVzOiA0MDEgfVxuICAgICAgKTtcbiAgICB9XG4gICAgXG4gICAgY29uc3QgYm9keSA9IGF3YWl0IHJlcXVlc3QuanNvbigpO1xuICAgIGNvbnN0IHsgaWRzLCBhbGwgfSA9IGJvZHk7XG4gICAgXG4gICAgaWYgKGFsbCkge1xuICAgICAgLy8gTWFyY2FyIHRvZGFzIGFzIG5vdGlmaWNhw6fDtWVzIGRvIHVzdcOhcmlvIGNvbW8gbGlkYXNcbiAgICAgIGF3YWl0IHByaXNtYS5ub3RpZmljYXRpb24udXBkYXRlTWFueSh7XG4gICAgICAgIHdoZXJlOiB7XG4gICAgICAgICAgcmVjZWl2ZXJJZDogc2Vzc2lvbi51c2VyLmlkLFxuICAgICAgICAgIHJlYWQ6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICByZWFkOiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgXG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBzdWNjZXNzOiB0cnVlIH0pO1xuICAgIH1cbiAgICBcbiAgICBpZiAoIWlkcyB8fCAhQXJyYXkuaXNBcnJheShpZHMpIHx8IGlkcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcbiAgICAgICAgeyBlcnJvcjogXCJJRHMgZGUgbm90aWZpY2HDp8O1ZXMgbsOjbyBmb3JuZWNpZG9zXCIgfSxcbiAgICAgICAgeyBzdGF0dXM6IDQwMCB9XG4gICAgICApO1xuICAgIH1cbiAgICBcbiAgICAvLyBWZXJpZmljYXIgc2UgdG9kYXMgYXMgbm90aWZpY2HDp8O1ZXMgcGVydGVuY2VtIGFvIHVzdcOhcmlvXG4gICAgY29uc3Qgbm90aWZpY2F0aW9ucyA9IGF3YWl0IHByaXNtYS5ub3RpZmljYXRpb24uZmluZE1hbnkoe1xuICAgICAgd2hlcmU6IHtcbiAgICAgICAgaWQ6IHsgaW46IGlkcyB9XG4gICAgICB9LFxuICAgICAgc2VsZWN0OiB7XG4gICAgICAgIGlkOiB0cnVlLFxuICAgICAgICByZWNlaXZlcklkOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gICAgXG4gICAgY29uc3QgdW5hdXRob3JpemVkSWRzID0gbm90aWZpY2F0aW9uc1xuICAgICAgLmZpbHRlcihub3RpZmljYXRpb24gPT4gbm90aWZpY2F0aW9uLnJlY2VpdmVySWQgIT09IHNlc3Npb24udXNlci5pZClcbiAgICAgIC5tYXAobm90aWZpY2F0aW9uID0+IG5vdGlmaWNhdGlvbi5pZCk7XG4gICAgXG4gICAgaWYgKHVuYXV0aG9yaXplZElkcy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICAgIHsgZXJyb3I6IFwiTsOjbyBhdXRvcml6YWRvIGEgbW9kaWZpY2FyIGFsZ3VtYXMgbm90aWZpY2HDp8O1ZXNcIiB9LFxuICAgICAgICB7IHN0YXR1czogNDAzIH1cbiAgICAgICk7XG4gICAgfVxuICAgIFxuICAgIC8vIE1hcmNhciBub3RpZmljYcOnw7VlcyBjb21vIGxpZGFzXG4gICAgYXdhaXQgcHJpc21hLm5vdGlmaWNhdGlvbi51cGRhdGVNYW55KHtcbiAgICAgIHdoZXJlOiB7XG4gICAgICAgIGlkOiB7IGluOiBpZHMgfVxuICAgICAgfSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgcmVhZDogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICAgIFxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IHN1Y2Nlc3M6IHRydWUgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkVycm8gYW8gYXR1YWxpemFyIG5vdGlmaWNhw6fDtWVzOlwiLCBlcnJvcik7XG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgeyBlcnJvcjogXCJFcnJvIGFvIHByb2Nlc3NhciBhIHNvbGljaXRhw6fDo29cIiB9LFxuICAgICAgeyBzdGF0dXM6IDUwMCB9XG4gICAgKTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsInByaXNtYSIsImdldFNlcnZlclNlc3Npb24iLCJhdXRoT3B0aW9ucyIsIkdFVCIsInJlcXVlc3QiLCJwYXJhbXMiLCJzZXNzaW9uIiwidXNlciIsImpzb24iLCJlcnJvciIsInN0YXR1cyIsInNlYXJjaFBhcmFtcyIsIlVSTCIsInVybCIsInVucmVhZE9ubHkiLCJnZXQiLCJub3RpZmljYXRpb25zIiwibm90aWZpY2F0aW9uIiwiZmluZE1hbnkiLCJ3aGVyZSIsInJlY2VpdmVySWQiLCJpZCIsInJlYWQiLCJpbmNsdWRlIiwic2VuZGVyIiwic2VsZWN0IiwibmFtZSIsImltYWdlIiwib3JkZXJCeSIsImNyZWF0ZWRBdCIsImNvbnNvbGUiLCJQQVRDSCIsImJvZHkiLCJpZHMiLCJhbGwiLCJ1cGRhdGVNYW55IiwiZGF0YSIsInN1Y2Nlc3MiLCJBcnJheSIsImlzQXJyYXkiLCJsZW5ndGgiLCJpbiIsInVuYXV0aG9yaXplZElkcyIsImZpbHRlciIsIm1hcCJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/notifications/route.ts\n");

/***/ }),

/***/ "(rsc)/./app/lib/auth.ts":
/*!*************************!*\
  !*** ./app/lib/auth.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/bcryptjs/index.js\");\n/* harmony import */ var _prisma__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./prisma */ \"(rsc)/./app/lib/prisma.ts\");\n\n\n\nconst authOptions = {\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({\n            name: \"credentials\",\n            credentials: {\n                email: {\n                    label: \"Email\",\n                    type: \"email\"\n                },\n                password: {\n                    label: \"Senha\",\n                    type: \"password\"\n                }\n            },\n            async authorize (credentials) {\n                if (!credentials?.email || !credentials?.password) {\n                    throw new Error(\"Credenciais inválidas\");\n                }\n                const email = credentials.email.toLowerCase();\n                const user = await _prisma__WEBPACK_IMPORTED_MODULE_2__[\"default\"].user.findUnique({\n                    where: {\n                        email: credentials.email\n                    }\n                });\n                if (!user || !user.password) {\n                    throw new Error(\"Usuário ou senha inválidos\");\n                }\n                const isPasswordValid = await (0,bcryptjs__WEBPACK_IMPORTED_MODULE_1__.compare)(credentials.password, user.password);\n                if (!isPasswordValid) {\n                    throw new Error(\"Usuário ou senha inválidos\");\n                }\n                return {\n                    id: user.id,\n                    email: user.email,\n                    name: user.name\n                };\n            }\n        })\n    ],\n    pages: {\n        signIn: \"/auth/login\",\n        signOut: \"/auth/logout\",\n        error: \"/auth/error\"\n    },\n    debug: \"development\" === \"development\",\n    session: {\n        strategy: \"jwt\",\n        maxAge: 30 * 24 * 60 * 60\n    },\n    secret: process.env.NEXTAUTH_SECRET,\n    callbacks: {\n        async jwt ({ token, user }) {\n            if (user) {\n                token.id = user.id;\n                token.sub = user.id;\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (session.user) {\n                session.user.id = token.id;\n            }\n            return session;\n        },\n        async redirect ({ url, baseUrl }) {\n            // Garante que o redirecionamento funcione para URLs relativas e absolutas\n            if (url.startsWith(baseUrl)) {\n                return url;\n            } else if (url.startsWith(\"/\")) {\n                return new URL(url, baseUrl).toString();\n            }\n            // Redireciona para a página inicial por padrão se a URL for inválida\n            return baseUrl;\n        }\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvbGliL2F1dGgudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNrRTtBQUMvQjtBQUNMO0FBY3ZCLE1BQU1HLGNBQStCO0lBQzFDQyxXQUFXO1FBQ1RKLDJFQUFtQkEsQ0FBQztZQUNsQkssTUFBTTtZQUNOQyxhQUFhO2dCQUNYQyxPQUFPO29CQUFFQyxPQUFPO29CQUFTQyxNQUFNO2dCQUFRO2dCQUN2Q0MsVUFBVTtvQkFBRUYsT0FBTztvQkFBU0MsTUFBTTtnQkFBVztZQUMvQztZQUNBLE1BQU1FLFdBQVVMLFdBQVc7Z0JBQ3pCLElBQUksQ0FBQ0EsYUFBYUMsU0FBUyxDQUFDRCxhQUFhSSxVQUFVO29CQUNqRCxNQUFNLElBQUlFLE1BQU07Z0JBQ2xCO2dCQUVBLE1BQU1MLFFBQVFELFlBQVlDLEtBQUssQ0FBQ00sV0FBVztnQkFFM0MsTUFBTUMsT0FBTyxNQUFNWiwrQ0FBTUEsQ0FBQ1ksSUFBSSxDQUFDQyxVQUFVLENBQUM7b0JBQ3hDQyxPQUFPO3dCQUNMVCxPQUFPRCxZQUFZQyxLQUFLO29CQUMxQjtnQkFDRjtnQkFFQSxJQUFJLENBQUNPLFFBQVEsQ0FBQ0EsS0FBS0osUUFBUSxFQUFFO29CQUMzQixNQUFNLElBQUlFLE1BQU07Z0JBQ2xCO2dCQUVBLE1BQU1LLGtCQUFrQixNQUFNaEIsaURBQU9BLENBQ25DSyxZQUFZSSxRQUFRLEVBQ3BCSSxLQUFLSixRQUFRO2dCQUdmLElBQUksQ0FBQ08saUJBQWlCO29CQUNwQixNQUFNLElBQUlMLE1BQU07Z0JBQ2xCO2dCQUVBLE9BQU87b0JBQ0xNLElBQUlKLEtBQUtJLEVBQUU7b0JBQ1hYLE9BQU9PLEtBQUtQLEtBQUs7b0JBQ2pCRixNQUFNUyxLQUFLVCxJQUFJO2dCQUNqQjtZQUNGO1FBQ0Y7S0FDRDtJQUNEYyxPQUFPO1FBQ0xDLFFBQVE7UUFDUkMsU0FBUztRQUNUQyxPQUFPO0lBQ1Q7SUFDQUMsT0FBT0Msa0JBQXlCO0lBQ2hDQyxTQUFTO1FBQ1BDLFVBQVU7UUFDVkMsUUFBUSxLQUFLLEtBQUssS0FBSztJQUN6QjtJQUNBQyxRQUFRSixRQUFRSyxHQUFHLENBQUNDLGVBQWU7SUFDbkNDLFdBQVc7UUFDVCxNQUFNQyxLQUFJLEVBQUVDLEtBQUssRUFBRW5CLElBQUksRUFBRTtZQUN2QixJQUFJQSxNQUFNO2dCQUNSbUIsTUFBTWYsRUFBRSxHQUFHSixLQUFLSSxFQUFFO2dCQUNsQmUsTUFBTUMsR0FBRyxHQUFHcEIsS0FBS0ksRUFBRTtZQUNyQjtZQUNBLE9BQU9lO1FBQ1Q7UUFDQSxNQUFNUixTQUFRLEVBQUVBLE9BQU8sRUFBRVEsS0FBSyxFQUFFO1lBQzlCLElBQUlSLFFBQVFYLElBQUksRUFBRTtnQkFDaEJXLFFBQVFYLElBQUksQ0FBQ0ksRUFBRSxHQUFHZSxNQUFNZixFQUFFO1lBQzVCO1lBQ0EsT0FBT087UUFDVDtRQUNBLE1BQU1VLFVBQVMsRUFBRUMsR0FBRyxFQUFFQyxPQUFPLEVBQUU7WUFDN0IsMEVBQTBFO1lBQzFFLElBQUlELElBQUlFLFVBQVUsQ0FBQ0QsVUFBVTtnQkFDM0IsT0FBT0Q7WUFDVCxPQUFPLElBQUlBLElBQUlFLFVBQVUsQ0FBQyxNQUFNO2dCQUM5QixPQUFPLElBQUlDLElBQUlILEtBQUtDLFNBQVNHLFFBQVE7WUFDdkM7WUFDQSxxRUFBcUU7WUFDckUsT0FBT0g7UUFDVDtJQUNGO0FBQ0YsRUFBRSIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFxPbMOhXFxEb2N1bWVudHNcXFVUQVNLXFxhcHBcXGxpYlxcYXV0aC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0QXV0aE9wdGlvbnMsIFNlc3Npb24gfSBmcm9tIFwibmV4dC1hdXRoXCI7XHJcbmltcG9ydCBDcmVkZW50aWFsc1Byb3ZpZGVyIGZyb20gXCJuZXh0LWF1dGgvcHJvdmlkZXJzL2NyZWRlbnRpYWxzXCI7XHJcbmltcG9ydCB7IGNvbXBhcmUgfSBmcm9tIFwiYmNyeXB0anNcIjtcclxuaW1wb3J0IHByaXNtYSBmcm9tIFwiLi9wcmlzbWFcIjtcclxuXHJcbi8vIEV4dGVuZCB0aGUgU2Vzc2lvbiB0eXBlIHRvIGluY2x1ZGUgdGhlIGlkIHByb3BlcnR5XHJcbmRlY2xhcmUgbW9kdWxlIFwibmV4dC1hdXRoXCIge1xyXG4gIGludGVyZmFjZSBTZXNzaW9uIHtcclxuICAgIHVzZXI6IHtcclxuICAgICAgaWQ6IHN0cmluZztcclxuICAgICAgbmFtZT86IHN0cmluZyB8IG51bGw7XHJcbiAgICAgIGVtYWlsPzogc3RyaW5nIHwgbnVsbDtcclxuICAgICAgaW1hZ2U/OiBzdHJpbmcgfCBudWxsO1xyXG4gICAgfTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBhdXRoT3B0aW9uczogTmV4dEF1dGhPcHRpb25zID0ge1xyXG4gIHByb3ZpZGVyczogW1xyXG4gICAgQ3JlZGVudGlhbHNQcm92aWRlcih7XHJcbiAgICAgIG5hbWU6IFwiY3JlZGVudGlhbHNcIixcclxuICAgICAgY3JlZGVudGlhbHM6IHtcclxuICAgICAgICBlbWFpbDogeyBsYWJlbDogXCJFbWFpbFwiLCB0eXBlOiBcImVtYWlsXCIgfSxcclxuICAgICAgICBwYXNzd29yZDogeyBsYWJlbDogXCJTZW5oYVwiLCB0eXBlOiBcInBhc3N3b3JkXCIgfVxyXG4gICAgICB9LFxyXG4gICAgICBhc3luYyBhdXRob3JpemUoY3JlZGVudGlhbHMpIHtcclxuICAgICAgICBpZiAoIWNyZWRlbnRpYWxzPy5lbWFpbCB8fCAhY3JlZGVudGlhbHM/LnBhc3N3b3JkKSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDcmVkZW5jaWFpcyBpbnbDoWxpZGFzXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBjb25zdCBlbWFpbCA9IGNyZWRlbnRpYWxzLmVtYWlsLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc3QgdXNlciA9IGF3YWl0IHByaXNtYS51c2VyLmZpbmRVbmlxdWUoe1xyXG4gICAgICAgICAgd2hlcmU6IHtcclxuICAgICAgICAgICAgZW1haWw6IGNyZWRlbnRpYWxzLmVtYWlsXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmICghdXNlciB8fCAhdXNlci5wYXNzd29yZCkge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVXN1w6FyaW8gb3Ugc2VuaGEgaW52w6FsaWRvc1wiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGlzUGFzc3dvcmRWYWxpZCA9IGF3YWl0IGNvbXBhcmUoXHJcbiAgICAgICAgICBjcmVkZW50aWFscy5wYXNzd29yZCxcclxuICAgICAgICAgIHVzZXIucGFzc3dvcmRcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAoIWlzUGFzc3dvcmRWYWxpZCkge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVXN1w6FyaW8gb3Ugc2VuaGEgaW52w6FsaWRvc1wiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBpZDogdXNlci5pZCxcclxuICAgICAgICAgIGVtYWlsOiB1c2VyLmVtYWlsLFxyXG4gICAgICAgICAgbmFtZTogdXNlci5uYW1lLFxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgXSxcclxuICBwYWdlczoge1xyXG4gICAgc2lnbkluOiBcIi9hdXRoL2xvZ2luXCIsXHJcbiAgICBzaWduT3V0OiBcIi9hdXRoL2xvZ291dFwiLFxyXG4gICAgZXJyb3I6IFwiL2F1dGgvZXJyb3JcIixcclxuICB9LFxyXG4gIGRlYnVnOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJkZXZlbG9wbWVudFwiLFxyXG4gIHNlc3Npb246IHtcclxuICAgIHN0cmF0ZWd5OiBcImp3dFwiLFxyXG4gICAgbWF4QWdlOiAzMCAqIDI0ICogNjAgKiA2MCwgLy8gMzAgZGlhc1xyXG4gIH0sXHJcbiAgc2VjcmV0OiBwcm9jZXNzLmVudi5ORVhUQVVUSF9TRUNSRVQsXHJcbiAgY2FsbGJhY2tzOiB7XHJcbiAgICBhc3luYyBqd3QoeyB0b2tlbiwgdXNlciB9KSB7XHJcbiAgICAgIGlmICh1c2VyKSB7XHJcbiAgICAgICAgdG9rZW4uaWQgPSB1c2VyLmlkO1xyXG4gICAgICAgIHRva2VuLnN1YiA9IHVzZXIuaWQ7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRva2VuO1xyXG4gICAgfSxcclxuICAgIGFzeW5jIHNlc3Npb24oeyBzZXNzaW9uLCB0b2tlbiB9KSB7XHJcbiAgICAgIGlmIChzZXNzaW9uLnVzZXIpIHtcclxuICAgICAgICBzZXNzaW9uLnVzZXIuaWQgPSB0b2tlbi5pZCBhcyBzdHJpbmc7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHNlc3Npb247XHJcbiAgICB9LFxyXG4gICAgYXN5bmMgcmVkaXJlY3QoeyB1cmwsIGJhc2VVcmwgfSkge1xyXG4gICAgICAvLyBHYXJhbnRlIHF1ZSBvIHJlZGlyZWNpb25hbWVudG8gZnVuY2lvbmUgcGFyYSBVUkxzIHJlbGF0aXZhcyBlIGFic29sdXRhc1xyXG4gICAgICBpZiAodXJsLnN0YXJ0c1dpdGgoYmFzZVVybCkpIHtcclxuICAgICAgICByZXR1cm4gdXJsO1xyXG4gICAgICB9IGVsc2UgaWYgKHVybC5zdGFydHNXaXRoKFwiL1wiKSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgVVJMKHVybCwgYmFzZVVybCkudG9TdHJpbmcoKTtcclxuICAgICAgfVxyXG4gICAgICAvLyBSZWRpcmVjaW9uYSBwYXJhIGEgcMOhZ2luYSBpbmljaWFsIHBvciBwYWRyw6NvIHNlIGEgVVJMIGZvciBpbnbDoWxpZGFcclxuICAgICAgcmV0dXJuIGJhc2VVcmw7XHJcbiAgICB9LFxyXG4gIH0sXHJcbn07XHJcbiJdLCJuYW1lcyI6WyJDcmVkZW50aWFsc1Byb3ZpZGVyIiwiY29tcGFyZSIsInByaXNtYSIsImF1dGhPcHRpb25zIiwicHJvdmlkZXJzIiwibmFtZSIsImNyZWRlbnRpYWxzIiwiZW1haWwiLCJsYWJlbCIsInR5cGUiLCJwYXNzd29yZCIsImF1dGhvcml6ZSIsIkVycm9yIiwidG9Mb3dlckNhc2UiLCJ1c2VyIiwiZmluZFVuaXF1ZSIsIndoZXJlIiwiaXNQYXNzd29yZFZhbGlkIiwiaWQiLCJwYWdlcyIsInNpZ25JbiIsInNpZ25PdXQiLCJlcnJvciIsImRlYnVnIiwicHJvY2VzcyIsInNlc3Npb24iLCJzdHJhdGVneSIsIm1heEFnZSIsInNlY3JldCIsImVudiIsIk5FWFRBVVRIX1NFQ1JFVCIsImNhbGxiYWNrcyIsImp3dCIsInRva2VuIiwic3ViIiwicmVkaXJlY3QiLCJ1cmwiLCJiYXNlVXJsIiwic3RhcnRzV2l0aCIsIlVSTCIsInRvU3RyaW5nIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/lib/auth.ts\n");

/***/ }),

/***/ "(rsc)/./app/lib/prisma.ts":
/*!***************************!*\
  !*** ./app/lib/prisma.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n// app/lib/prisma.ts\n\n// Evita múltiplas instâncias do Prisma Client em desenvolvimento\nconst globalForPrisma = global;\nconst prisma = globalForPrisma.prisma || new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();\nif (true) globalForPrisma.prisma = prisma;\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (prisma);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvbGliL3ByaXNtYS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUEsb0JBQW9CO0FBRTBCO0FBRTlDLGlFQUFpRTtBQUNqRSxNQUFNQyxrQkFBa0JDO0FBRWpCLE1BQU1DLFNBQVNGLGdCQUFnQkUsTUFBTSxJQUFJLElBQUlILHdEQUFZQSxHQUFHO0FBRW5FLElBQUlJLElBQXFDLEVBQUVILGdCQUFnQkUsTUFBTSxHQUFHQTtBQUVwRSxpRUFBZUEsTUFBTUEsRUFBQyIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFxPbMOhXFxEb2N1bWVudHNcXFVUQVNLXFxhcHBcXGxpYlxccHJpc21hLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIGFwcC9saWIvcHJpc21hLnRzXG5cbmltcG9ydCB7IFByaXNtYUNsaWVudCB9IGZyb20gJ0BwcmlzbWEvY2xpZW50JztcblxuLy8gRXZpdGEgbcO6bHRpcGxhcyBpbnN0w6JuY2lhcyBkbyBQcmlzbWEgQ2xpZW50IGVtIGRlc2Vudm9sdmltZW50b1xuY29uc3QgZ2xvYmFsRm9yUHJpc21hID0gZ2xvYmFsIGFzIHVua25vd24gYXMgeyBwcmlzbWE6IFByaXNtYUNsaWVudCB9O1xuXG5leHBvcnQgY29uc3QgcHJpc21hID0gZ2xvYmFsRm9yUHJpc21hLnByaXNtYSB8fCBuZXcgUHJpc21hQ2xpZW50KCk7XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSBnbG9iYWxGb3JQcmlzbWEucHJpc21hID0gcHJpc21hO1xuXG5leHBvcnQgZGVmYXVsdCBwcmlzbWE7XG4iXSwibmFtZXMiOlsiUHJpc21hQ2xpZW50IiwiZ2xvYmFsRm9yUHJpc21hIiwiZ2xvYmFsIiwicHJpc21hIiwicHJvY2VzcyJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/lib/prisma.ts\n");

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