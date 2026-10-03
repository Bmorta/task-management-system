function TaskFilter({ filter, onFilterChange, counts }) {
  const filters = [
    ["All", counts.total],
    ["Active", counts.active],
    ["Completed", counts.completed],
    ["Overdue", counts.overdue]
  ];
  return <div className="filters">{filters.map(([name,count]) => <button key={name} className={filter===name ? "active" : ""} onClick={() => onFilterChange(name)}>{name}<span>{count}</span></button>)}</div>;
}
export default TaskFilter;