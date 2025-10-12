export const initialTasks = [
{ name: "Fetch Data", status: "PENDING", dependencies: [] },
{ name: "Validate Data", status: "PENDING", dependencies: ["Fetch Data"] },
{ name: "Generate Report", status: "PENDING", dependencies: ["Validate Data"] },
];