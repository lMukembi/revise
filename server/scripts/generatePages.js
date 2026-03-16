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
  port: 587,
  secure: false,
  auth: {
    user: "mukembileviticus@gmail.com",
    pass: "vpkj yulh oatw aidm",
  },
});

async function sendEmail(subject, text) {
  try {
    const info = await transporter.sendMail({
      from: '"Revise Exams" <exams@revise.co.ke>',
      to: "exams.revise@gmail.com",
      subject,
      text,
    });

    log("Email sent: " + info.response);
  } catch (err) {
    log("Email failed: " + err.message);
  }
}

const publicDir = path.join(__dirname, "..", "public", "pages");
const outputDir = publicDir;

const sitemapPath = "/var/www/revise/client/build/sitemap.xml";

const siteBaseUrl = "https://revise.co.ke";
const cdnBaseUrl = "https://cdn.revise.co.ke";

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

log("Scanning /public directory for PDFs...");

const pdfFiles = fs.readdirSync(publicDir).filter((f) => f.endsWith(".pdf"));

if (pdfFiles.length === 0) {
  log("No PDF files found.");
  process.exit();
}

let sitemapEntries = [];

pdfFiles.forEach((file) => {
  const fileName = path.parse(file).name;
  const htmlFileName = fileName + ".html";

  const pageTitle = fileName.replace(/[-_]/g, " ").toUpperCase();

  const encodedFileUrl = `${cdnBaseUrl}/${encodeURIComponent(file)}`;
  const encodedHtmlUrl = `${siteBaseUrl}/pages/${encodeURIComponent(htmlFileName)}`;

  const htmlFilePath = path.join(outputDir, htmlFileName);

  if (!fs.existsSync(htmlFilePath)) {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Revise | Free Download ${pageTitle} Exam PDF Kenya</title>

<meta name="description"
content="Revise | Free Download ${pageTitle} Exam Paper PDF Kenya" />

<meta name="viewport" content="width=device-width, initial-scale=1.0" />

</head>

<body>

<h1>Revise | Free Download ${pageTitle} Exam Paper PDF Kenya</h1>

<p>
This page provides the ${pageTitle} past exam paper in PDF format for
free download. Students preparing for exams can download and revise
using real past exam questions.
</p>

<a href="${encodedFileUrl}" download>Download PDF</a>

</body>
</html>
`;

    fs.writeFileSync(htmlFilePath, htmlContent);

    log(`Generated HTML page: ${htmlFileName}`);
  }

  sitemapEntries.push({
    loc: encodedFileUrl,
    lastmod: new Date().toISOString(),
  });

  sitemapEntries.push({
    loc: encodedHtmlUrl,
    lastmod: new Date().toISOString(),
  });
});

log(`Found ${pdfFiles.length} PDFs.`);

const MAX_URLS = 40000;
const sitemapDir = path.dirname(sitemapPath);

let sitemapFiles = [];
let chunkIndex = 1;

for (let i = 0; i < sitemapEntries.length; i += MAX_URLS) {
  const chunk = sitemapEntries.slice(i, i + MAX_URLS);

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>

<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${chunk
  .map(
    (entry) => `
<url>
<loc>${entry.loc}</loc>
<lastmod>${entry.lastmod}</lastmod>
</url>`,
  )
  .join("")}

</urlset>`;

  const sitemapFileName = `sitemap-${chunkIndex}.xml`;
  const sitemapFilePath = path.join(sitemapDir, sitemapFileName);

  fs.writeFileSync(sitemapFilePath, sitemapXml);

  sitemapFiles.push(`${siteBaseUrl}/${sitemapFileName}`);

  log(`${sitemapFileName} generated`);

  chunkIndex++;
}

const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>

<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${sitemapFiles
  .map(
    (url) => `
<sitemap>
<loc>${url}</loc>
<lastmod>${new Date().toISOString()}</lastmod>
</sitemap>`,
  )
  .join("")}

</sitemapindex>`;

fs.writeFileSync(sitemapPath, sitemapIndexXml);

log("Sitemap index generated successfully.");

sendEmail(
  "PDF Scan Complete",
  `${pdfFiles.length} PDFs scanned and sitemap updated automatically.`,
);

log("HTML + sitemap generation completed.");
