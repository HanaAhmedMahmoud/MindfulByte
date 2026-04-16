import logo from '../assets/logo.png'
import { useNavigate } from 'react-router-dom'

export function NavBar () {
   const navigate = useNavigate();
   return(
        <div className="navBar">
            <img src={logo} alt="Logo" className="Logo"/>
            <button onClick={() => navigate('/')}>
                Log out
            </button>
        </div>
   );
}
export default NavBar;