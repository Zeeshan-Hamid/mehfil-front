'use client';

const Loading = () => {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="container mx-auto p-5">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden p-8">
            <div className="animate-pulse flex flex-col md:flex-row items-start">
              <div className="md:w-1/3 text-center">
                <div className="w-32 h-32 rounded-full mx-auto bg-gray-300 mb-4"></div>
                <div className="h-8 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-6 bg-gray-300 rounded w-1/2 mx-auto"></div>
              </div>
              <div className="md:w-2/3 md:pl-8 mt-6 md:mt-0 w-full">
                <div className="h-8 bg-gray-300 rounded w-1/2 mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-6 bg-gray-300 rounded w-full"></div>
                  <div className="h-6 bg-gray-300 rounded w-full"></div>
                  <div className="h-6 bg-gray-300 rounded w-full col-span-2"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-full mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-8 w-20 bg-gray-300 rounded"></div>
                  <div className="h-6 w-24 bg-gray-300 rounded"></div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-full mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-8 w-20 bg-gray-300 rounded"></div>
                  <div className="h-6 w-24 bg-gray-300 rounded"></div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-full mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-8 w-20 bg-gray-300 rounded"></div>
                  <div className="h-6 w-24 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default Loading;
  