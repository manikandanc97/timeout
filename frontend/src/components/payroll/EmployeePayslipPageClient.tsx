'use client';

import PayslipPreviewModal from '@/components/payroll/PayslipPreviewModal';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import type { PayrollRow } from '@/types/payroll';
import { Download, Eye, ReceiptText } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const rupee = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export default function EmployeePayslipPageClient() {
  const { user } = useAuth();
  const [rows, setRows] = useState<PayrollRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePayslip, setActivePayslip] = useState<PayrollRow | null>(null);

  useEffect(() => {
    setLoading(true);
    void api
      .get<{ payslips: PayrollRow[] }>('/payroll/my-payslips')
      .then((res) => {
        setRows(Array.isArray(res.data?.payslips) ? res.data.payslips : []);
      })
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Failed to load payslips';
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  const monthLabel = (row: PayrollRow) =>
    new Date(row.year, row.month - 1, 1).toLocaleString('en-IN', { month: 'short', year: 'numeric' });

  const latestPaidMonth = useMemo(() => (rows.length > 0 ? monthLabel(rows[0]) : '—'), [rows]);

  const downloadPayslipPdf = (row: PayrollRow) => {
    const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
    if (!printWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups to download PDF.');
      return;
    }
    const hra = row.hra ?? 0;
    const bonus = row.bonus ?? 0;
    const pf = row.pf ?? 0;
    const tax = row.tax ?? 0;
    const professionalTax = row.professionalTax ?? 0;
    const lopDays = row.lopDays ?? 0;
    const lopAmount = row.lopAmount ?? 0;
    const grossSalary = row.basicSalary + hra + row.allowance + bonus;
    const totalDeductions = pf + tax + professionalTax + lopAmount;
    const month = monthLabel(row);
    const html = `
      <html><head><title>Payslip - ${row.employeeName}</title>
      <style>body{font-family:Arial,sans-serif;margin:24px;color:#111827}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #e5e7eb;padding:10px;text-align:left}th{background:#f9fafb}.net{font-weight:700}</style>
      </head><body>
      <h1>Payslip</h1>
      <p><strong>Employee:</strong> ${row.employeeName}</p>
      <p><strong>Month:</strong> ${month}</p>
      <p><strong>Status:</strong> Paid</p>
      <table>
      <tr><th>Basic</th><td>${rupee.format(row.basicSalary)}</td></tr>
      <tr><th>HRA</th><td>${rupee.format(hra)}</td></tr>
      <tr><th>Allowance</th><td>${rupee.format(row.allowance)}</td></tr>
      <tr><th>Bonus</th><td>${rupee.format(bonus)}</td></tr>
      <tr><th>Gross Salary</th><td>${rupee.format(grossSalary)}</td></tr>
      <tr><th>PF</th><td>${rupee.format(pf)}</td></tr>
      <tr><th>Tax</th><td>${rupee.format(tax)}</td></tr>
      <tr><th>Professional Tax</th><td>${rupee.format(professionalTax)}</td></tr>
      <tr><th>LOP Days</th><td>${lopDays}</td></tr>
      <tr><th>LOP Deduction</th><td>${rupee.format(lopAmount)}</td></tr>
      <tr><th>Total Deductions</th><td>${rupee.format(totalDeductions)}</td></tr>
      <tr><th>Net Salary</th><td class="net">${rupee.format(row.netSalary)}</td></tr>
      </table></body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <section className='rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5'>
      <div className='mb-4 flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-bold text-gray-900'>My Payslips</h2>
          <p className='text-sm text-gray-500'>Only paid payrolls are available for view/download.</p>
        </div>
        <div className='text-right text-xs text-gray-500'>
          <p>Latest paid: {latestPaidMonth}</p>
        </div>
      </div>

      <div className='overflow-x-auto rounded-xl border border-gray-100'>
        <table className='w-full min-w-[760px] border-collapse text-left text-sm'>
          <thead>
            <tr className='border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500'>
              <th className='px-4 py-3'>Month</th>
              <th className='px-4 py-3'>Gross</th>
              <th className='px-4 py-3'>Deductions</th>
              <th className='px-4 py-3'>Net Salary</th>
              <th className='px-4 py-3'>Paid Date</th>
              <th className='px-4 py-3 text-right'>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className='px-4 py-12 text-center text-sm text-gray-500'>
                  Loading payslips...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className='px-4 py-12 text-center text-sm text-gray-500'>
                  No paid payslips available yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className='border-b border-gray-50'>
                  <td className='px-4 py-2'>{monthLabel(row)}</td>
                  <td className='px-4 py-2'>
                    {rupee.format((row.basicSalary ?? 0) + (row.hra ?? 0) + (row.allowance ?? 0) + (row.bonus ?? 0))}
                  </td>
                  <td className='px-4 py-2'>{rupee.format(row.deductions ?? 0)}</td>
                  <td className='px-4 py-2 font-semibold'>{rupee.format(row.netSalary ?? 0)}</td>
                  <td className='px-4 py-2'>
                    {row.paidDate ? new Date(row.paidDate).toLocaleDateString('en-GB') : '—'}
                  </td>
                  <td className='px-4 py-2'>
                    <div className='flex justify-end gap-2'>
                      <Button type='button' variant='outline' onClick={() => setActivePayslip(row)}>
                        <span className='flex items-center gap-1'><Eye size={14} />View</span>
                      </Button>
                      <Button type='button' variant='outline' onClick={() => downloadPayslipPdf(row)}>
                        <span className='flex items-center gap-1'><Download size={14} />Download</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {activePayslip ? (
        <PayslipPreviewModal
          row={activePayslip}
          monthLabel={monthLabel(activePayslip)}
          onClose={() => setActivePayslip(null)}
          onDownload={downloadPayslipPdf}
        />
      ) : null}
    </section>
  );
}
