import {Navigate} from "react-router-dom";

const PrivateRoute = ({component: Component}) => {
    const isAuthenticated = localStorage.getItem('token') !== null
    if (isAuthenticated)

        return isAuthenticated && <Component/>
    else
        return <Navigate to={'/login'} replace={true}/>

}

export default PrivateRoute