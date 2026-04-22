import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generatePayslipPDF } from '../src/services/payroll/payslipService.js';

// Mock pdfkit
vi.mock('pdfkit', () => {
  const mockDoc = {
    on: vi.fn(),
    fontSize: vi.fn().mockReturnThis(),
    text: vi.fn().mockReturnThis(),
    moveDown: vi.fn().mockReturnThis(),
    moveTo: vi.fn().mockReturnThis(),
    lineTo: vi.fn().mockReturnThis(),
    stroke: vi.fn().mockReturnThis(),
    fillColor: vi.fn().mockReturnThis(),
    font: vi.fn().mockReturnThis(),
    rect: vi.fn().mockReturnThis(),
    fill: vi.fn().mockReturnThis(),
    end: vi.fn(),
    y: 100, // Mock y property
  };

  // Simulate 'end' event to resolve the promise in generatePayslipPDF
  mockDoc.end.mockImplementation(() => {
    if (mockDoc.on.mock.calls) {
      const endCall = mockDoc.on.mock.calls.find(call => call[0] === 'end');
      if (endCall && typeof endCall[1] === 'function') {
        endCall[1]();
      }
    }
  });

  return {
    default: vi.fn(() => mockDoc)
  };
});

describe('payslipService', () => {
  const mockPayroll = {
    month: 5,
    year: 2024,
    userId: 1,
    basicSalary: 50000,
    hra: 20000,
    allowance: 10000,
    pf: 6000,
    professionalTax: 200,
    lopAmount: 0,
    netSalary: 73800,
    user: {
      name: 'Bob',
      designation: 'Software Engineer',
      team: { department: { name: 'Engineering' } }
    }
  };

  const mockOrg = {
    name: 'Test Corp',
    officeAddress: '123 Test St',
    currency: 'INR'
  };

  it('should generate a PDF buffer for a given payroll', async () => {
    const pdfData = await generatePayslipPDF(mockPayroll, mockOrg);
    
    // Since we mocked 'end' to call the handler, and doc.on data handler is not called in mock,
    // Buffer.concat([]) will return an empty buffer.
    expect(pdfData).toBeDefined();
    
    // Verify pdfkit was used
    const PDFDocument = (await import('pdfkit')).default;
    const mockDoc = new PDFDocument();
    
    expect(mockDoc.text).toHaveBeenCalledWith(expect.stringContaining('Bob'), expect.anything(), expect.anything());
    expect(mockDoc.text).toHaveBeenCalledWith(expect.stringContaining('73,800.00'), expect.anything(), expect.anything());
  });
});
