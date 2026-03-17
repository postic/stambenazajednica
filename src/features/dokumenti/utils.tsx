import { ReactNode } from "react";
import { FaFilePdf, FaFileWord, FaFileExcel, FaFileAlt } from "react-icons/fa";

export const getFileIcon = (mime?: string): ReactNode => {
  if (!mime) return <FaFileAlt className="text-gray-400" />;
  if (mime.includes("pdf")) return <FaFilePdf className="text-red-500" />;
  if (mime.includes("word")) return <FaFileWord className="text-blue-500" />;
  if (mime.includes("excel")) return <FaFileExcel className="text-green-500" />;
  return <FaFileAlt className="text-gray-400" />;
};
