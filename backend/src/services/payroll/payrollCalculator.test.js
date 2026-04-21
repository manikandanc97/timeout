import { describe, it, expect } from 'vitest';
import { calculatePayroll } from './payrollCalculator.js';

describe('Payroll Calculator', () => {
  const mockSalaryStructure = {
    basicSalary: 50000,
    hra: 20000,
    conveyance: 5000,
    specialAllowance: 10000,
    allowance: 5000,
    bonus: 2000,
    pfRate: 12,
    esiRate: 0.75,
    professionalTax: 200,
    overtimeRate: 500,
  };

  it('should calculate accurate gross and net salary with no deductions', () => {
    const result = calculatePayroll(mockSalaryStructure, { workingDays: 30 });
    
    // Gross = 50k+20k+5k+10k+5k+2k = 92000
    expect(result.components.grossEarnings).toBe(92000);
    
    // PF = 12% of 50k = 6000
    // ESI = 0.75% of 92k = 690
    // PT = 200
    // Total Deductions = 6000 + 690 + 200 = 6890
    expect(result.deductions.pf).toBe(6000);
    expect(result.deductions.esi).toBe(690);
    expect(result.deductions.totalDeductions).toBe(6890);
    
    // Net = 92000 - 6890 = 85110
    expect(result.netSalary).toBe(85110);
  });

  it('should calculate LOP correctly', () => {
    // 3 days LOP
    const result = calculatePayroll(mockSalaryStructure, { lopDays: 3, workingDays: 30 });
    
    // Fixed Pay = 50+20+5+10+5 = 90000
    // Daily Rate = 90000 / 30 = 3000
    // LOP Amount = 3 * 3000 = 9000
    expect(result.deductions.lopAmount).toBe(9000);
    
    // Net = (92000 - 6890) - 9000 = 76110
    expect(result.netSalary).toBe(76110);
  });

  it('should handle overtime', () => {
    const result = calculatePayroll(mockSalaryStructure, { overtimeHours: 10, workingDays: 30 });
    
    // OT = 10 * 500 = 5000
    expect(result.overtime.amount).toBe(5000);
    
    // Net = (92000 - 6890) + 5000 = 90110
    expect(result.netSalary).toBe(90110);
  });

  it('should handle reimbursements correctly (non-taxable)', () => {
    const result = calculatePayroll(mockSalaryStructure, { reimbursements: 1500, workingDays: 30 });
    
    // Net = (92000 - 6890) + 1500 = 86610
    expect(result.netSalary).toBe(86610);
  });
});
