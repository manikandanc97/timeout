import Button from '@/components/ui/Button';
import { Download } from 'lucide-react';

type Props = {
  onExportCsv: () => void;
  onExportPdf: () => void;
};

export default function ReportsExportActions({ onExportCsv, onExportPdf }: Props) {
  return (
    <>
      <Button type='button' variant='outline' className='rounded-xl!' onClick={onExportCsv}>
        <span className='inline-flex items-center gap-1.5'>
          <Download size={14} />
          Export CSV
        </span>
      </Button>
      <Button type='button' variant='outline' className='rounded-xl!' onClick={onExportPdf}>
        Export PDF
      </Button>
    </>
  );
}
