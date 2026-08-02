import { jsPDF } from "jspdf";

export function downloadCertificatePdf(opts: {
  studentName: string;
  courseTitle: string;
  code: string;
  issuedAt: string;
}) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, w, h, "F");

  doc.setDrawColor(10, 37, 64);
  doc.setLineWidth(3);
  doc.rect(24, 24, w - 48, h - 48);

  doc.setTextColor(10, 37, 64);
  doc.setFontSize(18);
  doc.text("PCB Online", w / 2, 80, { align: "center" });

  doc.setTextColor(10, 22, 40);
  doc.setFontSize(28);
  doc.text("Certificate of Completion", w / 2, 140, { align: "center" });

  doc.setFontSize(14);
  doc.setTextColor(92, 107, 126);
  doc.text("This certifies that", w / 2, 190, { align: "center" });

  doc.setTextColor(10, 37, 64);
  doc.setFontSize(26);
  doc.text(opts.studentName, w / 2, 230, { align: "center" });

  doc.setTextColor(92, 107, 126);
  doc.setFontSize(14);
  doc.text("has successfully completed", w / 2, 270, { align: "center" });

  doc.setTextColor(10, 22, 40);
  doc.setFontSize(20);
  doc.text(opts.courseTitle, w / 2, 310, { align: "center" });

  doc.setFontSize(11);
  doc.setTextColor(92, 107, 126);
  doc.text(
    `Issued ${new Date(opts.issuedAt).toLocaleDateString()}  ·  ${opts.code}`,
    w / 2,
    h - 70,
    { align: "center" }
  );

  doc.save(`PCB-Certificate-${opts.code}.pdf`);
}
