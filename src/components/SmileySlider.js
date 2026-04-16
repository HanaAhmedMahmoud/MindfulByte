const SmileySlider = ({ mealRating, setMealRating }) => (
  <div className="moodSlider">
        <button onClick={() => setMealRating(1)} className={mealRating === 1 ? "active" : ""}>
            <img src={require('../assets/supersad.png')} alt="Super sad" />
        </button>
        <button onClick={() => setMealRating(2)} className={mealRating  === 2  ? "active" : ""} >
            <img src={require('../assets/sad.png')} alt="Sad" />
        </button>
        <button onClick={() => setMealRating(3)} className={mealRating === 3 ? "active" : ""} >
            <img src={require('../assets/mid.png')} alt="Mid" />
        </button>
        <button onClick={() => setMealRating(4)} className={mealRating === 4  ? "active" : ""}>
            <img src={require('../assets/happy.png')} alt="Happy" />
        </button>
        <button onClick={() => setMealRating(5)} className={mealRating === 5  ? "active" : ""}>
            <img src={require('../assets/superhappy.png')} alt="Super happy" />
        </button>
    </div>
);
export default SmileySlider;