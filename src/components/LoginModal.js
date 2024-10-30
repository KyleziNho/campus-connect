'use client'
import React, { useState } from 'react';
import { Mail, Lock, X, AlertCircle, CheckCircle } from 'lucide-react';
import { auth } from '@/config/firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);

  const isStudentEmail = (email) => {
    const validDomains = [
      'bath.ac.uk',
      'bristol.ac.uk',
      'exeter.ac.uk',
      'cardiff.ac.uk'
    ];
    
    const emailDomain = email.toLowerCase().split('@')[1];
    return validDomains.some(domain => emailDomain === domain);
  };

  const handleError = (error) => {
    console.error('Authentication error:', error);
    switch (error.code) {
      case 'auth/email-already-in-use':
        setError('An account with this email already exists. Please sign in.');
        setIsSignUp(false);
        break;
      case 'auth/weak-password':
        setError('Password should be at least 6 characters');
        break;
      case 'auth/invalid-email':
        setError('Invalid email address');
        break;
      case 'auth/user-not-found':
        setError('No account found with this email');
        break;
      case 'auth/wrong-password':
        setError('Incorrect password');
        break;
      case 'auth/too-many-requests':
        setError('Too many attempts. Please try again later.');
        break;
      case 'auth/network-request-failed':
        setError('Network error. Please check your connection.');
        break;
      default:
        setError('An error occurred. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (!email || !password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      if (!isStudentEmail(email)) {
        setError('Please use your university email address');
        setLoading(false);
        return;
      }

      if (isSignUp) {
        if (!name) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }

        // Create user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update profile with name
        await updateProfile(userCredential.user, {
          displayName: name
        });

        setSuccessMessage('Account created successfully!');
        console.log('User created successfully:', userCredential.user);
        onLoginSuccess(userCredential.user);
        onClose();
      } else {
        // Sign in
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setSuccessMessage('Signed in successfully!');
        console.log('User signed in successfully:', userCredential.user);
        onLoginSuccess(userCredential.user);
        onClose();
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-900 text-gray-200 rounded-2xl w-full max-w-md p-8 relative">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-6">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 text-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Success message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-500/20 text-green-200 rounded-lg flex items-start gap-2">
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p>{successMessage}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="University Email"
              className="w-full bg-gray-800 text-gray-200 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-gray-800 text-gray-200 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {isSignUp && (
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full bg-gray-800 text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 font-medium transition-colors flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <LoadingSpinner className="w-6 h-6" />
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        {/* Toggle Sign In/Sign Up */}
        <p className="mt-4 text-center text-gray-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setSuccessMessage('');
            }}
            className="text-blue-500 hover:text-blue-400"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;