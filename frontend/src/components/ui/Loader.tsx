import { LoaderCircle } from 'lucide-react';

const LoaderSpinner = () => {
  return (
    <div className='flex flex-col justify-center items-center gap-3 h-screen'>
      <LoaderCircle className='text-primary animate-spin' size={32} />
    </div>
  );
};

export default LoaderSpinner;
