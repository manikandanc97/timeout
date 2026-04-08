import type { Leave } from '@/types/leave';

type Props = {
  leaves: Leave[];
};

export default function MyLeavesList({ leaves }: Props) {
  return (
    <div className='space-y-4'>
      {leaves?.map((leave) => (
        <div key={leave.id} className='shadow-sm p-4 border rounded-xl'>
          <div className='flex justify-between items-start'>
            <div>
              <h3 className='font-semibold'>{leave.type}</h3>

              <p className='text-gray-500 text-sm'>
                {new Date(leave.fromDate).toLocaleDateString()} to{' '}
                {new Date(leave.toDate).toLocaleDateString()}
              </p>

              <p className='mt-1 text-sm'>{leave.reason}</p>

              <p className='mt-2 font-medium text-sm'>Status: {leave.status}</p>
            </div>

            {leave.status === 'PENDING' && (
              <div className='flex gap-2'>
                <button className='px-3 py-1 border rounded-md text-sm'>
                  Edit
                </button>

                <button className='px-3 py-1 border rounded-md text-red-500 text-sm'>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
