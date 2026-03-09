const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const r2 = new S3Client({
  region: "auto",
  endpoint: "https://12460cf19b8e36e1616b6d950df74b06.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: "a1c9d8b9653c37166723b2a309d519b2",
    secretAccessKey:
      "f7f7005148ec98e47511c3ee7fd98fa8765b30b2f1f7315e296a569616b1081d",
  },
});

exports.uploadPDFToR2 = async (buffer, filename) => {
  await r2.send(
    new PutObjectCommand({
      Bucket: "revise-pdfs",
      Key: filename,
      Body: buffer,
      ContentType: "application/pdf",
    }),
  );

  return `${"https://cdn.revise.co.ke"}/${filename}`;
};
