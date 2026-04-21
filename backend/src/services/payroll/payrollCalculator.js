/**
 * Payroll Calculator Service
 * Standardized calculation logic for enterprise-grade payroll.
 */

export const calculatePayroll = (salaryStructure, data = {}) => {
  const {
    incentives = 0,
    overtimeHours = 0,
    reimbursements = 0,
    settlementAmount = 0,
    lopDays = 0,
    workingDays = 30, // Default to 30 days
  } = data;

  // 1. Gross Earnings Components
  const basic = Number(salaryStructure.basicSalary || 0);
  const hra = Number(salaryStructure.hra || 0);
  const conveyance = Number(salaryStructure.conveyance || 0);
  const specialAllowance = Number(salaryStructure.specialAllowance || 0);
  const allowance = Number(salaryStructure.allowance || 0);
  const bonus = Number(salaryStructure.bonus || 0);
  
  const grossEarnings = basic + hra + conveyance + specialAllowance + allowance + bonus + Number(incentives);

  // 2. Overtime Calculation
  const overtimeRate = Number(salaryStructure.overtimeRate || 0);
  const overtimeAmount = overtimeHours * overtimeRate;

  // 3. Deductions (Statutory)
  const pf = (Number(salaryStructure.pfRate || 12) / 100) * basic;
  const esi = (Number(salaryStructure.esiRate || 0.75) / 100) * grossEarnings;
  const professionalTax = Number(salaryStructure.professionalTax || 0);
  const tds = Number(data.tds || salaryStructure.tds || 0);

  // 4. LOP (Loss of Pay) Calculation
  // LOP is usually calculated on (Gross - PF - ESI) or just Gross.
  // We'll calculate it based on Total Monthly Fixed Pay (Gross without one-time bonus/incentives).
  const monthlyFixedPay = basic + hra + conveyance + specialAllowance + allowance;
  const dailyRate = workingDays > 0 ? monthlyFixedPay / workingDays : 0;
  const lopAmount = lopDays * dailyRate;

  // 5. Net Salary Calculation
  // Net = (Gross + OT + Settl.) - (PF + ESI + PT + TDS + LOP) + Reimbursements
  // Note: Reimbursements are usually non-taxable and added after all deductions.
  const totalDeductions = pf + esi + professionalTax + tds + lopAmount;
  const netBeforeReimbursement = (grossEarnings + overtimeAmount + Number(settlementAmount)) - totalDeductions;
  const netSalary = Math.max(netBeforeReimbursement, 0) + Number(reimbursements);

  return {
    components: {
      basic,
      hra,
      conveyance,
      specialAllowance,
      allowance,
      bonus,
      incentives: Number(incentives),
      grossEarnings: round2(grossEarnings),
    },
    deductions: {
      pf: round2(pf),
      esi: round2(esi),
      professionalTax: round2(professionalTax),
      tds: round2(tds),
      lopAmount: round2(lopAmount),
      totalDeductions: round2(totalDeductions),
    },
    overtime: {
      hours: overtimeHours,
      rate: overtimeRate,
      amount: round2(overtimeAmount),
    },
    reimbursements: Number(reimbursements),
    settlementAmount: Number(settlementAmount),
    netSalary: round2(netSalary),
    lopDays,
  };
};

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
