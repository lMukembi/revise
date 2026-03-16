const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");

const r2 = new S3Client({
  region: "auto",
  endpoint: "https://12460cf19b8e36e1616b6d950df74b06.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: "a1c9d8b9653c37166723b2a309d519b2",
    secretAccessKey:
      "f7f7005148ec98e47511c3ee7fd98fa8765b30b2f1f7315e296a569616b1081d",
  },
});

const R2_BUCKET = "revise-pdfs";

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

const outputDir = "/var/www/revise/client/build/pages";
const sitemapPath = "/var/www/revise/client/build/sitemap.xml";
const siteBaseUrl = "https://revise.co.ke";
const cdnBaseUrl = "https://cdn.revise.co.ke";

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

let sitemapEntries = [];

async function getR2PdfFiles() {
  const command = new ListObjectsV2Command({ Bucket: R2_BUCKET });
  const response = await r2.send(command);
  return (response.Contents || [])
    .map((obj) => obj.Key)
    .filter((file) => file.toLowerCase().endsWith(".pdf"));
}

const parseExistingSitemap = () => {
  if (!fs.existsSync(sitemapPath)) return [];
  const data = fs.readFileSync(sitemapPath, "utf-8");
  const urlMatches = [...data.matchAll(/<loc>(.*?)<\/loc>/g)];
  return urlMatches.map((m) => m[1]);
};

async function run() {
  const pdfFiles = await getR2PdfFiles();

  if (!pdfFiles.length) {
    log("No PDFs found in R2 bucket.");
    process.exit();
  }

  log(`Processing ${pdfFiles.length} PDFs from R2.`);

  const existingUrls = parseExistingSitemap();

  pdfFiles.forEach((file) => {
    const fileName = path.parse(file).name;

    const pageTitle = fileName
      .replace(/^\d+\s*/, "")
      .replace(/[-_]/g, " ")
      .toUpperCase();

    const slug = fileName
      .toLowerCase()
      .replace(/^\d+/, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");

    const htmlFileName = `${slug}.html`;

    const encodedFileUrl = `${cdnBaseUrl}/${encodeURIComponent(file)}`;
    const encodedHtmlUrl = `${siteBaseUrl}/pages/${encodeURIComponent(htmlFileName)}`;

    const htmlPath = path.join(outputDir, htmlFileName);
    if (!fs.existsSync(htmlPath)) {
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Revise | Free Download ${pageTitle} Exam Paper PDF Kenya</title>
  <meta name="description" content="Revise | Free Download ${pageTitle} Exam Paper PDF Kenya" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 2rem auto; line-height: 1.6; }
    h1 { color: #1a73e8; }
    .download-btn { display: inline-block; padding: 12px 24px; background: #1a73e8; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 1rem; }
  </style>
</head>
<body>
  <h1>${pageTitle} Exam Paper PDF Kenya</h1>
  <p>This page provides the <strong>${pageTitle}</strong> past exam paper in PDF format for free download. Students preparing for exams can revise using real past exam questions.</p>
  
  <a href="#" class="download-btn" id="downloadBtn">Download PDF</a>

  <script>
    const fileUrl = "${encodedFileUrl}";

    document.getElementById("downloadBtn").addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        const response = await fetch(fileUrl);
        const blob = await response.blob();

        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = "${pageTitle}.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Download failed:", error);
        alert("Failed to download file.");
      }
    });
  </script>
</body>
</html>`;

      fs.writeFileSync(htmlPath, htmlContent);
      log(`Generated HTML page for ${pageTitle}`);
    }

    if (!existingUrls.includes(encodedFileUrl)) {
      sitemapEntries.push({
        loc: encodedFileUrl,
        lastmod: new Date().toISOString(),
      });
    }
    if (!existingUrls.includes(encodedHtmlUrl)) {
      sitemapEntries.push({
        loc: encodedHtmlUrl,
        lastmod: new Date().toISOString(),
      });
    }
  });

  const MAX_URLS = 40000;
  const sitemapDir = path.dirname(sitemapPath);
  let sitemapFiles = [];
  let chunkIndex = 1;

  const allUrls = [...existingUrls];
  sitemapEntries.forEach((entry) => {
    if (!allUrls.includes(entry.loc)) allUrls.push(entry.loc);
  });

  for (let i = 0; i < allUrls.length; i += MAX_URLS) {
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
    log(`${sitemapFileName} generated.`);
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
    "PDFs and Sitemap Generated",
    `${pdfFiles.length} PDFs processed. HTML pages and sitemap.xml generated successfully.`,
  );

  log("HTML Pages and sitemap.xml generation process completed.");
}

run();
