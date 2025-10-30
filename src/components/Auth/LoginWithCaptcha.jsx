// Este componente integra reCAPTCHA v3 con el formulario de login
import React, { useState } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export default function LoginWithCaptcha({ onSubmit }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!executeRecaptcha) {
      console.error('reCAPTCHA no está disponible');
      return;
    }

    try {
      const captchaToken = await executeRecaptcha('login');
      onSubmit({ ...form, captchaToken });
    } catch (error) {
      console.error('Error al ejecutar reCAPTCHA:', error);
      alert('Error al verificar reCAPTCHA. Por favor, intenta de nuevo.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-group">
        <input 
          name="email" 
          type="email" 
          placeholder="Correo" 
          value={form.email} 
          onChange={handleChange} 
          required 
          className="form-control"
        />
      </div>
      <div className="form-group">
        <input 
          name="password" 
          type="password" 
          placeholder="Contraseña" 
          value={form.password} 
          onChange={handleChange} 
          required 
          className="form-control"
        />
      </div>
      <button type="submit" className="btn btn-primary">
        Iniciar sesión
      </button>
    </form>
  );
}
