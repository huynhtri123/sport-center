import { Navigate } from 'react-router-dom';
import { handleLocalStorage } from '../utils/handleLocalStorage';

function ProtectedRoute({ children, requiredRole }) {
    const role = handleLocalStorage.getCurrentRole();
    // nếu là requiredRole (ADMIN) mới cho vào, không thì chuyển về trang home
    if (role.trim() !== requiredRole.trim()) {
        return <Navigate to={'/'} replace />;
    }

    return children;
}

export default ProtectedRoute;
