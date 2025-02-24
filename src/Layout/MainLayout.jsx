import { Outlet } from "react-router-dom";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MainLayout = () => {
    return (
        <div >
                <ToastContainer position="top-right" autoClose={3000} />
   
         <Outlet/>
        </div>
    );
};

export default MainLayout;