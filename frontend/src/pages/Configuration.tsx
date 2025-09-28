"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  Calendar, 
  Users, 
  Settings, 
  LogOut, 
  UserCheck,
  Sun,
  Moon,
  Loader2,
  AlertCircle,
  Save,
  Lock,
  User,
  CheckCircle,
  Eye,
  EyeOff,
  Shield,
  Clock
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { validatePassword, validateConfirmPassword } from '../utils/validations';
import PasswordStrength from '../components/forms/PasswordStrength';

const Configuration: React.FC = () => {
    const navigate = useNavigate();
    const { toggleTheme, isDark } = useTheme();
    const { checkAuth, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    const role = localStorage.getItem('role');
    const firstName = localStorage.getItem('firstName');

    // Estados para gestión de perfil
    const [profileData, setProfileData] = useState({
        first_name: '',
        last_name: '',
        email: ''
    });

    // Estados para cambio de contraseña
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Estados para mostrar/ocultar contraseñas
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    // Estados para validación en tiempo real
    const [passwordValidation, setPasswordValidation] = useState({
        currentPasswordValid: true,
        passwordsMatch: true,
        newPasswordValid: true
    });

    // Estado para el modal de éxito
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [countdown, setCountdown] = useState(5);


    // Verificar autenticación al cargar
    useEffect(() => {
        if (!checkAuth()) {
            return;
        }
        loadProfileData();
    }, [checkAuth]);

    const loadProfileData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/organizer/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setProfileData({
                    first_name: data.data.first_name || '',
                    last_name: data.data.last_name || '',
                    email: data.data.email || ''
                });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };


    const handleLogout = () => {
        logout();
    };

    const handleNavigateToEvents = () => {
        navigate('/events-management');
    };

    const handleNavigateToRegistrations = () => {
        navigate('/registrations-management');
    };

    const handleNavigateToDashboard = () => {
        navigate('/dashboard');
    };

    const menuItems = [
        { icon: Home, label: 'Dashboard', active: false, onClick: handleNavigateToDashboard },
        { icon: Calendar, label: 'Eventos', active: false, onClick: handleNavigateToEvents },
        { icon: Users, label: 'Inscripciones', active: false, onClick: handleNavigateToRegistrations },
        { icon: Settings, label: 'Configuración', active: true, onClick: () => {} },
    ];

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/organizer/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profileData)
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Perfil actualizado exitosamente');
                // Actualizar localStorage con nuevos datos
                localStorage.setItem('firstName', profileData.first_name);
                localStorage.setItem('lastName', profileData.last_name);
                localStorage.setItem('email', profileData.email);
            } else {
                setError(data.message || 'Error al actualizar perfil');
            }
        } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/organizer/change-password', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setShowSuccessModal(true);
                setCountdown(5);
                
                // Iniciar countdown
                const countdownInterval = setInterval(() => {
                    setCountdown(prev => {
                        if (prev <= 1) {
                            clearInterval(countdownInterval);
                            logout();
                            navigate('/login');
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } else {
                setError(data.message || 'Error al cambiar contraseña');
            }
        } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    // Validación en tiempo real
    const validatePasswords = useCallback(() => {
        // Validar nueva contraseña con criterios robustos
        const passwordValidation = validatePassword(passwordData.newPassword);
        const confirmPasswordValidation = validateConfirmPassword(passwordData.newPassword, passwordData.confirmPassword);
        
        setPasswordValidation({
            currentPasswordValid: true, // Se validará en el backend
            passwordsMatch: confirmPasswordValidation.isValid,
            newPasswordValid: passwordValidation.isValid
        });
    }, [passwordData.newPassword, passwordData.confirmPassword]);

    // Efecto para validación en tiempo real
    useEffect(() => {
        validatePasswords();
    }, [passwordData.newPassword, passwordData.confirmPassword, validatePasswords]);

    return (
        <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-white">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-white dark:text-black" />
                        </div>
                        <span className="ml-3 text-xl font-bold text-black dark:text-white">EventConnect</span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 rounded-md text-gray-400 hover:text-black dark:hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="mt-8 px-4">
                    <ul className="space-y-2">
                        {menuItems.map((item, index) => (
                            <li key={index}>
                                <button
                                    onClick={item.onClick}
                                    className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                                        item.active
                                            ? 'bg-black dark:bg-white text-white dark:text-black'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white'
                                    }`}
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-white">
                    <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <UserCheck className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-semibold text-black dark:text-white">{firstName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Cerrar Sesión
                    </button>
                </div>
            </div>

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="lg:ml-64">
                {/* Header */}
                <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-white">
                    <div className="flex items-center justify-between h-16 px-6">
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-black dark:hover:text-white"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <h1 className="ml-4 text-2xl font-bold text-black dark:text-white">Configuración</h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-3 rounded-full bg-white dark:bg-black border-2 border-gray-200 dark:border-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
                                aria-label="Cambiar tema"
                            >
                                {isDark ? <Sun className="h-6 w-6 text-yellow-500" /> : <Moon className="h-6 w-6 text-black" />}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="p-4">
                    {/* Welcome Section */}
                    <div className="mb-4">
                        <h2 className="text-2xl font-bold text-black dark:text-white mb-1">
                            Configuración de Cuenta
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Gestiona tu perfil y configura tus preferencias como organizador.
                        </p>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <div className="flex items-center">
                                <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                                <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="flex items-center">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                <p className="text-green-700 dark:text-green-400 text-sm">{success}</p>
                            </div>
                        </div>
                    )}

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Información del Usuario */}
                        <div className="bg-white dark:bg-black border-2 border-gray-200 dark:border-white rounded-xl p-4 shadow-lg">
                            <div className="flex items-center mb-4">
                                <User className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                                <h3 className="text-lg font-bold text-black dark:text-white">Información del Usuario</h3>
                            </div>
                            
                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Nombre
                                        </label>
                                        <input
                                            type="text"
                                            value={profileData.first_name}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-200 dark:border-white rounded-lg bg-gray-50 dark:bg-white text-black dark:text-black focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Apellido
                                        </label>
                                        <input
                                            type="text"
                                            value={profileData.last_name}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-200 dark:border-white rounded-lg bg-gray-50 dark:bg-white text-black dark:text-black focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-200 dark:border-white rounded-lg bg-gray-50 dark:bg-white text-black dark:text-black focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </form>
                        </div>

                        {/* Right Column - Seguridad */}
                        <div className="bg-white dark:bg-black border-2 border-gray-200 dark:border-white rounded-xl p-4 shadow-lg">
                            <div className="flex items-center mb-4">
                                <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                                <h3 className="text-lg font-bold text-black dark:text-white">Seguridad</h3>
                            </div>
                            
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Contraseña Actual
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.current ? "text" : "password"}
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                            className="w-full px-3 py-2 pr-10 border border-gray-200 dark:border-white rounded-lg bg-gray-50 dark:bg-white text-black dark:text-black focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('current')}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Nueva Contraseña
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.new ? "text" : "password"}
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                            className={`w-full px-3 py-2 pr-10 border rounded-lg bg-gray-50 dark:bg-white text-black dark:text-black focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                                passwordData.newPassword && !passwordValidation.newPasswordValid 
                                                    ? 'border-red-300 dark:border-red-600' 
                                                    : 'border-gray-200 dark:border-white'
                                            }`}
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('new')}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
            {passwordData.newPassword && !passwordValidation.newPasswordValid && (
                <p className="text-red-500 text-xs mt-1">
                    {validatePassword(passwordData.newPassword).message}
                </p>
            )}
            {passwordData.newPassword && (
                <PasswordStrength password={passwordData.newPassword} />
            )}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Confirmar Nueva Contraseña
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.confirm ? "text" : "password"}
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            className={`w-full px-3 py-2 pr-10 border rounded-lg bg-gray-50 dark:bg-white text-black dark:text-black focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                                passwordData.confirmPassword && !passwordValidation.passwordsMatch 
                                                    ? 'border-red-300 dark:border-red-600' 
                                                    : passwordData.confirmPassword && passwordValidation.passwordsMatch
                                                    ? 'border-green-300 dark:border-green-600'
                                                    : 'border-gray-200 dark:border-white'
                                            }`}
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('confirm')}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
            {passwordData.confirmPassword && !passwordValidation.passwordsMatch && (
                <p className="text-red-500 text-xs mt-1">
                    {validateConfirmPassword(passwordData.newPassword, passwordData.confirmPassword).message}
                </p>
            )}
            {passwordData.confirmPassword && passwordValidation.passwordsMatch && (
                <p className="text-green-500 text-xs mt-1">✓ Las contraseñas coinciden</p>
            )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !passwordValidation.newPasswordValid || !passwordValidation.passwordsMatch || !passwordData.currentPassword}
                                    className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
                                    {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                                </button>
                            </form>
                        </div>
                    </div>
                </main>
            </div>

            {/* Modal de Éxito */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 shadow-2xl transform transition-all duration-300 scale-100">
                        <div className="text-center">
                            {/* Icono de éxito */}
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                                <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            
                            {/* Título */}
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                ¡Contraseña Actualizada!
                            </h3>
                            
                            {/* Mensaje */}
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Tu contraseña ha sido cambiada exitosamente. Por seguridad, serás redirigido al login.
                            </p>
                            
                            {/* Countdown */}
                            <div className="flex items-center justify-center space-x-2 mb-6">
                                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                <span className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                                    Redirigiendo en {countdown} segundos...
                                </span>
                            </div>
                            
                            {/* Barra de progreso */}
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                                <div 
                                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-1000 ease-linear"
                                    style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                                ></div>
                            </div>
                            
                            {/* Botón de cerrar */}
                            <button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    logout();
                                    navigate('/login');
                                }}
                                className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
                            >
                                Ir al Login Ahora
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Configuration;
