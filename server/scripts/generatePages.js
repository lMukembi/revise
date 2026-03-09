const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const logFilePath = path.join(__dirname, "..", "logs", "generator.log");

fs.mkdirSync(path.dirname(logFilePath), { recursive: true });

function log(message) {
  const timestamp = new Date().toISOString();
  const fullMsg = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFilePath, fullMsg);
  console.log(fullMsg.trim());
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mukembileviticus@gmail.com",
    pass: "xsmc pxdb twfr xrsq",
  },
});

function sendEmail(subject, text) {
  transporter.sendMail(
    {
      from: "mukembileviticus@gmail.com",
      to: "exams.revise@gmail.com",
      subject,
      text,
    },
    (err, info) => {
      if (err) {
        log("Email failed: " + err.message);
      } else {
        log("Email sent: " + info.response);
      }
    }
  );
}

const pdfDir = path.join(__dirname, "..", "uploads");
const outputDir = path.join(__dirname, "..", "public", "pages");
const sitemapPath = path.join(__dirname, "..", "public", "sitemap.xml");
const siteBaseUrl = "https://revise.co.ke";

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

let sitemapEntries = [];

const pdfFiles = fs.readdirSync(pdfDir).filter((file) => file.endsWith(".pdf"));

if (pdfFiles.length === 0) {
  log("No PDF files found in the uploads directory.");
} else {
  log(`Found ${pdfFiles.length} PDF files to process.`);

  pdfFiles.forEach((file) => {
    const fileName = path.parse(file).name;
    const pageTitle = fileName.replace(/[-_]/g, " ").toUpperCase();
    const htmlFileName = fileName + ".html";

    const encodedFileUrl = `${siteBaseUrl}/uploads/${encodeURIComponent(file)}`;
    const encodedHtmlUrl = `${siteBaseUrl}/pages/${encodeURIComponent(
      htmlFileName
    )}`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${pageTitle} Exam PDF</title>
  <meta name="description" content="${pageTitle} Exam Paper PDF" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body>
  <h1>${pageTitle}</h1>
  <p>Download the ${pageTitle} exam paper in PDF format.</p>
  <a href="${encodedFileUrl}" download>Download PDF</a>
</body>
</html>`;

    fs.writeFileSync(path.join(outputDir, htmlFileName), htmlContent);

    log(`Generated HTML page for: ${pageTitle}`);

    sitemapEntries.push({
      loc: encodedFileUrl,
      lastmod: new Date().toISOString(),
    });
    sitemapEntries.push({
      loc: encodedHtmlUrl,
      lastmod: new Date().toISOString(),
    });
  });

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries
  .map(
    (entry) => `
  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
  </url>`
  )
  .join("")}
</urlset>`;

  fs.writeFileSync(sitemapPath, sitemapXml);
  log("Sitemap.xml generated successfully.");

  sendEmail(
    "PDFs and Sitemap Generated",
    "All exam PDF pages and sitemap.xml have been successfully generated."
  );
}

log("Pages and sitemap.xml generation process completed.");
