export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortable?: boolean;
  isAction?: boolean;
  width?: string;
  align?: "left" | "center" | "right"; // 👈 dodaj ovo
}
