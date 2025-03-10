export interface Staff {
  id: string;
  name: string;
  position: string;
}

export const STAFF_LIST: Staff[] = [
  { id: "001", name: "John Doe", position: "Manager" },
  { id: "002", name: "Jane Smith", position: "Developer" },
  { id: "003", name: "Mike Johnson", position: "Designer" },
];
