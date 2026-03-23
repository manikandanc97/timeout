import React from "react";

const Card = ({ title, value }: { title: string; value: number }) => {
  return (
    <div>
      <div className="bg-white shadow p-4 rounded-xl">
        <h2 className="text-gray-500 text-sm">{title}</h2>
        <p className="mt-1 font-bold text-2xl">{value}</p>
      </div>
    </div>
  );
};

export default Card;
