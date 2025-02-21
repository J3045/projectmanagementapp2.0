// import { useIsFetching } from "@tanstack/react-query";
// import { FaSpinner } from "react-icons/fa";

// export const GlobalLoader = () => {
//   const isFetching = useIsFetching();

//   if (!isFetching) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//       <div className="flex items-center gap-2 p-4 bg-white rounded-lg shadow-lg">
//         <FaSpinner className="animate-spin text-indigo-600" size={24} />
//         <span className="text-gray-800">Loading...</span>
//       </div>
//     </div>
//   );
// };