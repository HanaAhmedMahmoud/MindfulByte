const AnalyticsItem = ({ label, icon, data }) => (
  <div className="analyticsItem">
    <h4>{label}</h4>
    <div className="analyticsItemIconRow">
        <img src={icon} alt="Profile icon" className="icons"/>
        <p>{data}</p>
    </div> 
</div>
);
export default AnalyticsItem;