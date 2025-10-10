import React from "react";

function Shorts() {
  // console.log(user.data._id);
  return (
    <div className="lg:mt-8 bg-white grid grid-cols-1 px-8 pt-6 xl:grid-cols-3 xl:gap-4">
      <div className="mb-4 col-span-full xl:mb-2">
        {/*-------------------content---------------------*/}
        <div className="text-lg mb-8 ">
          <h1 className="text-4xl font-semibold mb-4">Shorts</h1>
        </div>
        {/*-------------------content---------------------*/}
      </div>
    </div>
  );
}

export default Shorts;
