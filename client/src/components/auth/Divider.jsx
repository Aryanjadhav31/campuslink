import React from 'react';

const Divider = ({ text = 'OR' }) => {
  return (
    <div className="relative my-6 flex items-center justify-center w-full">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-[#262626]" />
      </div>
      <div className="relative px-3 bg-[#0a0a0a] text-[12px] font-semibold tracking-wider text-zinc-500 uppercase">
        {text}
      </div>
    </div>
  );
};

export default Divider;

