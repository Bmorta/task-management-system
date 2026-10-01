function TaskFilter({ filter, onFilterChange }) {
  const filters = ["All", "Active", "Completed"];
  return (
    <div className="filter-bar">
      {filters.map(item => (
        <button type="button" key={item} className={filter === item ? "active" : ""}
          onClick={() => onFilterChange(item)}>{item}</button>
      ))}
    </div>
  );
}
export default TaskFilter;