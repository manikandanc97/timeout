import PDFDocument from 'pdfkit';
import { logger } from '../loggerService.js';

/**
 * Payslip PDF Generator Service
 */
export const generatePayslipPDF = async (payroll, organization) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // --- Header ---
      doc
        .fontSize(20)
        .text(organization.name.toUpperCase(), { align: 'center' })
        .fontSize(10)
        .text(organization.officeAddress || '', { align: 'center' })
        .moveDown();

      doc
        .fontSize(14)
        .fillColor('#444444')
        .text(`PAYSLIP FOR ${getMonthName(payroll.month).toUpperCase()} ${payroll.year}`, { align: 'center' })
        .moveDown();

      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown();

      // --- Employee Details ---
      const startY = doc.y;
      doc
        .fontSize(10)
        .fillColor('#000000')
        .text('Employee Name:', 50, startY)
        .font('Helvetica-Bold')
        .text(payroll.user.name, 150, startY)
        .font('Helvetica')
        .text('Employee ID:', 300, startY)
        .text(`#${payroll.userId}`, 400, startY)
        .moveDown(0.5);

      const nextY = doc.y;
      doc
        .text('Designation:', 50, nextY)
        .text(payroll.user.designation || 'N/A', 150, nextY)
        .text('Department:', 300, nextY)
        .text(payroll.user.team?.department?.name || 'N/A', 400, nextY)
        .moveDown(2);

      // --- Earnings & Deductions Table ---
      const tableTop = doc.y;
      doc.font('Helvetica-Bold');
      generateTableRow(doc, tableTop, 'EARNINGS', 'AMOUNT', 'DEDUCTIONS', 'AMOUNT');
      doc.font('Helvetica');
      doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke();

      let currentY = tableTop + 25;
      
      const earnings = [
        ['Basic Salary', payroll.basicSalary],
        ['HRA', payroll.hra],
        ['Allowances', payroll.allowance],
        ['Special Allowance', payroll.specialAllowance || 0],
        ['Bonus', payroll.bonus],
        ['Incentives', payroll.incentives || 0],
        ['Overtime', payroll.overtimeAmount || 0],
      ];

      const deductions = [
        ['Provident Fund (PF)', payroll.pf],
        ['ESI', payroll.esi || 0],
        ['Professional Tax', payroll.professionalTax],
        ['Income Tax (TDS)', payroll.tds || 0],
        ['Loss of Pay (LOP)', payroll.lopAmount],
      ];

      const maxRows = Math.max(earnings.length, deductions.length);
      for (let i = 0; i < maxRows; i++) {
        const e = earnings[i] || ['', ''];
        const d = deductions[i] || ['', ''];
        generateTableRow(
          doc, 
          currentY, 
          e[0], 
          e[1] ? formatCurrency(e[1]) : '', 
          d[0], 
          d[1] ? formatCurrency(d[1]) : ''
        );
        currentY += 20;
      }

      doc.moveTo(50, currentY).lineTo(545, currentY).stroke();
      currentY += 10;

      // --- Totals ---
      doc.font('Helvetica-Bold');
      const totalEarnings = payroll.basicSalary + payroll.hra + payroll.allowance + (payroll.specialAllowance || 0) + payroll.bonus + (payroll.incentives || 0) + (payroll.overtimeAmount || 0);
      const totalDeductions = payroll.pf + (payroll.esi || 0) + payroll.professionalTax + (payroll.tds || 0) + payroll.lopAmount;
      
      generateTableRow(doc, currentY, 'TOTAL EARNINGS', formatCurrency(totalEarnings), 'TOTAL DEDUCTIONS', formatCurrency(totalDeductions));
      doc.font('Helvetica');
      currentY += 30;

      // --- Net Salary ---
      doc
        .rect(50, currentY, 495, 40)
        .fill('#f9f9f9')
        .stroke()
        .fillColor('#000000')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('NET SALARY:', 70, currentY + 15)
        .fontSize(14)
        .text(`${organization.currency || 'INR'} ${formatCurrency(payroll.netSalary)}`, 160, currentY + 14)
        .fontSize(10)
        .font('Helvetica')
        .text('(Rupees ' + numberToWords(payroll.netSalary) + ' only)', 300, currentY + 16, { width: 230 });

      // --- Footer ---
      doc
        .fontSize(8)
        .fillColor('#888888')
        .text('This is a computer-generated document and does not require a physical signature.', 50, 750, { align: 'center' });

      doc.end();
    } catch (err) {
      logger.error('[PayslipPDF] Generation failed', err);
      reject(err);
    }
  });
};

function generateTableRow(doc, y, c1, c2, c3, c4) {
  doc
    .fontSize(10)
    .text(c1, 50, y)
    .text(c2, 200, y, { width: 70, align: 'right' })
    .text(c3, 300, y)
    .text(c4, 475, y, { width: 70, align: 'right' });
}

function formatCurrency(num) {
  return Number(num).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getMonthName(m) {
  return new Date(2000, m - 1).toLocaleString('default', { month: 'long' });
}

// Simple number to words converter (partial)
function numberToWords(num) {
  // Simplistic placeholder for now; could use a library if needed
  return num.toLocaleString('en-IN');
}
