/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/sw.js":
/*!*******************!*\
  !*** ./src/sw.js ***!
  \*******************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval(__webpack_require__.ts("importScripts(\"https://storage.googleapis.com/workbox-cdn/releases/6.6.0/workbox-sw.js\");\n// =========================================================\n// WORKBOX\n// =========================================================\nif (typeof workbox !== \"undefined\") {\n    console.log(\"[Service Worker] Workbox učitan.\");\n    // IMPORTANT:\n    // next-pwa / InjectManifest ubacuje manifest\n    // upravo na ovu liniju.\n    workbox.precaching.precacheAndRoute([]);\n    // =======================================================\n    // DOCUMENTS\n    // =======================================================\n    workbox.routing.registerRoute(({ request })=>request.destination === \"document\", new workbox.strategies.NetworkFirst({\n        cacheName: \"pages\"\n    }));\n    // =======================================================\n    // CSS / JS\n    // =======================================================\n    workbox.routing.registerRoute(({ request })=>request.destination === \"style\" || request.destination === \"script\", new workbox.strategies.StaleWhileRevalidate({\n        cacheName: \"assets\"\n    }));\n}\n// =========================================================\n// INSTALL\n// =========================================================\nself.addEventListener(\"install\", (event)=>{\n    console.log(\"[Service Worker] Install.\");\n    self.skipWaiting();\n});\n// =========================================================\n// ACTIVATE\n// =========================================================\nself.addEventListener(\"activate\", (event)=>{\n    console.log(\"[Service Worker] Activate.\");\n    event.waitUntil(self.clients.claim());\n});\n// =========================================================\n// WEB PUSH\n// =========================================================\nself.addEventListener(\"push\", (event)=>{\n    console.log(\"[Service Worker] PUSH event.\");\n    let data = {\n        title: \"Komšija\",\n        body: \"Imate novu notifikaciju.\",\n        url: \"/\",\n        icon: \"/icons/icon-192.png\",\n        badge: \"/icons/icon-192.png\"\n    };\n    // =======================================================\n    // READ PUSH DATA\n    // =======================================================\n    if (event.data) {\n        try {\n            const json = event.data.json();\n            data = {\n                ...data,\n                ...json\n            };\n        } catch  {\n            try {\n                data.body = event.data.text();\n            } catch  {\n            // Ignore invalid payload.\n            }\n        }\n    }\n    // =======================================================\n    // NOTIFICATION OPTIONS\n    // =======================================================\n    const title = data.title || \"Komšija\";\n    const options = {\n        body: data.body || \"Imate novu notifikaciju.\",\n        icon: data.icon || \"/icons/icon-192.png\",\n        badge: data.badge || \"/icons/icon-192.png\",\n        data: {\n            url: data.url || \"/\"\n        },\n        requireInteraction: false\n    };\n    // =======================================================\n    // SHOW NOTIFICATION\n    // =======================================================\n    event.waitUntil(self.registration.showNotification(title, options));\n});\n// =========================================================\n// NOTIFICATION CLICK\n// =========================================================\nself.addEventListener(\"notificationclick\", (event)=>{\n    console.log(\"[Service Worker] Notification click.\");\n    event.notification.close();\n    const url = event.notification.data?.url || \"/\";\n    event.waitUntil(self.clients.matchAll({\n        type: \"window\",\n        includeUncontrolled: true\n    }).then((clientList)=>{\n        // =================================================\n        // EXISTING WINDOW\n        // =================================================\n        for (const client of clientList){\n            if (\"navigate\" in client) {\n                client.navigate(url);\n                return client.focus();\n            }\n        }\n        // =================================================\n        // NEW WINDOW\n        // =================================================\n        if (self.clients.openWindow) {\n            return self.clients.openWindow(url);\n        }\n        return undefined;\n    }));\n});\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                /* unsupported import.meta.webpackHot */ undefined.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvc3cuanMiLCJtYXBwaW5ncyI6IkFBQUFBLGNBQ0U7QUFHRiw0REFBNEQ7QUFDNUQsVUFBVTtBQUNWLDREQUE0RDtBQUU1RCxJQUFJLE9BQU9DLFlBQVksYUFBYTtJQUNsQ0MsUUFBUUMsR0FBRyxDQUNUO0lBR0YsYUFBYTtJQUNiLDZDQUE2QztJQUM3Qyx3QkFBd0I7SUFDeEJGLFFBQVFHLFVBQVUsQ0FBQ0MsZ0JBQWdCLENBQ2pDQyxLQUFLQyxhQUFhO0lBR3BCLDBEQUEwRDtJQUMxRCxZQUFZO0lBQ1osMERBQTBEO0lBRTFETixRQUFRTyxPQUFPLENBQUNDLGFBQWEsQ0FDM0IsQ0FBQyxFQUFFQyxPQUFPLEVBQUUsR0FDVkEsUUFBUUMsV0FBVyxLQUFLLFlBRTFCLElBQUlWLFFBQVFXLFVBQVUsQ0FBQ0MsWUFBWSxDQUFDO1FBQ2xDQyxXQUFXO0lBQ2I7SUFHRiwwREFBMEQ7SUFDMUQsV0FBVztJQUNYLDBEQUEwRDtJQUUxRGIsUUFBUU8sT0FBTyxDQUFDQyxhQUFhLENBQzNCLENBQUMsRUFBRUMsT0FBTyxFQUFFLEdBQ1ZBLFFBQVFDLFdBQVcsS0FBSyxXQUN4QkQsUUFBUUMsV0FBVyxLQUFLLFVBRTFCLElBQUlWLFFBQVFXLFVBQVUsQ0FBQ0csb0JBQW9CLENBQUM7UUFDMUNELFdBQVc7SUFDYjtBQUVKO0FBRUEsNERBQTREO0FBQzVELFVBQVU7QUFDViw0REFBNEQ7QUFFNURSLEtBQUtVLGdCQUFnQixDQUNuQixXQUNBLENBQUNDO0lBQ0NmLFFBQVFDLEdBQUcsQ0FDVDtJQUdGRyxLQUFLWSxXQUFXO0FBQ2xCO0FBR0YsNERBQTREO0FBQzVELFdBQVc7QUFDWCw0REFBNEQ7QUFFNURaLEtBQUtVLGdCQUFnQixDQUNuQixZQUNBLENBQUNDO0lBQ0NmLFFBQVFDLEdBQUcsQ0FDVDtJQUdGYyxNQUFNRSxTQUFTLENBQ2JiLEtBQUtjLE9BQU8sQ0FBQ0MsS0FBSztBQUV0QjtBQUdGLDREQUE0RDtBQUM1RCxXQUFXO0FBQ1gsNERBQTREO0FBRTVEZixLQUFLVSxnQkFBZ0IsQ0FDbkIsUUFDQSxDQUFDQztJQUNDZixRQUFRQyxHQUFHLENBQ1Q7SUFHRixJQUFJbUIsT0FBTztRQUNUQyxPQUFPO1FBQ1BDLE1BQ0U7UUFDRkMsS0FBSztRQUNMQyxNQUNFO1FBQ0ZDLE9BQ0U7SUFDSjtJQUVBLDBEQUEwRDtJQUMxRCxpQkFBaUI7SUFDakIsMERBQTBEO0lBRTFELElBQUlWLE1BQU1LLElBQUksRUFBRTtRQUNkLElBQUk7WUFDRixNQUFNTSxPQUNKWCxNQUFNSyxJQUFJLENBQUNNLElBQUk7WUFFakJOLE9BQU87Z0JBQ0wsR0FBR0EsSUFBSTtnQkFDUCxHQUFHTSxJQUFJO1lBQ1Q7UUFDRixFQUFFLE9BQU07WUFDTixJQUFJO2dCQUNGTixLQUFLRSxJQUFJLEdBQ1BQLE1BQU1LLElBQUksQ0FBQ08sSUFBSTtZQUNuQixFQUFFLE9BQU07WUFDTiwwQkFBMEI7WUFDNUI7UUFDRjtJQUNGO0lBRUEsMERBQTBEO0lBQzFELHVCQUF1QjtJQUN2QiwwREFBMEQ7SUFFMUQsTUFBTU4sUUFDSkQsS0FBS0MsS0FBSyxJQUNWO0lBRUYsTUFBTU8sVUFBVTtRQUNkTixNQUNFRixLQUFLRSxJQUFJLElBQ1Q7UUFFRkUsTUFDRUosS0FBS0ksSUFBSSxJQUNUO1FBRUZDLE9BQ0VMLEtBQUtLLEtBQUssSUFDVjtRQUVGTCxNQUFNO1lBQ0pHLEtBQ0VILEtBQUtHLEdBQUcsSUFBSTtRQUNoQjtRQUVBTSxvQkFDRTtJQUNKO0lBRUEsMERBQTBEO0lBQzFELG9CQUFvQjtJQUNwQiwwREFBMEQ7SUFFMURkLE1BQU1FLFNBQVMsQ0FDYmIsS0FBSzBCLFlBQVksQ0FBQ0MsZ0JBQWdCLENBQ2hDVixPQUNBTztBQUdOO0FBR0YsNERBQTREO0FBQzVELHFCQUFxQjtBQUNyQiw0REFBNEQ7QUFFNUR4QixLQUFLVSxnQkFBZ0IsQ0FDbkIscUJBQ0EsQ0FBQ0M7SUFDQ2YsUUFBUUMsR0FBRyxDQUNUO0lBR0ZjLE1BQU1pQixZQUFZLENBQUNDLEtBQUs7SUFFeEIsTUFBTVYsTUFDSlIsTUFBTWlCLFlBQVksQ0FBQ1osSUFBSSxFQUFFRyxPQUN6QjtJQUVGUixNQUFNRSxTQUFTLENBQ2JiLEtBQUtjLE9BQU8sQ0FDVGdCLFFBQVEsQ0FBQztRQUNSQyxNQUFNO1FBQ05DLHFCQUFxQjtJQUN2QixHQUNDQyxJQUFJLENBQ0gsQ0FBQ0M7UUFDQyxvREFBb0Q7UUFDcEQsa0JBQWtCO1FBQ2xCLG9EQUFvRDtRQUVwRCxLQUNFLE1BQU1DLFVBQVVELFdBQ2hCO1lBQ0EsSUFDRSxjQUFjQyxRQUNkO2dCQUNBQSxPQUFPQyxRQUFRLENBQ2JqQjtnQkFHRixPQUFPZ0IsT0FBT0UsS0FBSztZQUNyQjtRQUNGO1FBRUEsb0RBQW9EO1FBQ3BELGFBQWE7UUFDYixvREFBb0Q7UUFFcEQsSUFDRXJDLEtBQUtjLE9BQU8sQ0FBQ3dCLFVBQVUsRUFDdkI7WUFDQSxPQUFPdEMsS0FBS2MsT0FBTyxDQUFDd0IsVUFBVSxDQUM1Qm5CO1FBRUo7UUFFQSxPQUFPb0I7SUFDVDtBQUdSIiwic291cmNlcyI6WyIvdmFyL3d3dy9zdGFtYmVuYS16YWplZG5pY2EvbmV4dGpzL3NyYy9zdy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnRTY3JpcHRzKFxuICBcImh0dHBzOi8vc3RvcmFnZS5nb29nbGVhcGlzLmNvbS93b3JrYm94LWNkbi9yZWxlYXNlcy82LjYuMC93b3JrYm94LXN3LmpzXCJcbik7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gV09SS0JPWFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmlmICh0eXBlb2Ygd29ya2JveCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICBjb25zb2xlLmxvZyhcbiAgICBcIltTZXJ2aWNlIFdvcmtlcl0gV29ya2JveCB1xI1pdGFuLlwiXG4gICk7XG5cbiAgLy8gSU1QT1JUQU5UOlxuICAvLyBuZXh0LXB3YSAvIEluamVjdE1hbmlmZXN0IHViYWN1amUgbWFuaWZlc3RcbiAgLy8gdXByYXZvIG5hIG92dSBsaW5panUuXG4gIHdvcmtib3gucHJlY2FjaGluZy5wcmVjYWNoZUFuZFJvdXRlKFxuICAgIHNlbGYuX19XQl9NQU5JRkVTVFxuICApO1xuXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gRE9DVU1FTlRTXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICB3b3JrYm94LnJvdXRpbmcucmVnaXN0ZXJSb3V0ZShcbiAgICAoeyByZXF1ZXN0IH0pID0+XG4gICAgICByZXF1ZXN0LmRlc3RpbmF0aW9uID09PSBcImRvY3VtZW50XCIsXG5cbiAgICBuZXcgd29ya2JveC5zdHJhdGVnaWVzLk5ldHdvcmtGaXJzdCh7XG4gICAgICBjYWNoZU5hbWU6IFwicGFnZXNcIixcbiAgICB9KVxuICApO1xuXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gQ1NTIC8gSlNcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIHdvcmtib3gucm91dGluZy5yZWdpc3RlclJvdXRlKFxuICAgICh7IHJlcXVlc3QgfSkgPT5cbiAgICAgIHJlcXVlc3QuZGVzdGluYXRpb24gPT09IFwic3R5bGVcIiB8fFxuICAgICAgcmVxdWVzdC5kZXN0aW5hdGlvbiA9PT0gXCJzY3JpcHRcIixcblxuICAgIG5ldyB3b3JrYm94LnN0cmF0ZWdpZXMuU3RhbGVXaGlsZVJldmFsaWRhdGUoe1xuICAgICAgY2FjaGVOYW1lOiBcImFzc2V0c1wiLFxuICAgIH0pXG4gICk7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gSU5TVEFMTFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbnNlbGYuYWRkRXZlbnRMaXN0ZW5lcihcbiAgXCJpbnN0YWxsXCIsXG4gIChldmVudCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFxuICAgICAgXCJbU2VydmljZSBXb3JrZXJdIEluc3RhbGwuXCJcbiAgICApO1xuXG4gICAgc2VsZi5za2lwV2FpdGluZygpO1xuICB9XG4pO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIEFDVElWQVRFXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuc2VsZi5hZGRFdmVudExpc3RlbmVyKFxuICBcImFjdGl2YXRlXCIsXG4gIChldmVudCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFxuICAgICAgXCJbU2VydmljZSBXb3JrZXJdIEFjdGl2YXRlLlwiXG4gICAgKTtcblxuICAgIGV2ZW50LndhaXRVbnRpbChcbiAgICAgIHNlbGYuY2xpZW50cy5jbGFpbSgpXG4gICAgKTtcbiAgfVxuKTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBXRUIgUFVTSFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbnNlbGYuYWRkRXZlbnRMaXN0ZW5lcihcbiAgXCJwdXNoXCIsXG4gIChldmVudCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFxuICAgICAgXCJbU2VydmljZSBXb3JrZXJdIFBVU0ggZXZlbnQuXCJcbiAgICApO1xuXG4gICAgbGV0IGRhdGEgPSB7XG4gICAgICB0aXRsZTogXCJLb23FoWlqYVwiLFxuICAgICAgYm9keTpcbiAgICAgICAgXCJJbWF0ZSBub3Z1IG5vdGlmaWthY2lqdS5cIixcbiAgICAgIHVybDogXCIvXCIsXG4gICAgICBpY29uOlxuICAgICAgICBcIi9pY29ucy9pY29uLTE5Mi5wbmdcIixcbiAgICAgIGJhZGdlOlxuICAgICAgICBcIi9pY29ucy9pY29uLTE5Mi5wbmdcIixcbiAgICB9O1xuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIFJFQUQgUFVTSCBEQVRBXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgaWYgKGV2ZW50LmRhdGEpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGpzb24gPVxuICAgICAgICAgIGV2ZW50LmRhdGEuanNvbigpO1xuXG4gICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgLi4uZGF0YSxcbiAgICAgICAgICAuLi5qc29uLFxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZGF0YS5ib2R5ID1cbiAgICAgICAgICAgIGV2ZW50LmRhdGEudGV4dCgpO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAvLyBJZ25vcmUgaW52YWxpZCBwYXlsb2FkLlxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIE5PVElGSUNBVElPTiBPUFRJT05TXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgY29uc3QgdGl0bGUgPVxuICAgICAgZGF0YS50aXRsZSB8fFxuICAgICAgXCJLb23FoWlqYVwiO1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIGJvZHk6XG4gICAgICAgIGRhdGEuYm9keSB8fFxuICAgICAgICBcIkltYXRlIG5vdnUgbm90aWZpa2FjaWp1LlwiLFxuXG4gICAgICBpY29uOlxuICAgICAgICBkYXRhLmljb24gfHxcbiAgICAgICAgXCIvaWNvbnMvaWNvbi0xOTIucG5nXCIsXG5cbiAgICAgIGJhZGdlOlxuICAgICAgICBkYXRhLmJhZGdlIHx8XG4gICAgICAgIFwiL2ljb25zL2ljb24tMTkyLnBuZ1wiLFxuXG4gICAgICBkYXRhOiB7XG4gICAgICAgIHVybDpcbiAgICAgICAgICBkYXRhLnVybCB8fCBcIi9cIixcbiAgICAgIH0sXG5cbiAgICAgIHJlcXVpcmVJbnRlcmFjdGlvbjpcbiAgICAgICAgZmFsc2UsXG4gICAgfTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBTSE9XIE5PVElGSUNBVElPTlxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIGV2ZW50LndhaXRVbnRpbChcbiAgICAgIHNlbGYucmVnaXN0cmF0aW9uLnNob3dOb3RpZmljYXRpb24oXG4gICAgICAgIHRpdGxlLFxuICAgICAgICBvcHRpb25zXG4gICAgICApXG4gICAgKTtcbiAgfVxuKTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBOT1RJRklDQVRJT04gQ0xJQ0tcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5zZWxmLmFkZEV2ZW50TGlzdGVuZXIoXG4gIFwibm90aWZpY2F0aW9uY2xpY2tcIixcbiAgKGV2ZW50KSA9PiB7XG4gICAgY29uc29sZS5sb2coXG4gICAgICBcIltTZXJ2aWNlIFdvcmtlcl0gTm90aWZpY2F0aW9uIGNsaWNrLlwiXG4gICAgKTtcblxuICAgIGV2ZW50Lm5vdGlmaWNhdGlvbi5jbG9zZSgpO1xuXG4gICAgY29uc3QgdXJsID1cbiAgICAgIGV2ZW50Lm5vdGlmaWNhdGlvbi5kYXRhPy51cmwgfHxcbiAgICAgIFwiL1wiO1xuXG4gICAgZXZlbnQud2FpdFVudGlsKFxuICAgICAgc2VsZi5jbGllbnRzXG4gICAgICAgIC5tYXRjaEFsbCh7XG4gICAgICAgICAgdHlwZTogXCJ3aW5kb3dcIixcbiAgICAgICAgICBpbmNsdWRlVW5jb250cm9sbGVkOiB0cnVlLFxuICAgICAgICB9KVxuICAgICAgICAudGhlbihcbiAgICAgICAgICAoY2xpZW50TGlzdCkgPT4ge1xuICAgICAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgICAgICAgLy8gRVhJU1RJTkcgV0lORE9XXG4gICAgICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICAgIGNvbnN0IGNsaWVudCBvZiBjbGllbnRMaXN0XG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIFwibmF2aWdhdGVcIiBpbiBjbGllbnRcbiAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgY2xpZW50Lm5hdmlnYXRlKFxuICAgICAgICAgICAgICAgICAgdXJsXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBjbGllbnQuZm9jdXMoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgICAgICAvLyBORVcgV0lORE9XXG4gICAgICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgc2VsZi5jbGllbnRzLm9wZW5XaW5kb3dcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICByZXR1cm4gc2VsZi5jbGllbnRzLm9wZW5XaW5kb3coXG4gICAgICAgICAgICAgICAgdXJsXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuICAgICAgICApXG4gICAgKTtcbiAgfVxuKTtcbiJdLCJuYW1lcyI6WyJpbXBvcnRTY3JpcHRzIiwid29ya2JveCIsImNvbnNvbGUiLCJsb2ciLCJwcmVjYWNoaW5nIiwicHJlY2FjaGVBbmRSb3V0ZSIsInNlbGYiLCJfX1dCX01BTklGRVNUIiwicm91dGluZyIsInJlZ2lzdGVyUm91dGUiLCJyZXF1ZXN0IiwiZGVzdGluYXRpb24iLCJzdHJhdGVnaWVzIiwiTmV0d29ya0ZpcnN0IiwiY2FjaGVOYW1lIiwiU3RhbGVXaGlsZVJldmFsaWRhdGUiLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJza2lwV2FpdGluZyIsIndhaXRVbnRpbCIsImNsaWVudHMiLCJjbGFpbSIsImRhdGEiLCJ0aXRsZSIsImJvZHkiLCJ1cmwiLCJpY29uIiwiYmFkZ2UiLCJqc29uIiwidGV4dCIsIm9wdGlvbnMiLCJyZXF1aXJlSW50ZXJhY3Rpb24iLCJyZWdpc3RyYXRpb24iLCJzaG93Tm90aWZpY2F0aW9uIiwibm90aWZpY2F0aW9uIiwiY2xvc2UiLCJtYXRjaEFsbCIsInR5cGUiLCJpbmNsdWRlVW5jb250cm9sbGVkIiwidGhlbiIsImNsaWVudExpc3QiLCJjbGllbnQiLCJuYXZpZ2F0ZSIsImZvY3VzIiwib3BlbldpbmRvdyIsInVuZGVmaW5lZCJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/sw.js\n"));

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			if (cachedModule.error !== undefined) throw cachedModule.error;
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/trusted types policy */
/******/ 	(() => {
/******/ 		var policy;
/******/ 		__webpack_require__.tt = () => {
/******/ 			// Create Trusted Type policy if Trusted Types are available and the policy doesn't exist yet.
/******/ 			if (policy === undefined) {
/******/ 				policy = {
/******/ 					createScript: (script) => (script)
/******/ 				};
/******/ 				if (typeof trustedTypes !== "undefined" && trustedTypes.createPolicy) {
/******/ 					policy = trustedTypes.createPolicy("nextjs#bundler", policy);
/******/ 				}
/******/ 			}
/******/ 			return policy;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/trusted types script */
/******/ 	(() => {
/******/ 		__webpack_require__.ts = (script) => (__webpack_require__.tt().createScript(script));
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/react refresh */
/******/ 	(() => {
/******/ 		if (__webpack_require__.i) {
/******/ 		__webpack_require__.i.push((options) => {
/******/ 			const originalFactory = options.factory;
/******/ 			options.factory = (moduleObject, moduleExports, webpackRequire) => {
/******/ 				if (!originalFactory) {
/******/ 					document.location.reload();
/******/ 					return;
/******/ 				}
/******/ 				const hasRefresh = typeof self !== "undefined" && !!self.$RefreshInterceptModuleExecution$;
/******/ 				const cleanup = hasRefresh ? self.$RefreshInterceptModuleExecution$(moduleObject.id) : () => {};
/******/ 				try {
/******/ 					originalFactory.call(this, moduleObject, moduleExports, webpackRequire);
/******/ 				} finally {
/******/ 					cleanup();
/******/ 				}
/******/ 			}
/******/ 		})
/******/ 		}
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	
/******/ 	// noop fns to prevent runtime errors during initialization
/******/ 	if (typeof self !== "undefined") {
/******/ 		self.$RefreshReg$ = function () {};
/******/ 		self.$RefreshSig$ = function () {
/******/ 			return function (type) {
/******/ 				return type;
/******/ 			};
/******/ 		};
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval-source-map devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/sw.js");
/******/ 	
/******/ })()
;