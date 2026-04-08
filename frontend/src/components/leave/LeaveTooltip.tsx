type Props = {
  visible: boolean;
  text: string;
  x: number;
  y: number;
};

const LeaveTooltip = ({ visible, text, x, y }: Props) => {
  if (!visible) return null;

  return (
    <div
      className='z-50 absolute bg-gray-900 px-2.5 py-1.5 rounded-md text-white text-xs pointer-events-none shadow-lg'
      style={{
        left: x,
        top: y,
      }}
    >
      {text}
    </div>
  );
};

export default LeaveTooltip;
