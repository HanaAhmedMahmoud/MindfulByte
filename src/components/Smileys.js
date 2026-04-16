const Smileys = ({rating}) => (
  <div className="moodSlider">
        <div className={`mood-wrapper ${rating === 1 ? "active" : ""}`}>
            <img src={require('../assets/supersad.png')} alt="Super sad" />
        </div>
        <div className={`mood-wrapper ${rating === 2? "active" : ""}`}>
            <img src={require('../assets/sad.png')} alt="Sad" />
        </div>
        <div className={`mood-wrapper ${rating === 3 ? "active" : ""}`}>
            <img src={require('../assets/mid.png')} alt="Mid" />
        </div>
        <div className={`mood-wrapper ${rating === 4 ? "active" : ""}`}>
            <img src={require('../assets/happy.png')} alt="Happy" />
        </div>
        <div className={`mood-wrapper ${rating === 5 ? "active" : ""}`}>
            <img src={require('../assets/superhappy.png')} alt="Super happy" />
        </div>
   </div>
);
export default Smileys;