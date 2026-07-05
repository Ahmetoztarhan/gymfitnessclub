const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname);
const port = Number(process.argv[2]) || 8020;

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".mov": "video/quicktime",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

const assetAliases = {
  "/media/hero-main.webp": "assets/images/WhatsApp Image 2026-06-17 at 12.03.24.webp",
  "/media/facility-layout.webp": "assets/images/WhatsApp Image 2026-06-17 at 12SAS.03.38.webp",
  "/media/training-zone.webp": "assets/images/WhatsApp Image 2026-06-17 atSADADAS 12.03.40.webp",
  "/media/video-poster.webp": "assets/images/WhatsApp Image 2026-06-17 at 12.03.40.webp",
  "/media/membership-1-month.webp": "assets/images/WhatsApp Image 2026-06-17 at 12.03.21.webp",
  "/media/membership-3-month.webp": "assets/images/WhatsApp Image 2026-06-17 at 12FHFFG.04.52.webp",
  "/media/membership-12-month.webp": "assets/images/WhatsApp Image 2026-06-17 atSADSADSA 12.03.39.webp",
  "/media/gallery-01.webp": "assets/images/WhatsApp Image 2026-06-17 at 12.03.24.webp",
  "/media/gallery-02.webp": "assets/images/WhatsApp Image 2026-06-17 at 12.03.21.webp",
  "/media/gallery-03.webp": "assets/images/WhatsApp Image 2026-06-17 at 12.03.34.webp",
  "/media/gallery-04.webp": "assets/images/WhatsApp Image 2026-06-17 at 12SAS.03.38.webp",
  "/media/gallery-05.webp": "assets/images/WhatsApp Image 2026-06-17 at 12FHFFG.04.52.webp",
  "/media/gallery-06.webp": "assets/images/WhatsApp Image 2026-06-17 atSADSADSA 12.03.39.webp",
  "/media/gallery-07.webp": "assets/images/WhatsApp Image 2026-06-17 at 12.03.40.webp",
  "/media/gallery-08.webp": "assets/images/WhatsApp Image 2026-06-17 at ASADDASA12.03.41.webp",
  "/media/gallery-09.webp": "assets/images/WhatsApp Image 2026-06-17 atSAASA 12.03.35.webp",
  "/media/gallery-10.webp": "assets/images/WhatsApp Image 2026-06-17DSADSADA at 12.03.39.webp",
  "/media/gallery-11.webp": "assets/images/WhatsApp Image 2026-06-SAAS17 at 12.03.38.webp",
  "/media/gallery-12.webp": "assets/images/WhatsApp Image 2026-06-17 ASat 12.03.34.webp",
};

const sendError = (response, statusCode, message) => {
  response.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(message);
};

http
  .createServer((request, response) => {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    } catch {
      sendError(response, 400, "Geçersiz istek");
      return;
    }

    if (pathname === "/favicon.ico" || pathname === "/favicon.png") {
      const faviconPath =
        pathname === "/favicon.ico"
          ? "C:\\Users\\Amtaz\\AppData\\Local\\Temp\\gym-favicon-cropped.ico"
          : "C:\\Users\\Amtaz\\AppData\\Local\\Temp\\gym-favicon-cropped.png";
      const faviconType = pathname === "/favicon.ico" ? "image/x-icon" : "image/png";
      fs.stat(faviconPath, (statError, stats) => {
        if (statError || !stats.isFile()) {
          sendError(response, 404, "Favicon bulunamadı");
          return;
        }

        response.writeHead(200, {
          "Cache-Control": "no-cache",
          "Content-Length": stats.size,
          "Content-Type": faviconType,
        });
        if (request.method === "HEAD") {
          response.end();
          return;
        }
        fs.createReadStream(faviconPath).pipe(response);
      });
      return;
    }

    if (assetAliases[pathname]) {
      pathname = `/${assetAliases[pathname]}`;
    }

    const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^[/\\]+/, "");
    const filePath = path.resolve(root, relativePath);
    if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
      sendError(response, 403, "Erişim reddedildi");
      return;
    }

    fs.stat(filePath, (statError, stats) => {
      if (statError || !stats.isFile()) {
        sendError(response, 404, "Dosya bulunamadı");
        return;
      }

      const contentType = mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream";
      const commonHeaders = {
        "Accept-Ranges": "bytes",
        "Cache-Control": "no-cache",
        "Content-Type": contentType,
      };
      const range = request.headers.range;

      if (range) {
        const match = /^bytes=(\d*)-(\d*)$/.exec(range);
        if (!match) {
          response.writeHead(416, { ...commonHeaders, "Content-Range": `bytes */${stats.size}` });
          response.end();
          return;
        }

        const start = match[1] ? Number(match[1]) : Math.max(0, stats.size - Number(match[2]));
        const requestedEnd = match[2] ? Number(match[2]) : stats.size - 1;
        const end = Math.min(requestedEnd, stats.size - 1);

        if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || start > end || start >= stats.size) {
          response.writeHead(416, { ...commonHeaders, "Content-Range": `bytes */${stats.size}` });
          response.end();
          return;
        }

        response.writeHead(206, {
          ...commonHeaders,
          "Content-Length": end - start + 1,
          "Content-Range": `bytes ${start}-${end}/${stats.size}`,
        });
        if (request.method === "HEAD") {
          response.end();
          return;
        }
        fs.createReadStream(filePath, { start, end }).pipe(response);
        return;
      }

      response.writeHead(200, { ...commonHeaders, "Content-Length": stats.size });
      if (request.method === "HEAD") {
        response.end();
        return;
      }
      fs.createReadStream(filePath).pipe(response);
    });
  })
  .listen(port, "127.0.0.1", () => {
    console.log(`GYM Fitness Club: http://127.0.0.1:${port}`);
  });
