export function getAuthHeader() {
  if (typeof window === "undefined") return "";

  const token = localStorage.getItem("token");

  return token ? `Bearer ${token}` : "";
}
