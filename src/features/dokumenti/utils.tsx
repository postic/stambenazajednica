import { FaFilePdf, FaFileWord, FaFileExcel, FaFileAlt } from "react-icons/fa";
import { ReactNode } from "react";

export const getFileIcon = (mime?: string): ReactNode => {
  // ako je undefined ili prazan string, vrati default ikonu
  if (!mime) return <FaFileAlt className="text-gray-500" />;

  if (mime.includes("pdf")) return <FaFilePdf className="text-red-500" />;
  if (mime.includes("word")) return <FaFileWord className="text-blue-500" />;
  if (mime.includes("excel")) return <FaFileExcel className="text-green-500" />;

  return <FaFileAlt className="text-gray-500" />;
};
