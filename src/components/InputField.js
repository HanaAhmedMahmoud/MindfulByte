
const InputField = ({ label, type = "text", value, onChange }) => (
  <div className="input-group">
    <h2>{label}</h2>
    <input 
      type={type} 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
    />
  </div>
);

export default InputField;