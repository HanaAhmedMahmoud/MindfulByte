const DropdownField = ({ label, value, onChange, options }) => (
  <div className="input-group">
    <h2>{label}</h2>
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);
export default DropdownField;