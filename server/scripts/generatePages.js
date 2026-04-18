const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");

const codeArg = process.argv[2];
const unitArg = process.argv[3];

const logoPath = path.join(__dirname, "..", "assets", "logo.png");
const logoBase64 = fs.readFileSync(logoPath).toString("base64");
const logoDataUrl = `data:image/png;base64,${logoBase64}`;

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

    const cleanName = fileName
      .replace(/^\d+\s*/, "")
      .replace(/[-_]/g, " ")
      .toUpperCase();

    const isTargetFile =
      unitArg && cleanName.toLowerCase().includes(unitArg.toLowerCase());

    const pageTitle = isTargetFile ? unitArg.toUpperCase() : cleanName;

    const fullTitle =
      isTargetFile && codeArg ? `${codeArg} ${pageTitle}` : pageTitle;

    const slug = fileName
      .toLowerCase()
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
  <title>Revise | Free Download ${fullTitle} Exam Paper PDF Kenya</title>
  <meta name="description" content="Revise | Free Download ${fullTitle} Exam Paper PDF Kenya" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="canonical" href="${encodedHtmlUrl}">
  
  <style>
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
      "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
      sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .home {
      width: 95%;
      margin: auto;
    }

    .home .header {
      background-color: #9d2e34;
      color: white;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    .home .header h2 {
      margin: 10px auto 10px 10px;
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    .home .header h2 img {
      height: 50px;
      width: 50px;
      border-radius: 50%;
    }

    .home .header .headright {
      display: flex;
    }

    .home .header .headright .addexam {
      color: white;
      cursor: pointer;
      margin-right: 20px;
    }

    .content {
      margin-top: 90px;
      padding: 10px;
      line-height: 1.6;
    }

    .content h1 {
      color: #9d2e34;
    }

    .download-btn {
      display: inline-block;
      padding: 12px 24px;
      background: #9d2e34;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin-top: 1rem;
    }

    /* MOBILE */

    @media only screen and (max-width: 768px) {

      .home .header h2 {
        font-size: 20px;
      }

    }

    /* DESKTOP */

    @media only screen and (min-width: 768px) {

      .home {
        width: 60%;
        margin: 5rem auto;
      }

      .home .header h2 {
        margin: 10px auto 10px 20%;
      }

      .home .header .headright {
        margin-right: 20%;
      }

    }
  </style>
</head>

<body>
  <div class="home">
    <div class="header">
      <h2 onclick="location.href='https://revise.co.ke'">
        <img src="${logoDataUrl}" alt="Revise"/>
        Revise
      </h2>

      <div class="headright">
        <div class="addexam" onclick="handleAddExam()">
          Add exam
        </div>
      </div>
    </div>

    <div class="content">
      <h1>${fullTitle} Exam Paper PDF</h1>

      <p>Download free ${fullTitle} past exam paper in PDF format. Students preparing for exams can revise using real past exam questions from Kenyan universities and colleges.</p>
      
      <p> Practicing past papers helps you understand exam patterns, improve time management and boost confidence before your exams.</p>

      <a href="#" class="download-btn" id="downloadBtn">Download PDF</a>
    </div>
  </div>

  <script>
    const fileUrl = "${encodedFileUrl}";
    const fileName = "${fullTitle}".trim() + ".pdf";

    document.getElementById("downloadBtn").addEventListener("click", async (e) => {
      e.preventDefault();

      try {
        const response = await fetch(fileUrl, { mode: 'cors' });
        if (!response.ok) throw new Error("Network failed.");

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(blobUrl);

      } catch (error) {
        console.error("Download failed:", error);
        alert("Failed to download file.");
      }
    });

    function handleAddExam() {
      const userInfo = JSON.parse(localStorage.getItem("JSUD"));

      if (!userInfo) {
        window.location.href = "https://revise.co.ke/login";
        return;
      }

      window.location.href = "https://revise.co.ke/add-exam";
    }
  </script>
  </body>
  </html>`;

      fs.writeFileSync(htmlPath, htmlContent);
      log(`Generated HTML page for ${fullTitle}.`);
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

  const allUrls = existingUrls.filter((url) => !url.includes("sitemap"));
  sitemapEntries.forEach((entry) => {
    if (!allUrls.includes(entry.loc)) allUrls.push(entry.loc);
  });

  for (let i = 0; i < allUrls.length; i += MAX_URLS) {
    const chunk = allUrls.slice(i, i + MAX_URLS).map((url) => ({
      loc: url,
      lastmod: new Date().toISOString(),
    }));

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
